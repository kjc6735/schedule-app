import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { BASE_URL, defaultThresholds, defaultStages, authHeaders } from './config.js';
import { loginAsAdmin, loginAsWorker, setupTestUsers } from './helpers/auth.js';

export const options = {
  stages: defaultStages,
  thresholds: defaultThresholds,
};

export function setup() {
  setupTestUsers();

  const adminToken = loginAsAdmin();
  const workerToken = loginAsWorker();

  if (!adminToken) throw new Error('Admin login failed in setup');
  if (!workerToken) throw new Error('Worker login failed in setup');

  // Create a product + packaging spec for production plans
  const adminOpts = authHeaders(adminToken);
  const productRes = http.post(
    `${BASE_URL}/products`,
    JSON.stringify({
      name: `k6-plan-product-${Date.now()}`,
      packagingSpecs: [{ name: '500g', gramPerPack: 500 }],
    }),
    adminOpts,
  );

  let productId = null;
  let packagingSpecId = null;

  if (productRes.status === 201) {
    productId = productRes.json().id;
    // Get packaging specs for this product
    const specsRes = http.get(
      `${BASE_URL}/products/${productId}/packaging-specs`,
      adminOpts,
    );
    if (specsRes.status === 200) {
      const specs = specsRes.json();
      if (specs.length > 0) {
        packagingSpecId = specs[0].id;
      }
    }
  }

  return { adminToken, workerToken, productId, packagingSpecId };
}

export default function (data) {
  const adminOpts = authHeaders(data.adminToken);
  const workerOpts = authHeaders(data.workerToken);
  const { productId, packagingSpecId } = data;

  if (!productId || !packagingSpecId) {
    console.error('Setup data missing: productId or packagingSpecId');
    return;
  }

  let planId;

  group('Admin CRUD', () => {
    // POST /production-plans - Create plan
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const createRes = http.post(
      `${BASE_URL}/production-plans`,
      JSON.stringify({
        productionDate: tomorrow.toISOString(),
        productId,
        packagingSpecId,
        targetAmountGram: 10000,
        memo: 'k6 load test',
      }),
      adminOpts,
    );

    check(createRes, {
      'create plan status is 201': (r) => r.status === 201,
      'create plan returns id': (r) => r.json().id !== undefined,
    });

    if (createRes.status === 201) {
      planId = createRes.json().id;
    }

    sleep(0.5);

    if (!planId) return;

    // PATCH /production-plans/:id - Update plan
    const updateRes = http.patch(
      `${BASE_URL}/production-plans/${planId}`,
      JSON.stringify({ targetAmountGram: 20000, memo: 'updated by k6' }),
      adminOpts,
    );

    check(updateRes, {
      'update plan status is 200': (r) => r.status === 200,
    });

    sleep(0.5);
  });

  group('Worker read', () => {
    // GET /production-plans - List plans
    const listRes = http.get(
      `${BASE_URL}/production-plans?page=1&take=10`,
      workerOpts,
    );

    check(listRes, {
      'worker list plans status is 200': (r) => r.status === 200,
      'worker list plans returns array': (r) => Array.isArray(r.json()),
    });

    sleep(0.5);

    // GET /production-plans/:id - Get plan by ID
    if (planId) {
      const getRes = http.get(
        `${BASE_URL}/production-plans/${planId}`,
        workerOpts,
      );

      check(getRes, {
        'worker get plan status is 200': (r) => r.status === 200,
        'worker get plan returns correct id': (r) => r.json().id === planId,
      });
    }

    sleep(0.5);
  });

  group('Worker denied write', () => {
    // POST /production-plans - Worker should be denied
    const deniedOpts = Object.assign({}, workerOpts, {
      responseCallback: http.expectedStatuses(401, 403),
    });

    const createRes = http.post(
      `${BASE_URL}/production-plans`,
      JSON.stringify({
        productionDate: new Date().toISOString(),
        productId,
        packagingSpecId,
        targetAmountGram: 5000,
      }),
      deniedOpts,
    );

    check(createRes, {
      'worker create plan denied': (r) => r.status === 403 || r.status === 401,
    });

    sleep(0.5);
  });

  // Cleanup: delete plan
  if (planId) {
    group('Admin cleanup', () => {
      const delRes = http.del(
        `${BASE_URL}/production-plans/${planId}`,
        null,
        adminOpts,
      );

      check(delRes, {
        'delete plan status is 200': (r) => r.status === 200,
      });
    });
  }

  sleep(1);
}

export function teardown(data) {
  // Cleanup: delete the test product
  if (data.productId) {
    const adminOpts = authHeaders(data.adminToken);
    http.del(`${BASE_URL}/products/${data.productId}`, null, adminOpts);
  }
}

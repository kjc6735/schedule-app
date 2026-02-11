import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { BASE_URL, defaultThresholds, authHeaders, jsonHeaders, TEST_USERS } from './config.js';
import { loginAsAdmin, loginAsWorker, setupTestUsers } from './helpers/auth.js';

export const options = {
  scenarios: {
    auth_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 5 },
        { duration: '1m', target: 5 },
        { duration: '10s', target: 0 },
      ],
      exec: 'authScenario',
    },
    read_operations: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '10s', target: 0 },
      ],
      exec: 'readScenario',
    },
    admin_operations: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 3 },
        { duration: '1m', target: 3 },
        { duration: '10s', target: 0 },
      ],
      exec: 'adminScenario',
    },
  },
  thresholds: defaultThresholds,
};

export function setup() {
  setupTestUsers();

  const adminToken = loginAsAdmin();
  const workerToken = loginAsWorker();

  if (!adminToken) throw new Error('Admin login failed in setup');
  if (!workerToken) throw new Error('Worker login failed in setup');

  // Create a product for production plan tests
  const adminOpts = authHeaders(adminToken);
  const productRes = http.post(
    `${BASE_URL}/products`,
    JSON.stringify({
      name: `k6-full-product-${Date.now()}`,
      packagingSpecs: [{ name: '500g', gramPerPack: 500 }],
    }),
    adminOpts,
  );

  let productId = null;
  let packagingSpecId = null;

  if (productRes.status === 201) {
    productId = productRes.json().id;
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

// Scenario 1: Authentication flow (high frequency)
export function authScenario() {
  const payload = JSON.stringify({
    userId: TEST_USERS.admin.userId,
    password: TEST_USERS.admin.password,
  });

  const res = http.post(`${BASE_URL}/auth/login`, payload, jsonHeaders());

  check(res, {
    '[auth] login status is 201': (r) => r.status === 200,
    '[auth] has accessToken': (r) => {
      const body = r.json();
      return body && typeof body.accessToken === 'string';
    },
  });

  sleep(1);
}

// Scenario 2: Read operations (highest frequency)
export function readScenario(data) {
  const workerOpts = authHeaders(data.workerToken);

  group('read products', () => {
    const res = http.get(`${BASE_URL}/products?page=1&take=10`, workerOpts);
    check(res, {
      '[read] list products status is 200': (r) => r.status === 200,
    });
  });

  sleep(0.5);

  group('read production plans', () => {
    const res = http.get(
      `${BASE_URL}/production-plans?page=1&take=10`,
      workerOpts,
    );
    check(res, {
      '[read] list plans status is 200': (r) => r.status === 200,
    });
  });

  sleep(0.5);

  group('read leaves', () => {
    const today = new Date();
    const start = formatDate(today);
    const future = new Date(today);
    future.setDate(future.getDate() + 30);
    const end = formatDate(future);

    const res = http.get(
      `${BASE_URL}/leaves?start=${start}&end=${end}`,
      workerOpts,
    );
    check(res, {
      '[read] list leaves status is 200': (r) => r.status === 200,
    });
  });

  sleep(1);
}

// Scenario 3: Admin CUD operations (low frequency)
export function adminScenario(data) {
  const adminOpts = authHeaders(data.adminToken);
  const { productId, packagingSpecId } = data;

  if (!productId || !packagingSpecId) return;

  group('admin product operations', () => {
    // Create a product
    const createRes = http.post(
      `${BASE_URL}/products`,
      JSON.stringify({
        name: `k6-admin-${Date.now()}`,
        packagingSpecs: [{ name: '250g', gramPerPack: 250 }],
      }),
      adminOpts,
    );

    check(createRes, {
      '[admin] create product status is 201': (r) => r.status === 201,
    });

    if (createRes.status === 201) {
      const newProductId = createRes.json().id;

      // Delete the product
      const delRes = http.del(
        `${BASE_URL}/products/${newProductId}`,
        null,
        adminOpts,
      );
      check(delRes, {
        '[admin] delete product status is 200': (r) => r.status === 200,
      });
    }
  });

  sleep(0.5);

  group('admin plan operations', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const createRes = http.post(
      `${BASE_URL}/production-plans`,
      JSON.stringify({
        productionDate: tomorrow.toISOString(),
        productId,
        packagingSpecId,
        targetAmountGram: 15000,
        memo: 'k6 full scenario',
      }),
      adminOpts,
    );

    check(createRes, {
      '[admin] create plan status is 201': (r) => r.status === 201,
    });

    if (createRes.status === 201) {
      const planId = createRes.json().id;

      // Update
      const updateRes = http.patch(
        `${BASE_URL}/production-plans/${planId}`,
        JSON.stringify({ targetAmountGram: 25000 }),
        adminOpts,
      );
      check(updateRes, {
        '[admin] update plan status is 200': (r) => r.status === 200,
      });

      sleep(0.3);

      // Delete
      const delRes = http.del(
        `${BASE_URL}/production-plans/${planId}`,
        null,
        adminOpts,
      );
      check(delRes, {
        '[admin] delete plan status is 200': (r) => r.status === 200,
      });
    }
  });

  sleep(1);
}

export function teardown(data) {
  if (data.productId) {
    const adminOpts = authHeaders(data.adminToken);
    http.del(`${BASE_URL}/products/${data.productId}`, null, adminOpts);
  }
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { BASE_URL, defaultThresholds, defaultStages, authHeaders } from './config.js';
import { loginAsAdmin, setupTestUsers } from './helpers/auth.js';

export const options = {
  stages: defaultStages,
  thresholds: defaultThresholds,
};

export function setup() {
  setupTestUsers();
  const adminToken = loginAsAdmin();
  if (!adminToken) {
    throw new Error('Admin login failed in setup');
  }
  return { adminToken };
}

export default function (data) {
  const opts = authHeaders(data.adminToken);
  let productId;
  let packagingSpecId;

  group('Product CRUD flow', () => {
    // POST /products - Create product
    const createRes = http.post(
      `${BASE_URL}/products`,
      JSON.stringify({
        name: `k6-product-${Date.now()}`,
        packagingSpecs: [
          { name: '500g pack', gramPerPack: 500 },
        ],
      }),
      opts,
    );

    check(createRes, {
      'create product status is 201': (r) => r.status === 201,
      'create product returns id': (r) => r.json().id !== undefined,
    });

    if (createRes.status === 201) {
      productId = createRes.json().id;
    }

    sleep(0.5);

    // GET /products - List products
    const listRes = http.get(`${BASE_URL}/products?page=1&take=10`, opts);

    check(listRes, {
      'list products status is 200': (r) => r.status === 200,
      'list products returns array': (r) => Array.isArray(r.json()),
    });

    sleep(0.5);

    if (!productId) return;

    // GET /products/:id - Get product by ID
    const getRes = http.get(`${BASE_URL}/products/${productId}`, opts);

    check(getRes, {
      'get product status is 200': (r) => r.status === 200,
      'get product returns correct id': (r) => r.json().id === productId,
    });

    sleep(0.5);

    // POST /products/:id/packaging-specs - Add packaging spec
    const specRes = http.post(
      `${BASE_URL}/products/${productId}/packaging-specs`,
      JSON.stringify({ name: '1kg pack', gramPerPack: 1000 }),
      opts,
    );

    check(specRes, {
      'create packaging spec status is 201': (r) => r.status === 201,
      'create packaging spec returns id': (r) => r.json().id !== undefined,
    });

    if (specRes.status === 201) {
      packagingSpecId = specRes.json().id;
    }

    sleep(0.5);

    // GET /products/:id/packaging-specs - List packaging specs
    const specsListRes = http.get(
      `${BASE_URL}/products/${productId}/packaging-specs`,
      opts,
    );

    check(specsListRes, {
      'list packaging specs status is 200': (r) => r.status === 200,
      'list packaging specs returns array': (r) => Array.isArray(r.json()),
    });

    sleep(0.5);

    // Cleanup: DELETE all packaging specs for this product
    const allSpecsRes = http.get(
      `${BASE_URL}/products/${productId}/packaging-specs`,
      opts,
    );
    if (allSpecsRes.status === 200) {
      const allSpecs = allSpecsRes.json();
      if (Array.isArray(allSpecs)) {
        for (const spec of allSpecs) {
          http.del(`${BASE_URL}/packaging-specs/${spec.id}`, null, opts);
        }
      }
    }

    // Cleanup: DELETE product
    const delRes = http.del(`${BASE_URL}/products/${productId}`, null, opts);

    check(delRes, {
      'delete product status is 200': (r) => r.status === 200,
    });
  });

  sleep(1);
}

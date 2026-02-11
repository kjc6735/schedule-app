export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const defaultThresholds = {
  http_req_duration: ['p(95)<500'],
  http_req_failed: ['rate<0.01'],
};

export const defaultStages = [
  { duration: '30s', target: 10 },
  { duration: '1m', target: 10 },
  { duration: '10s', target: 0 },
];

export const TEST_USERS = {
  admin: {
    userId: __ENV.ADMIN_USER_ID || 'k6admin',
    password: __ENV.ADMIN_PASSWORD || 'admin1234',
    name: 'K6 Admin',
    gender: 'male',
    phone: '01000000001',
    role: 'owner',
  },
  worker: {
    userId: __ENV.WORKER_USER_ID || 'k6worker',
    password: __ENV.WORKER_PASSWORD || 'worker1234',
    name: 'K6 Worker',
    gender: 'male',
    phone: '01000000002',
    role: 'worker',
  },
};

export function authHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

export function jsonHeaders() {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
  };
}

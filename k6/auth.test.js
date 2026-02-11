import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, defaultThresholds, defaultStages, TEST_USERS, jsonHeaders } from './config.js';
import { setupTestUsers } from './helpers/auth.js';

export const options = {
  stages: defaultStages,
  thresholds: defaultThresholds,
};

export function setup() {
  setupTestUsers();
}

export default function () {
  const payload = JSON.stringify({
    userId: TEST_USERS.admin.userId,
    password: TEST_USERS.admin.password,
  });

  const res = http.post(`${BASE_URL}/auth/login`, payload, jsonHeaders());

  check(res, {
    'login status is 201': (r) => r.status === 201,
    'response has accessToken': (r) => {
      const body = r.json();
      return body && typeof body.accessToken === 'string' && body.accessToken.length > 0;
    },
  });

  sleep(1);
}

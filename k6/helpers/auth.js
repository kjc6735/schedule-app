import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, TEST_USERS, jsonHeaders } from '../config.js';

export function setupTestUsers() {
  registerUser(TEST_USERS.admin);
  registerUser(TEST_USERS.worker);
}

function registerUser(user) {
  const opts = Object.assign({}, jsonHeaders(), {
    responseCallback: http.expectedStatuses(201, 400, 401, 409),
  });

  const res = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({
      userId: user.userId,
      password: user.password,
      passwordConfirm: user.password,
      name: user.name,
      gender: user.gender,
      phone: user.phone,
      role: user.role,
    }),
    opts,
  );

  // 201 = created, 409/400 = already exists → both OK
  if (res.status === 201) {
    console.log(`Registered user: ${user.userId}`);
  } else {
    console.log(`User ${user.userId} already exists (${res.status})`);
  }
}

export function loginAsAdmin() {
  return login(TEST_USERS.admin.userId, TEST_USERS.admin.password);
}

export function loginAsWorker() {
  return login(TEST_USERS.worker.userId, TEST_USERS.worker.password);
}

function login(userId, password) {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ userId, password }),
    jsonHeaders(),
  );

  const success = check(res, {
    'login status is 201': (r) => r.status === 201,
    'login returns accessToken': (r) => {
      const body = r.json();
      return body && body.accessToken !== undefined;
    },
  });

  if (!success) {
    console.error(`Login failed for ${userId}: ${res.status} ${res.body}`);
    return null;
  }

  return res.json().accessToken;
}

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

  return { adminToken, workerToken };
}

export default function (data) {
  const adminOpts = authHeaders(data.adminToken);
  const workerOpts = authHeaders(data.workerToken);

  // NOTE: POST /leaves is not implemented, so we only test existing endpoints

  group('Read leaves', () => {
    // GET /leaves?start&end - List leaves by date range
    const today = new Date();
    const start = formatDate(today);
    const future = new Date(today);
    future.setDate(future.getDate() + 30);
    const end = formatDate(future);

    const listRes = http.get(
      `${BASE_URL}/leaves?start=${start}&end=${end}`,
      workerOpts,
    );

    check(listRes, {
      'list leaves status is 200': (r) => r.status === 200,
      'list leaves returns array': (r) => Array.isArray(r.json()),
    });

    sleep(0.5);

    // Try to get a specific leave if the list has results
    const leaves = listRes.json();
    if (Array.isArray(leaves) && leaves.length > 0) {
      const leaveId = leaves[0].id;

      // GET /leaves/:id - Get leave by ID
      const getRes = http.get(`${BASE_URL}/leaves/${leaveId}`, workerOpts);

      check(getRes, {
        'get leave status is 200': (r) => r.status === 200,
        'get leave returns correct id': (r) => r.json().id === leaveId,
      });

      sleep(0.5);
    }
  });

  group('Admin status update', () => {
    // First get a leave to update
    const today = new Date();
    const start = formatDate(today);
    const future = new Date(today);
    future.setDate(future.getDate() + 30);
    const end = formatDate(future);

    const listRes = http.get(
      `${BASE_URL}/leaves?start=${start}&end=${end}`,
      adminOpts,
    );

    const leaves = listRes.json();
    if (Array.isArray(leaves) && leaves.length > 0) {
      const leaveId = leaves[0].id;

      // PATCH /leaves/:id/status - Admin updates leave status
      const statusRes = http.patch(
        `${BASE_URL}/leaves/${leaveId}/status`,
        JSON.stringify({ status: 'approved' }),
        adminOpts,
      );

      check(statusRes, {
        'admin update leave status is 200': (r) => r.status === 200,
      });

      sleep(0.5);
    }
  });

  sleep(1);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

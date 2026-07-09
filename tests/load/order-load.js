import k6 from 'k6';
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 500 },
    { duration: '2m', target: 1000 },
    { duration: '3m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:4000/v1';
const TENANT_ID = 'default-tenant';

export default function () {
  const headers = { 'X-Tenant-Id': TENANT_ID };

  const catalogRes = http.get(`${BASE_URL}/catalog/tank-sizes`, { headers });
  check(catalogRes, { 'catalog status 200': (r) => r.status === 200 });

  const tenantsRes = http.get(`${BASE_URL}/tenants/public`);
  check(tenantsRes, { 'tenants status 200': (r) => r.status === 200 });

  sleep(1);
}

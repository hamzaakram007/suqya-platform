#!/usr/bin/env node
/**
 * Smoke: driver REST location → Socket.io /tracking → customer location_update
 *
 * Env:
 *   API_BASE (default http://localhost:4000/v1)
 *   TENANT_ID (default default-tenant)
 *   OTP_SANDBOX_CODE (default 123456)
 *   TRACK_ORDER_ID (optional — otherwise picks a customer order)
 */
import { io } from 'socket.io-client';

const API_BASE = process.env.API_BASE || 'http://localhost:4000/v1';
const TENANT_ID = process.env.TENANT_ID || 'default-tenant';
const OTP = process.env.OTP_SANDBOX_CODE || '123456';
const CUSTOMER_PHONE = process.env.E2E_CUSTOMER_PHONE || '+966504567890';
const DRIVER_PHONE = process.env.E2E_DRIVER_PHONE || '+966503456789';

function originFromApiBase(base) {
  const u = new URL(base);
  u.pathname = '';
  u.search = '';
  return u.toString().replace(/\/$/, '');
}

const ORIGIN = process.env.API_ORIGIN || originFromApiBase(API_BASE);

async function auth(phone) {
  await fetch(`${API_BASE}/auth/otp/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': TENANT_ID,
    },
    body: JSON.stringify({ phone }),
  });
  const res = await fetch(`${API_BASE}/auth/otp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': TENANT_ID,
    },
    body: JSON.stringify({ phone, code: OTP }),
  });
  const body = await res.json();
  if (!res.ok || !body.accessToken) {
    throw new Error(`auth failed for ${phone}: ${JSON.stringify(body)}`);
  }
  return body.accessToken;
}

async function main() {
  console.log(`==> Tracking smoke against ${API_BASE} (ws ${ORIGIN}/tracking)`);
  const customerToken = await auth(CUSTOMER_PHONE);
  const driverToken = await auth(DRIVER_PHONE);
  console.log('    auth ok');

  let orderId = process.env.TRACK_ORDER_ID || '';
  if (!orderId) {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: {
        Authorization: `Bearer ${customerToken}`,
        'X-Tenant-Id': TENANT_ID,
      },
    });
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.items || data.data || [];
    const trackable = new Set(['accepted', 'filling', 'in_transit']);
    const hit = items.find((o) => trackable.has(o.status)) || items[0];
    orderId = hit?.id || '';
  }

  if (!orderId) {
    console.error(
      'No customer orders found. Run npm run e2e:foundation first (or set TRACK_ORDER_ID).',
    );
    process.exit(1);
  }
  console.log(`    order=${orderId}`);

  const LAT = 24.7155;
  const LNG = 46.677;

  const socket = io(`${ORIGIN}/tracking`, {
    transports: ['websocket'],
    auth: { token: customerToken },
  });

  const locationPromise = new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error('timeout waiting for location_update')),
      12000,
    );
    socket.on('location_update', (payload) => {
      // Ignore seed ping from subscribe (may be previous coords)
      if (
        payload?.orderId === orderId &&
        Number(payload.latitude) === LAT &&
        Number(payload.longitude) === LNG
      ) {
        clearTimeout(t);
        resolve(payload);
      }
    });
    socket.on('connect_error', (e) => {
      clearTimeout(t);
      reject(e);
    });
  });

  await new Promise((resolve, reject) => {
    socket.on('connect', resolve);
    socket.on('connect_error', reject);
    setTimeout(() => reject(new Error('socket connect timeout')), 8000);
  });

  const sub = await new Promise((resolve) => {
    socket.emit('subscribe_order', orderId, (ack) => resolve(ack));
  });
  if (sub?.error) {
    throw new Error(`subscribe failed: ${JSON.stringify(sub)}`);
  }

  const restRes = await fetch(`${API_BASE}/drivers/location`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${driverToken}`,
      'X-Tenant-Id': TENANT_ID,
    },
    body: JSON.stringify({ latitude: LAT, longitude: LNG, orderId }),
  });
  const restBody = await restRes.json();
  if (!restRes.ok) {
    throw new Error(
      `REST location failed: ${restRes.status} ${JSON.stringify(restBody)}`,
    );
  }

  const update = await locationPromise;
  console.log(
    JSON.stringify(
      { subscribe: sub, rest: restBody, location_update: update },
      null,
      2,
    ),
  );
  socket.close();
  console.log('OK tracking smoke passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

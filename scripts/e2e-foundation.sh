#!/usr/bin/env bash
# Foundation vertical slice — API-level E2E against a running Suqya API + seeded DB.
#
# Prerequisites (local compose):
#   docker compose -f infra/docker/docker-compose.yml up -d
#   cp apps/api/.env.example apps/api/.env   # ports 5433/6380
#   npm install && npm run db:migrate && npm run db:seed
#   NOTIFICATION_INLINE=true OTP_MODE=sandbox PAYMENT_MODE=sandbox npm run dev:api
#
# Usage:
#   API_BASE=http://localhost:4000/v1 TENANT_ID=default-tenant npm run e2e:foundation
#
# Walks: OTP → address → create order → supplier accept/dispatch → driver accept →
#        filling → in_transit → POD → card sandbox capture → invoice PDF/QR
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:4000/v1}"
TENANT_ID="${TENANT_ID:-default-tenant}"
OTP="${OTP_SANDBOX_CODE:-123456}"
CUSTOMER_PHONE="${E2E_CUSTOMER_PHONE:-+966504567890}"
DRIVER_PHONE="${E2E_DRIVER_PHONE:-+966503456789}"
SUPPLIER_PHONE="${E2E_SUPPLIER_PHONE:-+966502345678}"

json_field() {
  local json="$1" key="$2"
  node -e "const d=JSON.parse(process.argv[1]); const v=d[process.argv[2]]; process.stdout.write(v==null?'':String(v))" "$json" "$key"
}

auth() {
  local phone="$1"
  curl -fsS -X POST "${API_BASE}/auth/otp/send" \
    -H "Content-Type: application/json" \
    -H "X-Tenant-Id: ${TENANT_ID}" \
    -d "{\"phone\":\"${phone}\"}" >/tmp/suqya-e2e-otp-send.json
  local out
  out=$(curl -fsS -X POST "${API_BASE}/auth/otp/verify" \
    -H "Content-Type: application/json" \
    -H "X-Tenant-Id: ${TENANT_ID}" \
    -d "{\"phone\":\"${phone}\",\"code\":\"${OTP}\"}")
  echo "$out" >"/tmp/suqya-e2e-auth-${phone}.json"
  json_field "$out" accessToken
}

echo "==> Health"
curl -fsS "${API_BASE}/health" | tee /tmp/suqya-e2e-health.json
echo

echo "==> Auth customer + driver + supplier (sandbox OTP ${OTP})"
CUSTOMER_TOKEN=$(auth "$CUSTOMER_PHONE")
DRIVER_TOKEN=$(auth "$DRIVER_PHONE")
SUPPLIER_TOKEN=$(auth "$SUPPLIER_PHONE")
test -n "$CUSTOMER_TOKEN"
test -n "$DRIVER_TOKEN"
test -n "$SUPPLIER_TOKEN"
echo "tokens ok"

echo "==> Ensure driver online + GPS (Riyadh)"
curl -fsS -X PATCH "${API_BASE}/drivers/status" \
  -H "Authorization: Bearer ${DRIVER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: ${TENANT_ID}" \
  -d '{"isOnline":true}' >/tmp/suqya-e2e-driver-online.json
curl -fsS -X POST "${API_BASE}/drivers/location" \
  -H "Authorization: Bearer ${DRIVER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: ${TENANT_ID}" \
  -d '{"latitude":24.7136,"longitude":46.6753}' >/tmp/suqya-e2e-driver-loc.json

echo "==> Customer address"
ADDR=$(curl -fsS -X POST "${API_BASE}/customers/addresses" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: ${TENANT_ID}" \
  -d '{"label":"E2E Home","buildingNumber":"1234","street":"King Fahd Rd","latitude":24.7200,"longitude":46.6800,"isDefault":true}')
echo "$ADDR" | tee /tmp/suqya-e2e-address.json >/dev/null
ADDRESS_ID=$(json_field "$ADDR" id)
test -n "$ADDRESS_ID"

echo "==> Tank sizes"
TANKS=$(curl -fsS "${API_BASE}/catalog/tank-sizes" -H "X-Tenant-Id: ${TENANT_ID}")
echo "$TANKS" | tee /tmp/suqya-e2e-tanks.json >/dev/null
TANK_ID=$(node -e "const d=JSON.parse(process.argv[1]); process.stdout.write(d[0].id)" "$TANKS")
test -n "$TANK_ID"

echo "==> Create card order (supplier_review)"
ORDER=$(curl -fsS -X POST "${API_BASE}/orders" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: ${TENANT_ID}" \
  -d "{\"addressId\":\"${ADDRESS_ID}\",\"tankSizeId\":\"${TANK_ID}\",\"paymentType\":\"card\",\"slaType\":\"standard\"}")
echo "$ORDER" | tee /tmp/suqya-e2e-order.json >/dev/null
ORDER_ID=$(json_field "$ORDER" id)
test -n "$ORDER_ID"
echo "order=$ORDER_ID"

echo "==> Supplier accept → dispatch assign"
ASSIGN=$(curl -fsS -X POST "${API_BASE}/suppliers/orders/${ORDER_ID}/accept" \
  -H "Authorization: Bearer ${SUPPLIER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: ${TENANT_ID}")
echo "$ASSIGN" | tee /tmp/suqya-e2e-assign.json >/dev/null
DRIVER_ID=$(json_field "$ASSIGN" driverId)
if [ -z "$DRIVER_ID" ]; then
  echo "FAIL: no driver assigned — is seed driver online near Riyadh?"
  cat /tmp/suqya-e2e-assign.json
  exit 1
fi
echo "assigned driver=$DRIVER_ID"

echo "==> Driver accept"
curl -fsS -X POST "${API_BASE}/drivers/jobs/${ORDER_ID}/accept" \
  -H "Authorization: Bearer ${DRIVER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: ${TENANT_ID}" \
  | tee /tmp/suqya-e2e-accept.json

echo "==> Status filling → in_transit"
curl -fsS -X POST "${API_BASE}/drivers/jobs/${ORDER_ID}/status" \
  -H "Authorization: Bearer ${DRIVER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: ${TENANT_ID}" \
  -d '{"status":"filling"}' | tee /tmp/suqya-e2e-filling.json
curl -fsS -X POST "${API_BASE}/drivers/jobs/${ORDER_ID}/status" \
  -H "Authorization: Bearer ${DRIVER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: ${TENANT_ID}" \
  -d '{"status":"in_transit"}' | tee /tmp/suqya-e2e-transit.json

echo "==> POD (sandbox media URLs when omitted)"
curl -fsS -X POST "${API_BASE}/drivers/jobs/${ORDER_ID}/pod" \
  -H "Authorization: Bearer ${DRIVER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: ${TENANT_ID}" \
  -d "{\"otp\":\"${OTP}\"}" | tee /tmp/suqya-e2e-pod.json

echo "==> Card sandbox intent + capture"
INTENT=$(curl -fsS -X POST "${API_BASE}/payments/intent" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: ${TENANT_ID}" \
  -d "{\"orderId\":\"${ORDER_ID}\",\"method\":\"card\"}")
echo "$INTENT" | tee /tmp/suqya-e2e-intent.json >/dev/null
TXN_ID=$(json_field "$INTENT" transactionId)
MODE=$(json_field "$INTENT" mode)
test -n "$TXN_ID"
echo "intent mode=${MODE} txn=${TXN_ID}"

curl -fsS -X POST "${API_BASE}/payments/capture" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: ${TENANT_ID}" \
  -d "{\"transactionId\":\"${TXN_ID}\"}" | tee /tmp/suqya-e2e-capture.json

echo "==> Invoices + document QR + PDF"
INVOICES=$(curl -fsS "${API_BASE}/invoices" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "X-Tenant-Id: ${TENANT_ID}")
echo "$INVOICES" | tee /tmp/suqya-e2e-invoices.json >/dev/null
INV_ID=$(node -e "const d=JSON.parse(process.argv[1]); process.stdout.write(d[0]?d[0].id:'')" "$INVOICES")
test -n "$INV_ID"
DOC=$(curl -fsS "${API_BASE}/invoices/${INV_ID}/document?layout=bilingual" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "X-Tenant-Id: ${TENANT_ID}")
echo "$DOC" | tee /tmp/suqya-e2e-document.json >/dev/null
QR=$(node -e "const d=JSON.parse(process.argv[1]); process.stdout.write((d.qr&&d.qr.value)||'')" "$DOC")
if [ -z "$QR" ]; then
  echo "FAIL: document missing ZATCA QR TLV"
  exit 1
fi
curl -fsS "${API_BASE}/invoices/${INV_ID}/pdf" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "X-Tenant-Id: ${TENANT_ID}" \
  -o /tmp/suqya-e2e-invoice.pdf
node -e "const fs=require('fs'); const p=fs.readFileSync('/tmp/suqya-e2e-invoice.pdf'); if(!String(p.slice(0,5)).startsWith('%PDF-')) process.exit(1); console.log('pdf bytes', p.length)"

ORDER_FINAL=$(curl -fsS "${API_BASE}/orders/${ORDER_ID}" \
  -H "Authorization: Bearer ${CUSTOMER_TOKEN}" \
  -H "X-Tenant-Id: ${TENANT_ID}")
echo "$ORDER_FINAL" | tee /tmp/suqya-e2e-order-final.json >/dev/null
STATUS=$(json_field "$ORDER_FINAL" status)
if [ "$STATUS" != "completed" ]; then
  echo "FAIL: expected completed, got ${STATUS}"
  exit 1
fi

echo
echo "Foundation E2E OK — order=${ORDER_ID} invoice=${INV_ID} status=${STATUS}"
echo "Artifacts under /tmp/suqya-e2e-*"

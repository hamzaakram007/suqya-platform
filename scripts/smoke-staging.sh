#!/usr/bin/env bash
# Smoke-test a deployed Suqya API (health + OTP send + optional verify).
# Usage:
#   API_BASE=https://YOUR-HOST/v1 TENANT_ID=default-tenant ./scripts/smoke-staging.sh
set -euo pipefail

API_BASE="${API_BASE:?Set API_BASE e.g. https://suqya-api-staging.up.railway.app/v1}"
TENANT_ID="${TENANT_ID:-default-tenant}"
PHONE="${SMOKE_PHONE:-+966500000001}"
OTP="${SMOKE_OTP:-123456}"

echo "==> GET ${API_BASE}/health"
curl -fsS "${API_BASE}/health" | tee /tmp/suqya-health.json
echo

echo "==> GET ${API_BASE}/health/ready"
curl -fsS "${API_BASE}/health/ready" | tee /tmp/suqya-ready.json
echo

echo "==> POST ${API_BASE}/auth/otp/send"
curl -fsS -X POST "${API_BASE}/auth/otp/send" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: ${TENANT_ID}" \
  -d "{\"phone\":\"${PHONE}\"}" | tee /tmp/suqya-otp-send.json
echo

if [ "${SKIP_VERIFY:-false}" = "true" ]; then
  echo "SKIP_VERIFY=true — stopping after otp/send"
  exit 0
fi

echo "==> POST ${API_BASE}/auth/otp/verify (dev OTP ${OTP} only when NODE_ENV!=production)"
set +e
VERIFY_OUT=$(curl -sS -X POST "${API_BASE}/auth/otp/verify" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: ${TENANT_ID}" \
  -d "{\"phone\":\"${PHONE}\",\"code\":\"${OTP}\"}")
VERIFY_STATUS=$?
set -e
echo "$VERIFY_OUT" | tee /tmp/suqya-otp-verify.json
echo

if echo "$VERIFY_OUT" | grep -q 'accessToken\|access_token'; then
  echo "Auth smoke: OK (token issued)"
else
  echo "Auth smoke: otp/verify did not return a token."
  echo "On production NODE_ENV the OTP is random (check API logs / SMS)."
  echo "Re-run with SMOKE_OTP=<code> once you have the code."
  exit 1
fi

echo "Smoke complete against ${API_BASE}"

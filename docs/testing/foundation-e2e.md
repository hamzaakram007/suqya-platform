# Foundation E2E vertical slice

**Goal:** Close the Riyadh-ready path in code: OTP → create order → dispatch assign → driver accept → status updates → cash/card sandbox capture → B2C invoice PDF/QR.

## What was de-stubbed

| Area | Before | After |
|------|--------|-------|
| SMS OTP | `console.log` of code | `SmsModule`: sandbox provider (fixed `OTP_SANDBOX_CODE`) or Unifonic when `UNIFONIC_APP_SID` set |
| Notifications | `[FCM]` / `[Unifonic]` log lines | `NotificationDeliveryService` writes delivery metadata on `notification.data`; inline delivery via `NOTIFICATION_INLINE=true` |
| Payments | Fake Moyasar redirect URL when key present | `MoyasarClient` with `PAYMENT_MODE=sandbox` (default when keys are placeholders) + real Moyasar create when keys are real |
| POD | Assumed jump `accepted → delivered` (broken) | `POST /drivers/jobs/:id/status` (`filling` / `in_transit`); POD requires filling/in_transit; sandbox media URLs when omitted |
| Invoice | HTML only, QR not exposed on document | ZATCA TLV QR on document payload + minimal PDF (`GET /invoices/:id/pdf`) |
| Dispatch | Supplier accept set status outside state machine | Idempotent `assignDriver`; supplier accept sets `supplierId` then assigns |

## Env flags

| Variable | Purpose |
|----------|---------|
| `OTP_MODE` | `auto` / `sandbox` / `live` |
| `OTP_SANDBOX_CODE` | Fixed code (default `123456`) |
| `OTP_EXPOSE_IN_RESPONSE` | Include `sandboxCode` in send OTP response |
| `SMS_PROVIDER` | `auto` / `sandbox` / `unifonic` |
| `PAYMENT_MODE` | `auto` / `sandbox` / `moyasar` |
| `POD_MODE` | `sandbox` synthesizes `sandbox://pod/...` media |
| `PUSH_PROVIDER` | `auto` / `sandbox` / `fcm` |
| `NOTIFICATION_INLINE` | Deliver without BullMQ worker (local E2E) |

## Run locally

```bash
docker compose -f infra/docker/docker-compose.yml up -d
cp apps/api/.env.example apps/api/.env
npm install
npm run db:migrate
npm run db:seed
NOTIFICATION_INLINE=true OTP_MODE=sandbox PAYMENT_MODE=sandbox npm run dev:api

# another terminal
API_BASE=http://localhost:4000/v1 TENANT_ID=default-tenant npm run e2e:foundation
```

Seeded phones (OTP `123456` in sandbox): customer `+966504567890`, driver `+966503456789`, supplier `+966502345678`.

Unit coverage for the path contract: `npm run test -w @suqya/api` (includes `foundation-path.spec.ts`).

## Live staging blockers

- Public API host still needs Railway provision (`RAILWAY_TOKEN`) — see `docs/deployment/staging-api.md`
- Real SMS: set `UNIFONIC_APP_SID` + `SMS_PROVIDER=unifonic` (and prefer `OTP_MODE=live` only after that)
- Real card: Moyasar `sk_test_…` / `pk_test_…` + `PAYMENT_MODE=moyasar`
- ZATCA Fatoora HTTP: `ZATCA_SANDBOX_URL` + `ZATCA_API_TOKEN` (TLV QR already works offline)
- Push: FCM HTTP sender still not wired beyond sandbox bookkeeping
- Maps / live tracking: see `docs/testing/maps-tracking.md` (roadmap step 3)

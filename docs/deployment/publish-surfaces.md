# Publish surfaces — production runbook

**Goal:** Production API (Railway), production Vercel admin/supplier, and first mobile store tracks (Play internal + TestFlight).  
**Status:** In-repo prep only. **No apps are live in stores.** No production API URL exists yet — do not invent one.  
**Prereq:** Staging path green first ([`staging-api.md`](./staging-api.md)) — health, `e2e:foundation`, `db:seed:pilot`, auth smoke.  
**Related:** Store listing stubs in [`store/`](../../store/README.md) · Flutter release helpers in [`mobile/release/`](../../mobile/release/README.md)

---

## Honest starting point (2026-11-07)

| Surface | Today | Publish path |
|---------|-------|--------------|
| Admin | Live shell on Vercel (`admin-web-psi-sepia.vercel.app`) | Point `NEXT_PUBLIC_API_URL` at **production** API |
| Supplier | Live shell on Vercel (`supplier-web-one.vercel.app`) | Same |
| API / worker | Scaffold only (`railway.toml`); **no public host** | Separate Railway **production** project (or promote staging → prod) |
| Customer / Driver Flutter | Dart sources only — **no `android/` / `ios/` folders yet** | `flutter create .` → release builds → Play internal / TestFlight |

Agent CLIs: `vercel` and `railway` were **logged out** in the publish agent environment. Owner must authenticate locally or supply tokens.

---

## 0. Blocker checklist (owner)

Complete before claiming any surface is “published”:

| # | Account / secret | Needed for |
|---|------------------|------------|
| 1 | `RAILWAY_TOKEN` or `railway login` | Production (and staging) API + Postgres + Redis |
| 2 | Strong prod `JWT_SECRET` (≠ staging; `openssl rand -base64 48`) | API boot in `NODE_ENV=production` |
| 3 | `VERCEL_TOKEN` or `vercel login` | Set production env on admin + supplier |
| 4 | Google Play Console (org + app) | Customer + driver Android internal track |
| 5 | Apple Developer + App Store Connect | TestFlight / App Store |
| 6 | `GOOGLE_MAPS_API_KEY` (+ Android/iOS restrictions) | Real map tiles; native embeds after `flutter create` |
| 7 | Moyasar **live** keys (`pk_live_*` / `sk_live_*`) + webhook secret | Real card payments (keep sandbox until pilot pays) |
| 8 | SMS (`UNIFONIC_APP_SID` or equivalent) + `OTP_MODE=live` | Real OTP (never expose codes in prod) |
| 9 | Optional: ZATCA prod / Fatoora, FCM, custom domain `api.suqya.sa` | Compliance + push + branded API |

Copy names only into dashboards — never commit values.

---

## 1. Railway — staging → production

Use **two Railway projects** (recommended): `suqya-staging` and `suqya-production`. Same `railway.toml` / Dockerfile; different secrets and databases.

### 1a. If staging is not up yet

Follow [`staging-api.md`](./staging-api.md) first. Exit criteria: public `https://…/v1`, `smoke:staging` green, Vercel preview/staging wired.

### 1b. Production project (copy-paste)

```bash
npm i -g @railway/cli
railway login   # or: export RAILWAY_TOKEN=...

cd /path/to/suqya-platform   # on master after merge
railway init                 # create project "suqya-production" (do not reuse staging DB)
railway add --database postgres
railway add --database redis

# API service variables — production values only
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="$(openssl rand -base64 48)"   # never reuse staging
railway variables set CORS_ORIGINS="https://admin-web-psi-sepia.vercel.app,https://supplier-web-one.vercel.app"
# When custom domains exist, replace CORS_ORIGINS with those origins.
railway variables set PAYMENT_CALLBACK_URL="https://admin-web-psi-sepia.vercel.app/payment/callback"
railway variables set OTP_MODE=live                 # only after Unifonic ready
railway variables set OTP_EXPOSE_IN_RESPONSE=false  # mandatory for prod
railway variables set PAYMENT_MODE=live             # only after Moyasar live keys
railway variables set SMS_PROVIDER=unifonic
# railway variables set UNIFONIC_APP_SID=...
# railway variables set MOYASAR_PUBLISHABLE_KEY=pk_live_...
# railway variables set MOYASAR_SECRET_KEY=sk_live_...
# railway variables set MOYASAR_WEBHOOK_SECRET=...

railway up
railway domain
export API_BASE="https://<service>.up.railway.app/v1"
```

Worker service (same image): set `WORKER_MODE=true` plus the same `DATABASE_URL` / `REDIS_URL` / `JWT_SECRET`.

Migrate runs via `railway.toml` `releaseCommand`. Seed carefully:

```bash
# Prefer pilot seed only when intentionally loading demo fleet — not for public prod.
# DATABASE_URL=<prod> npm run db:seed:pilot
DATABASE_URL=<prod> npm run db:seed   # minimal; or run once via railway run
```

Smoke:

```bash
API_BASE="$API_BASE" TENANT_ID=default-tenant npm run smoke:staging
# After Foundation keys: API_BASE="$API_BASE" npm run e2e:foundation
```

Env name reference: [`apps/api/.env.production.example`](../../apps/api/.env.production.example).

### 1c. Promote staging → prod (alternative)

If you prefer a single project for early pilot:

1. Snapshot / export staging Postgres (or accept wipe).  
2. Rotate `JWT_SECRET`, disable `OTP_EXPOSE_IN_RESPONSE`, switch Moyasar/SMS to live.  
3. Treat the public Railway URL as production and update Vercel + Flutter defines.  
4. Still plan a clean `suqya-production` project before public launch.

**Do not** invent `https://api.suqya.sa` until DNS + cert + Railway custom domain are configured by the owner.

---

## 2. Vercel — admin + supplier (production)

Live project hosts today (do not rename casually):

| App | Host | Local config |
|-----|------|--------------|
| Admin | `admin-web-psi-sepia.vercel.app` | `vercel.admin.json` |
| Supplier | `supplier-web-one.vercel.app` | `vercel.supplier.json` |

### Env vars (Production + Preview)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://<prod-railway-host>/v1` (real URL only) |
| `NEXT_PUBLIC_TENANT_ID` | `default-tenant` (or prod tenant id after seed) |
| Optional `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Browser-restricted Maps key |

### Commands (after `vercel login`)

```bash
npx vercel login

# Admin
npx vercel link --yes --project admin-web
npx vercel env add NEXT_PUBLIC_API_URL production   # paste real API_BASE
npx vercel env add NEXT_PUBLIC_TENANT_ID production
npx vercel env add NEXT_PUBLIC_API_URL preview
npx vercel env add NEXT_PUBLIC_TENANT_ID preview
npx vercel deploy --prod --yes --local-config vercel.admin.json

# Supplier
npx vercel link --yes --project supplier-web
npx vercel env add NEXT_PUBLIC_API_URL production
npx vercel env add NEXT_PUBLIC_TENANT_ID production
npx vercel env add NEXT_PUBLIC_API_URL preview
npx vercel env add NEXT_PUBLIC_TENANT_ID preview
npx vercel deploy --prod --yes --local-config vercel.supplier.json
```

Dashboard path: Project → Settings → Environment Variables.

Post-deploy: open admin/supplier, confirm API calls hit production (Network tab), not `localhost:4000`.

---

## 3. Flutter — native scaffold + release builds

### 3a. Missing native projects (blocker)

`apps/customer-app` and `apps/driver-app` currently contain Dart/`pubspec.yaml` only. Before any store upload:

```bash
# Requires Flutter SDK on the machine
cd apps/customer-app && flutter create . --org sa.suqya --project-name suqya_customer
cd ../driver-app && flutter create . --org sa.suqya --project-name suqya_driver
```

Then embed Maps keys per Google’s Flutter docs (AndroidManifest / AppDelegate / Info.plist). Until then, `MAPS_MODE=sandbox` still exercises tracking UX.

Suggested application ids (confirm in Play / ASC before first upload):

| App | Application id / bundle id |
|-----|----------------------------|
| Customer | `sa.suqya.customer` |
| Driver | `sa.suqya.driver` |

### 3b. Versioning

`pubspec.yaml` uses `version: MAJOR.MINOR.PATCH+BUILD` (e.g. `0.1.0+1`).

| Track | Version name | Build number |
|-------|--------------|--------------|
| Internal / TestFlight | Keep `0.1.x` until public | Monotonic `+N` every upload |
| Play production | Align marketing version | Must increase every upload |
| App Store | CFBundleShortVersionString / CFBundleVersion from pubspec | Same rule |

Bump **both** apps when the shared API contract or `flutter_core` changes materially. Notes: [`mobile/release/VERSIONING.md`](../../mobile/release/VERSIONING.md).

### 3c. Dart defines (flavors without native product flavors)

Compile-time config lives in `--dart-define` / `--dart-define-from-file` (see `ApiConfig`, `MapsConfig`).

Example files (placeholders only):

- `apps/customer-app/dart_defines.staging.example.json`
- `apps/customer-app/dart_defines.production.example.json`
- `apps/driver-app/dart_defines.staging.example.json`
- `apps/driver-app/dart_defines.production.example.json`

Copy to `dart_defines.staging.json` / `dart_defines.production.json` (gitignored) and fill real URLs/keys.

```bash
# From repo root — after flutter create + local defines file
./scripts/flutter-build-release.sh customer android production
./scripts/flutter-build-release.sh driver ios production
# Or: npm run mobile:build -- customer android production
```

Manual equivalents:

```bash
cd apps/customer-app
flutter build appbundle --release \
  --dart-define-from-file=dart_defines.production.json

flutter build ipa --release \
  --dart-define-from-file=dart_defines.production.json
```

---

## 4. Google Play — internal testing track

1. Create Play Console developer account (organization preferred for Saudi entity).  
2. Create apps: **Suqya** (customer) and **Suqya Driver**.  
3. Complete store listing stubs from [`store/customer`](../../store/customer/) / [`store/driver`](../../store/driver/) (AR + EN).  
4. Privacy policy URL (required) — host a page covering PDPL rights (see §6).  
5. Upload first AAB to **Internal testing** (not production).  
6. Add tester emails / Google Groups.  
7. Data safety form: location, phone numbers, payment via Moyasar (no card data on device servers).  
8. Countries: start with **Saudi Arabia**.  
9. Keep package name stable once the first AAB is uploaded.

Signing: create an upload keystore locally; store passwords in a password manager — never commit `*.jks` / `key.properties` (already gitignored).

Fastlane stubs (optional later): copy from [`mobile/release/fastlane/`](../../mobile/release/fastlane/) into `android/fastlane` after native scaffold.

---

## 5. Apple — TestFlight / App Store Connect

1. Apple Developer Program enrollment (organization).  
2. App Store Connect: create **Suqya** and **Suqya Driver** (bundle ids `sa.suqya.customer` / `sa.suqya.driver`).  
3. Certificates + provisioning via Xcode or Fastlane `match` (owner-managed — no secrets in repo).  
4. Archive IPA (`flutter build ipa` or Xcode).  
5. Upload with Transporter / `xcrun altool` / Fastlane `pilot`.  
6. TestFlight → internal testers first; external TestFlight needs Beta App Review.  
7. App Privacy nutrition labels: phone, precise location (driver), payment processing via Moyasar.  
8. Export compliance: standard HTTPS-only encryption typically qualifies for exemption (confirm with counsel).  
9. Saudi availability + Arabic primary localization screenshots.

Public App Store submission is **Phase 3** of [`docs/testing/launch-plan.md`](../testing/launch-plan.md) — after closed beta, not before Foundation is green on a real host.

---

## 6. Saudi / PDPL / store compliance notes

Sources already in-repo (do not invent legal advice):

| Topic | Doc |
|-------|-----|
| PDPL rights matrix | [`docs/business/compliance-matrix.md`](../business/compliance-matrix.md) |
| PDPL implementation + SDAIA 72h | [`docs/security/security-policy.md`](../security/security-policy.md) § PDPL |
| Customer-facing PDPL UX | [`docs/manuals/customer.md`](../manuals/customer.md) (export / deletion) |
| Data residency target | AWS `me-south-1` (ADR); Railway region chosen by owner — document actual residency when provisioned |
| ZATCA / VAT | Compliance matrix + invoice module (sandbox until Fatoora prod) |

**Store listing must include (owner-hosted URLs):**

- Privacy policy (Arabic + English) — consent, purpose limitation, processors (Moyasar, Unifonic/SMS, Google Maps, hosting).  
- Support contact / delete-account path (Google + Apple requirements).  
- Permission justifications: location (delivery tracking), notifications (order status), camera (POD on driver).

**Production auth expectations** (from auth hardening): fail-fast `JWT_SECRET`; `OTP_EXPOSE_IN_RESPONSE=false`; no OTP codes in logs.

---

## 7. Pre-publish verification matrix

| Check | Command / action | Prod ready? |
|-------|------------------|-------------|
| API liveness | `GET $API_BASE/health` | Required |
| API readiness | `GET $API_BASE/health/ready` | Required |
| Staging smoke | `API_BASE=… npm run smoke:staging` | Required before promote |
| Foundation E2E | `npm run e2e:foundation` against target host | Required for pilot |
| Pilot seed (staging only) | `npm run db:seed:pilot` | Staging; optional prod |
| Admin/supplier against prod API | Manual login + order list | Required |
| Customer/driver release binary | Internal track / TestFlight install | Required before public |
| Moyasar live webhook | Dashboard → prod callback URL | Before real card pay |
| SMS live OTP | Send to real +966 handset | Before public auth |

---

## 8. What this repo change does **not** claim

- No Railway production project created (no token).  
- No Vercel env vars written (CLI logged out).  
- No Play / App Store binaries uploaded.  
- No live Maps / Moyasar / SMS credentials.  
- No public assertion that apps are “in stores.”

When credentials exist, re-run §1–§5 and update Context [`publish-surfaces.md`](https://github.com/hamzaakram007/suqya-platform) / project status with the **real** URLs only.

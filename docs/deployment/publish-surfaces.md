# Publish surfaces — production runbook

**Goal:** Production API (Railway), production Vercel admin/supplier, and first mobile store tracks (Play internal + TestFlight).  
**Status:** Native scaffolds + staging Android AAB/APK builds on trunk (PR #9 merged). **No apps are live in stores** — Play internal + TestFlight blocked on owner credentials (see §4–§5). No production API URL yet — do not invent one. IPA needs macOS.  
**Prereq:** Staging path green first ([`staging-api.md`](./staging-api.md)) — health, `e2e:foundation`, `db:seed:pilot`, auth smoke.  
**Related:** Store listing stubs in [`store/`](../../store/README.md) · Flutter release helpers in [`mobile/release/`](../../mobile/release/README.md)

---

## Honest starting point (2026-11-07)

| Surface | Today | Publish path |
|---------|-------|--------------|
| Admin | Live shell on Vercel (`admin-web-psi-sepia.vercel.app`) | Point `NEXT_PUBLIC_API_URL` at **production** API |
| Supplier | Live shell on Vercel (`supplier-web-one.vercel.app`) | Same |
| API / worker | Scaffold only (`railway.toml`); **no public host** | Separate Railway **production** project (or promote staging → prod) |
| Customer / Driver Flutter | Native `android/` + `ios/` scaffolds on trunk (ids `sa.suqya.customer` / `sa.suqya.driver`); staging AABs/APKs buildable | Fill Maps key + upload keystore → Play internal / TestFlight (macOS for IPA) |

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
| 6 | `GOOGLE_MAPS_API_KEY` (+ Android/iOS restrictions) | Real map tiles; Flutter dart-define + Manifest/Info.plist |
| 7 | Moyasar keys (`pk_*` / `sk_*`) + `MOYASAR_WEBHOOK_SECRET` | Card payments (sandbox test keys OK on staging; live only with `sk_live_*`) |
| 8 | SMS (`UNIFONIC_APP_SID`) + `OTP_MODE=live` **only if SID present** | Real OTP (never expose codes when live) |
| 9 | Privacy + support HTTPS (`suqya-legal`) | Done for listing copy — keep project public (no Vercel Auth) |
| 10 | Optional: ZATCA prod / Fatoora, FCM, custom domain `api.suqya.sa` | Compliance + push + branded API |

Copy names only into dashboards — never commit values.

**Step 5 (Maps / Moyasar / SMS) runbook:** [`vendor-keys-staging.md`](./vendor-keys-staging.md) — staging webhook URL, Railway flips, Flutter dart-defines, privacy hosting.

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

### 3a. Native projects (done on trunk)

`apps/customer-app` and `apps/driver-app` include checked-in `android/` and `ios/` scaffolds (`flutter create . --org sa.suqya`). Application / bundle ids:

| App | Application id / bundle id |
|-----|----------------------------|
| Customer | `sa.suqya.customer` |
| Driver | `sa.suqya.driver` |

AndroidManifest already has a **placeholder** `com.google.android.geo.API_KEY` (`REPLACE_WITH_RESTRICTED_ANDROID_KEY`). Replace before Play upload when Maps leave sandbox. Until then, `MAPS_MODE=sandbox` still exercises tracking UX.

If regenerating locally:

```bash
cd apps/customer-app && flutter create . --org sa.suqya --project-name suqya_customer --platforms=android,ios
cd ../driver-app && flutter create . --org sa.suqya --project-name suqya_driver --platforms=android,ios
# Re-confirm applicationId / PRODUCT_BUNDLE_IDENTIFIER match the table above.
```


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

### 3d. iOS / IPA (macOS required)

This Linux CI/agent host has **no Xcode / iOS SDK**. IPA / TestFlight path on a Mac:

```bash
cd apps/customer-app   # or driver-app
cp dart_defines.staging.example.json dart_defines.staging.json   # already points at staging API
flutter build ipa --release --dart-define-from-file=dart_defines.staging.json
# or: ../../scripts/flutter-build-release.sh customer ios staging
```

Requires Apple Developer team, bundle ids `sa.suqya.customer` / `sa.suqya.driver`, signing certificates, and App Store Connect apps before upload (step 4/5 — not done here).

---

## 4. Google Play — internal testing track

**Agent audit (2026-11-07):** No Play Console access, no `GOOGLE_APPLICATION_CREDENTIALS` / Play service-account JSON, no Fastlane supply session, no upload keystore in this environment. Staging AABs under Context artifacts are **debug-signed** (`signingConfig = debug` when `key.properties` is absent) and **will be rejected** by Play for the internal track. Do not claim an internal-track URL until a properly signed AAB is uploaded.

### Owner steps (exact)

1. Play Console → create developer account (organization preferred).  
2. Create apps: **Suqya** (`sa.suqya.customer`) and **Suqya Driver** (`sa.suqya.driver`).  
3. Create an **upload keystore** locally (never commit):

```bash
./scripts/android-create-upload-keystore.sh customer
./scripts/android-create-upload-keystore.sh driver
# Edit apps/*/android/key.properties passwords; back up ~/suqya-keys/*.jks offline
```

4. Rebuild release AABs with upload signing + staging dart-defines:

```bash
cp apps/customer-app/dart_defines.staging.example.json apps/customer-app/dart_defines.staging.json
cp apps/driver-app/dart_defines.staging.example.json apps/driver-app/dart_defines.staging.json
# fill API_URL=https://api-production-e8c4a.up.railway.app/v1 and TENANT_ID
./scripts/flutter-build-release.sh customer android staging
./scripts/flutter-build-release.sh driver android staging
```

5. Complete listing stubs from [`store/customer`](../../store/customer/) / [`store/driver`](../../store/driver/) (AR + EN) + **privacy policy URL**.  
6. Play Console → each app → **Testing → Internal testing** → Create release → upload AAB → review → start rollout.  
7. Add tester Google accounts / groups; share the internal-track opt-in link (Console → Internal testing → Testers).  
8. Data safety: location, phone, payment via Moyasar (no card PAN on device). Countries: start **Saudi Arabia**.  
9. Keep package ids stable after first upload.

### Optional automation (after credentials exist)

```bash
# Outside git: play-service-account.json with Play Console API access
export SUPPLY_JSON_KEY=/ABSOLUTE/PATH/play-service-account.json
# Copy mobile/release/fastlane/* examples into apps/<app>/android/fastlane/
# Then: bundle exec fastlane android internal
```

Agent/cloud secret names to provision when re-attempting upload: `PLAY_STORE_JSON_KEY` (file contents or path) **or** `GOOGLE_APPLICATION_CREDENTIALS` pointing at that JSON. Also need the upload `*.jks` + `key.properties` on the build machine (not as chat paste).

Fastlane stubs: [`mobile/release/fastlane/`](../../mobile/release/fastlane/). Keystore example: [`mobile/release/android/key.properties.example`](../../mobile/release/android/key.properties.example).

---

## 5. Apple — TestFlight / App Store Connect

**Agent audit (2026-11-07):** Host is **Linux** — no Xcode, no `xcodebuild`, no Transporter. No App Store Connect API key (`.p8`), no `ASC_KEY_ID` / `ASC_ISSUER_ID` / `APP_STORE_CONNECT_API_KEY`, no Fastlane `match` / `pilot` session. IPA was **not** built and TestFlight was **not** uploaded. Do not invent TestFlight URLs.

### Owner Mac steps (exact)

Prereqs on a Mac: Xcode (latest stable), CocoaPods, Flutter SDK, Apple Developer Program (org), App Store Connect apps created for `sa.suqya.customer` and `sa.suqya.driver`.

```bash
# One-time ASC apps + signing (Xcode automatic signing or Fastlane match — owner-managed)
# Create API key: App Store Connect → Users and Access → Keys → App Store Connect API
# Save AuthKey_XXXXXXXX.p8 outside git; note Key ID + Issuer ID.

cd /path/to/suqya-platform

cp apps/customer-app/dart_defines.staging.example.json apps/customer-app/dart_defines.staging.json
cp apps/driver-app/dart_defines.staging.example.json apps/driver-app/dart_defines.staging.json
# fill API_URL=https://api-production-e8c4a.up.railway.app/v1 and TENANT_ID

# Customer
cd apps/customer-app
flutter pub get
flutter build ipa --release --dart-define-from-file=dart_defines.staging.json
# IPA: build/ios/ipa/*.ipa
xcrun altool --upload-app --type ios -f build/ios/ipa/*.ipa \
  --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID"
# Or: open -a Transporter  /  Fastlane pilot after copying mobile/release/fastlane examples

# Driver (same pattern)
cd ../driver-app
flutter pub get
flutter build ipa --release --dart-define-from-file=dart_defines.staging.json
xcrun altool --upload-app --type ios -f build/ios/ipa/*.ipa \
  --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID"
```

Then: App Store Connect → each app → TestFlight → add internal testers (same Apple Team). External TestFlight needs Beta App Review.

Also set: App Privacy (phone, precise location for driver, payment via Moyasar); export compliance (HTTPS-only — confirm with counsel); Saudi availability + Arabic screenshots.

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

**Hosting status (2026-11-08):** `apps/legal-web` ships Arabic-first + English privacy/support pages. Listings under [`store/`](../../store/README.md) point at:

| Page | URL |
|------|-----|
| Privacy (AR) | https://suqya-legal.vercel.app/privacy |
| Privacy (EN) | https://suqya-legal.vercel.app/en/privacy |
| Support / account deletion (AR) | https://suqya-legal.vercel.app/support |
| Support / account deletion (EN) | https://suqya-legal.vercel.app/en/support |

Vercel project: **`suqya-legal`** — keep **Vercel Authentication / SSO Protection off** so Play/App Store reviewers can open the pages without login. Redeploy: `npx vercel deploy --prod --yes --local-config vercel.legal.json`. See [`vendor-keys-staging.md`](./vendor-keys-staging.md) § Privacy.

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
- No Play / App Store binaries uploaded (no Play JSON key / ASC `.p8` in agent env; AABs still debug-signed until owner keystore).  
- No live Maps / Moyasar / SMS credentials (out of scope for store-upload step).  
- No public assertion that apps are “in stores.”

When credentials exist, re-run §4–§5 and update Context `publish-surfaces.md` with the **real** internal-track / TestFlight URLs only.

# Vendor keys — staging go-live (step 5)

**Purpose:** Turn on live Google Maps, Moyasar, and SMS OTP on **staging** when credentials exist.  
**Staging API:** `https://api-production-e8c4a.up.railway.app` (clients use `/v1`)  
**Rule:** Never invent key values. Keep sandbox modes until each vendor key is present.

Related: [`staging-api.md`](./staging-api.md) · [`publish-surfaces.md`](./publish-surfaces.md) · [`../security/auth-hardening.md`](../security/auth-hardening.md)

---

## Credential presence gate

| Secret | Used for | Flip when present |
|--------|----------|-------------------|
| `GOOGLE_MAPS_API_KEY` | Flutter tiles + Android/iOS Maps SDK | Rebuild apps with dart-define + native meta-data |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional admin/supplier browser maps | Vercel env + redeploy |
| `MOYASAR_PUBLISHABLE_KEY` (`pk_test_*` or `pk_live_*`) | Card checkout | Set with secret; `PAYMENT_MODE=live` only for real `sk_live_*` |
| `MOYASAR_SECRET_KEY` (`sk_test_*` or `sk_live_*`) | Create/capture intents | Same |
| `MOYASAR_WEBHOOK_SECRET` | HMAC on webhook | Required before trusting live webhooks |
| `UNIFONIC_APP_SID` (+ optional `UNIFONIC_SENDER_ID`) | Real SMS OTP | `OTP_MODE=live` **only if SID present** |
| `RAILWAY_TOKEN` | Set Railway service variables from CI/agent | Required for remote var writes |

If any row is missing, leave that vendor in sandbox and do not flip its mode flag.

---

## Railway staging variables (API service)

Project: `suqya-staging` · environment that serves `api-production-e8c4a.up.railway.app`.

```bash
# Only after authenticating (`railway login` or RAILWAY_TOKEN).
# Do not paste secrets into chat — set from a local shell or Railway dashboard.

# --- SMS ---
# Keep sandbox until UNIFONIC_APP_SID exists:
# railway variables set OTP_MODE=sandbox
# railway variables set OTP_EXPOSE_IN_RESPONSE=true   # private E2E only
#
# When Unifonic SID is ready:
# railway variables set UNIFONIC_APP_SID=...
# railway variables set UNIFONIC_SENDER_ID=Suqya
# railway variables set SMS_PROVIDER=unifonic
# railway variables set OTP_MODE=live
# railway variables set OTP_EXPOSE_IN_RESPONSE=false

# --- Moyasar ---
# Test keys first (recommended for staging pilot):
# railway variables set MOYASAR_PUBLISHABLE_KEY=pk_test_...
# railway variables set MOYASAR_SECRET_KEY=sk_test_...
# railway variables set MOYASAR_WEBHOOK_SECRET=...
# railway variables set PAYMENT_MODE=sandbox   # or auto; use live only with sk_live_*
#
# Live keys (pilot card capture):
# railway variables set MOYASAR_PUBLISHABLE_KEY=pk_live_...
# railway variables set MOYASAR_SECRET_KEY=sk_live_...
# railway variables set MOYASAR_WEBHOOK_SECRET=...
# railway variables set PAYMENT_MODE=live
```

Worker service: same payment/SMS secrets as the API when workers process payment jobs.

Current staging default (as of go-live steps 1–2): `OTP_MODE=sandbox`, `PAYMENT_MODE=sandbox`, `OTP_EXPOSE_IN_RESPONSE=true`. **Do not flip `OTP_MODE=live` without Unifonic.**

---

## Moyasar webhook URL (staging)

In the Moyasar dashboard, set the webhook endpoint to:

```text
https://api-production-e8c4a.up.railway.app/v1/payments/webhook
```

- Signature header expected by the API: `x-moyasar-signature`  
- Secret must match Railway `MOYASAR_WEBHOOK_SECRET`  
- Browser redirect after pay remains `PAYMENT_CALLBACK_URL` (admin Vercel callback), not the webhook URL

---

## Flutter — Maps dart-defines

Examples already point at staging API:

- `apps/customer-app/dart_defines.staging.example.json`
- `apps/driver-app/dart_defines.staging.example.json`

Copy → `dart_defines.staging.json` (gitignored) and fill the Maps key locally:

```json
{
  "API_URL": "https://api-production-e8c4a.up.railway.app/v1",
  "TENANT_ID": "default-tenant",
  "GOOGLE_MAPS_API_KEY": "<restricted Maps key>",
  "MAPS_MODE": "google"
}
```

Build:

```bash
cd apps/customer-app
flutter build appbundle --release --dart-define-from-file=dart_defines.staging.json
# same for driver-app
```

Also replace Android Manifest placeholders before store builds with Maps:

- `apps/customer-app/android/app/src/main/AndroidManifest.xml` → `com.google.android.geo.API_KEY`
- `apps/driver-app/android/app/src/main/AndroidManifest.xml` → same  
- iOS: add the Maps key via Xcode / Info.plist when enabling Google Maps SDK  

Restrict the key by Android package (`sa.suqya.customer` / `sa.suqya.driver`) and iOS bundle ids. Leave `MAPS_MODE=sandbox` when the key is empty — the sandbox canvas still supports tracking UX.

Optional web:

```bash
# Vercel admin / supplier
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<browser-restricted key>
```

---

## Privacy / support URLs (stores — still owner-hosted)

Play + App Store listings require **owner-hosted** HTTPS pages. Repo stubs still say `REPLACE_SUPPORT_URL` / privacy placeholders under `store/`.

Host (outside this repo or via a static site you control):

1. **Privacy policy** (AR + EN) — PDPL rights, processors (Moyasar, Unifonic/SMS, Google Maps, hosting). See `docs/security/security-policy.md`.  
2. **Support / contact URL** — human-reachable support.  
3. **Account deletion** path (Apple/Google) — can point at in-app PDPL delete or a support form.

Until those URLs exist, store upload remains blocked regardless of Maps/Moyasar/SMS.

---

## Owner checklist (step 5)

1. Add Cursor / Railway secrets for the names above (dashboard — do not paste into chat).  
2. Ensure agent/CI has `RAILWAY_TOKEN` if remote variable writes are desired.  
3. Set Unifonic → then `OTP_MODE=live` + `OTP_EXPOSE_IN_RESPONSE=false`.  
4. Set Moyasar keys + webhook URL above → then `PAYMENT_MODE` appropriately.  
5. Set Maps key in Flutter dart-defines + Android/iOS embeds; rebuild.  
6. Host privacy + support URLs; paste into `store/*/listing.md`.  
7. Smoke: OTP to a real `+966` handset; card sandbox/live intent; tracking with Google tiles.

**Do not claim Play / TestFlight apps are live** from this step alone.

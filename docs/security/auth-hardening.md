# Auth hardening (staging + production)

**Roadmap step:** 4  
**Status:** Implemented on branch / PR (see Context `auth-hardening.md`)  
**Scope:** NestJS API `apps/api` — OTP, JWT, refresh sessions.

## What changed

| Area | Before | After |
|------|--------|-------|
| Refresh lookup | Load all non-expired sessions + `bcrypt.compare` | SHA-256 hex of opaque token → unique indexed `sessions.refresh_token_hash` |
| Refresh lifecycle | New session created; old left valid | Single-use rotation; old row gets `revoked_at` + `replaced_by_id` |
| Refresh reuse | None | Presenting a revoked token revokes **all** active sessions for that user |
| OTP send | Global throttle only | Per-phone/tenant DB cap (5 / 10 min) + stricter `@Throttle` on `/auth/otp/send` |
| OTP verify | Unlimited guesses | `failed_attempts` on `otp_codes`; burn after 5 wrong guesses + throttle |
| OTP logging / expose | Sandbox code could echo in auto/dev | **Never** logs codes. `sandboxCode` only when `OTP_MODE=sandbox` **and** `OTP_EXPOSE_IN_RESPONSE=true` |
| JWT boot | Weak default always available | Fail-fast if missing/short/known-default when `NODE_ENV=production` or `APP_ENV=staging` |
| JWT rotation | Undocumented | `JWT_SECRET_PREVIOUS` accepted during verify window |

## Env vars

| Variable | Required | Notes |
|----------|----------|-------|
| `JWT_SECRET` | **Yes** in staging/prod | `openssl rand -base64 48` (≥32 chars, not a known default) |
| `JWT_SECRET_PREVIOUS` | Optional | Set only during rotation (~15–30 min), then remove |
| `APP_ENV` | Optional | `staging` triggers the same fail-fast rules as production |
| `REQUIRE_STRONG_JWT` | Optional | Force strong-secret checks in any environment |
| `OTP_MODE` | Recommended | `sandbox` for E2E staging; `live` for real SMS |
| `OTP_SANDBOX_CODE` | Sandbox only | Default `123456` |
| `OTP_EXPOSE_IN_RESPONSE` | Sandbox E2E | Must be `true` **with** `OTP_MODE=sandbox` to return `sandboxCode`. Set `false` for shared staging audiences |
| `NODE_ENV` | Yes | `production` on Railway/staging containers |

## JWT rotation runbook

1. Generate new secret: `openssl rand -base64 48`
2. Deploy with `JWT_SECRET=<new>` and `JWT_SECRET_PREVIOUS=<old>`
3. Wait ≥ access-token TTL (15m) so clients refresh under the new signer
4. Remove `JWT_SECRET_PREVIOUS` and redeploy
5. Keep staging and production secrets **different**

Clients must re-login after this deploy if they still hold bcrypt-era refresh tokens (pre-hardening). Staging had no live users at cutover.

## Migration

`apps/api/prisma/migrations/20261107190000_auth_hardening_sessions/`

- `sessions.revoked_at`, `sessions.replaced_by_id`
- unique index on `refresh_token_hash`
- `otp_codes.failed_attempts` + phone/tenant/created index

## Tests

```bash
npm run test -w @suqya/api -- --testPathPattern='auth|jwt-secret|token-hash'
```

Covers hashed refresh lookup (no `findMany`), rotation, reuse lockdown, OTP rate limit, sandbox expose rules, JWT fail-fast.

## Related

- Policy: `docs/security/security-policy.md` (refresh rotation / 7-day TTL aligned in code)
- Staging env template: `apps/api/.env.staging.example`
- Foundation E2E still needs `OTP_MODE=sandbox` + `OTP_EXPOSE_IN_RESPONSE=true` for scripted OTP

# Staging API — Railway-first path

**Goal:** Public HTTPS NestJS API + Postgres + Redis for admin/supplier/Flutter clients.  
**Chosen host:** [Railway](https://railway.app) (fastest durable PaaS that matches README; AWS EKS remains the long-term ADR path in `docs/adr/002-aws-eks.md`).

## Why Railway (for now)

| Option | Fit | Blocker in agent env |
|--------|-----|----------------------|
| **Railway** | One project: web + worker + Postgres + Redis; Dockerfile already in repo | Needs `RAILWAY_TOKEN` or interactive `railway login` |
| Fly.io | Similar; needs `fly.toml` + volumes/addons | No `flyctl` auth |
| Render | Blueprint possible | No Render API key |
| AWS EKS (`infra/terraform` + `infra/k8s`) | Production target | Needs AWS account + `AWS_DEPLOY_ROLE_ARN` + ECR/EKS already provisioned |
| Local Compose staging | `infra/docker/docker-compose.staging.yml` | Needs Docker daemon |

Repo scaffolding for Railway + Compose is in this tree. **Provision requires owner credentials** (see Blockers).

## Repo artifacts

| File | Purpose |
|------|---------|
| `railway.toml` | Dockerfile build, migrate release, `/v1/health` check |
| `Procfile` | `web` / `worker` / `release` process types |
| `infra/docker/Dockerfile.api` | Multi-stage API/worker image |
| `infra/docker/docker-entrypoint.sh` | Optional migrate/seed + `WORKER_MODE` |
| `infra/docker/docker-compose.staging.yml` | Local/full-stack staging substitute |
| `apps/api/.env.staging.example` | Env var names for staging |
| `scripts/smoke-staging.sh` | Health + OTP smoke |

API accepts **`REDIS_URL`** (PaaS) or `REDIS_HOST`/`REDIS_PORT` (`apps/api/src/common/config/redis.config.ts`).

## Owner: provision Railway (copy-paste)

```bash
# 1) Auth
npm i -g @railway/cli
railway login
# or: export RAILWAY_TOKEN=...   # from https://railway.app/account/tokens

# 2) Project + services (from repo root on master or this PR branch)
railway init          # create project "suqya-staging"
railway add --database postgres
railway add --database redis

# 3) Link GitHub repo / deploy from Dockerfile
railway up            # or connect GitHub in dashboard → watch railway.toml

# 4) Second service for BullMQ worker (same image)
# Dashboard: New Service → Docker → same repo → set WORKER_MODE=true
# Start command can stay /entrypoint.sh (entrypoint reads WORKER_MODE)

# 5) Variables (API service) — set names; Railway injects DATABASE_URL / REDIS_URL from plugins
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="$(openssl rand -base64 48)"
railway variables set CORS_ORIGINS="https://admin-web-psi-sepia.vercel.app,https://supplier-web-one.vercel.app"
railway variables set PAYMENT_CALLBACK_URL="https://admin-web-psi-sepia.vercel.app/payment/callback"
# Optional sandbox / live vendor keys — full flip checklist:
# docs/deployment/vendor-keys-staging.md
# Moyasar webhook (staging): https://api-production-e8c4a.up.railway.app/v1/payments/webhook
# railway variables set MOYASAR_PUBLISHABLE_KEY=pk_test_...
# railway variables set MOYASAR_SECRET_KEY=sk_test_...
# OTP_MODE=live only when UNIFONIC_APP_SID is set

# 6) Public URL
railway domain        # note https://<service>.up.railway.app
export API_BASE="https://<service>.up.railway.app/v1"

# 7) Migrate runs via railway.toml releaseCommand; seed once:
railway run npx ts-node prisma/seed.ts
# If seed tooling missing in image, run from CI laptop against DATABASE_URL:
# DATABASE_URL=... npm run db:seed -w @suqya/api

# 8) Smoke
API_BASE="$API_BASE" TENANT_ID=default-tenant ./scripts/smoke-staging.sh
```

Worker service variables: same `DATABASE_URL` / `REDIS_URL` / `JWT_SECRET`, plus `WORKER_MODE=true`.

## Wire clients

### Vercel — admin + supplier

Set **Preview** and **Production** (or Staging env) on both projects:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://<railway-host>/v1` |
| `NEXT_PUBLIC_TENANT_ID` | `default-tenant` (seed id) |

CLI (after `vercel login`):

```bash
# Admin
npx vercel link --yes --project admin-web
npx vercel env add NEXT_PUBLIC_API_URL production
# paste https://<railway-host>/v1
npx vercel env add NEXT_PUBLIC_API_URL preview
npx vercel env add NEXT_PUBLIC_TENANT_ID production
npx vercel env add NEXT_PUBLIC_TENANT_ID preview
npx vercel deploy --prod --yes --local-config vercel.admin.json

# Supplier
npx vercel link --yes --project supplier-web
npx vercel env add NEXT_PUBLIC_API_URL production
npx vercel env add NEXT_PUBLIC_API_URL preview
npx vercel env add NEXT_PUBLIC_TENANT_ID production
npx vercel env add NEXT_PUBLIC_TENANT_ID preview
npx vercel deploy --prod --yes --local-config vercel.supplier.json
```

Dashboard path: Project → Settings → Environment Variables → add the same names.

### Flutter — customer + driver

`packages/flutter_core` reads compile-time defines:

```bash
flutter run \
  --dart-define=API_URL=https://<railway-host>/v1 \
  --dart-define=TENANT_ID=default-tenant
```

CI/release builds should pass the same `--dart-define` (or `--dart-define-from-file`).

## Compose alternative (Docker available)

```bash
cp apps/api/.env.staging.example apps/api/.env.staging
# edit JWT_SECRET + CORS_ORIGINS
docker compose -f infra/docker/docker-compose.staging.yml up -d --build
API_BASE=http://localhost:4000/v1 ./scripts/smoke-staging.sh
```

## AWS path (later)

When `AWS_DEPLOY_ROLE_ARN` + ECR/EKS exist, existing `.github/workflows/ci.yml` `docker-build-push` / `deploy-staging` jobs apply. Prefer finishing Railway staging first for Foundation E2E.

## Blockers (agent cannot proceed past these)

| Secret / account | Used for |
|------------------|----------|
| `RAILWAY_TOKEN` or interactive Railway login | Deploy API + provision Postgres/Redis |
| `JWT_SECRET` | Staging token signing (owner-generated) |
| `VERCEL_TOKEN` or Vercel login | Set `NEXT_PUBLIC_API_URL` on admin/supplier |
| Optional: `MOYASAR_*`, SMS provider keys | Payment / real OTP beyond console log |
| Optional later: `AWS_DEPLOY_ROLE_ARN`, ECR, EKS | Production ADR path |

## Smoke expectations

| Check | Endpoint | Expect |
|-------|----------|--------|
| Liveness | `GET /v1/health` | `{ status: "ok" }` |
| Readiness | `GET /v1/health/ready` | `{ status: "ready", database: "connected" }` |
| Auth | `POST /v1/auth/otp/send` + `otp/verify` | 200; token when OTP known |
| Orders | `POST /v1/orders` with Bearer + `X-Tenant-Id` | After auth (Foundation slice) |

**Status (2026-11-07):** Staging **LIVE** on Railway.

| Item | Value |
|------|-------|
| HTTPS host | `https://api-production-e8c4a.up.railway.app` |
| Client `API_BASE` | `https://api-production-e8c4a.up.railway.app/v1` |
| Project | `suqya-staging` (Postgres + Redis + `api` + `worker`) |
| Smoke | `GET /v1/health` + OTP sandbox via `scripts/smoke-staging.sh` — OK |
| Next | Set Vercel `NEXT_PUBLIC_API_URL` / Flutter dart-defines to the host above (do not invent URLs) |

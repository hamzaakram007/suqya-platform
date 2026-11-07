# Deployment Guide

**Phase 14 · Sprint 11** — Suqya Water Tanker Platform

This guide covers end-to-end deployment of the Suqya monorepo (`suqya-platform`) across local development, staging, and production environments in Saudi Arabia.

## Architecture Summary

| Component | Hosting | URL / Endpoint |
|-----------|---------|----------------|
| NestJS API (`apps/api`) | AWS EKS (`me-south-1`) | `https://api.suqya.sa/v1` |
| Admin dashboard (`apps/admin-web`) | Vercel | https://admin-web-psi-sepia.vercel.app |
| Supplier portal (`apps/supplier-web`) | Vercel | https://supplier-web-one.vercel.app |
| Customer app (`apps/customer-app`) | App Store / Google Play | Flutter build |
| Driver app (`apps/driver-app`) | App Store / Google Play | Flutter build |
| PostgreSQL 16 + PostGIS | AWS RDS | Private subnet |
| Redis 7 | AWS ElastiCache | Private subnet |
| Documents / POD | AWS S3 | `suqya-{env}-assets` |

## Prerequisites

- Node.js ≥ 20 (`package.json` engines)
- Docker Desktop (local infra)
- AWS CLI v2 with `me-south-1` profile
- `kubectl` configured for EKS cluster
- Terraform ≥ 1.5
- Vercel CLI (web portals)
- Flutter 3.x SDK (mobile apps)

## Local Development

### 1. Start infrastructure

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

This starts:
- **PostgreSQL 16 + PostGIS** on port `5432` (user `suqya`, db `suqya`)
- **Redis 7** on port `6379`

### 2. Configure API environment

Copy and edit `apps/api/.env.example`:

```bash
cp apps/api/.env.example apps/api/.env
```

Key variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Prisma connection string |
| `REDIS_HOST` / `REDIS_PORT` | BullMQ queues, rate limiting, pub/sub |
| `JWT_SECRET` | Access token signing |
| `MOYASAR_API_KEY` / `MOYASAR_SECRET_KEY` | Payment gateway (sandbox) |
| `ZATCA_ENV` | `sandbox` or `production` |
| `PAYMENT_CALLBACK_URL` | Moyasar redirect after card payment |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:3001` |

### 3. Database setup

```bash
npm install
npm run db:migrate
npm run db:seed
```

### 4. Start services

```bash
npm run dev:api        # NestJS on :4000 — Swagger at /v1/docs
npm run dev:admin      # Admin Next.js on :3000
npm run dev:supplier   # Supplier Next.js on :3001
```

Flutter apps run from their respective directories:

```bash
cd apps/customer-app && flutter run
cd apps/driver-app && flutter run
```

## Staging Deployment

### API (EKS)

1. **Build and push Docker image** (CI does this on `develop` push):

```bash
docker build -t <ecr-repo>/suqya/api:<git-sha> -f infra/docker/Dockerfile.api .
docker push <ecr-repo>/suqya/api:<git-sha>
```

2. **Apply Kubernetes manifests**:

```bash
kubectl apply -f infra/k8s/api-deployment.yaml -n suqya-staging
kubectl set image deployment/suqya-api api=<ecr-repo>/suqya/api:<git-sha> -n suqya-staging
```

3. **Run migrations** (one-off job or init container):

```bash
kubectl run prisma-migrate --rm -it \
  --image=<ecr-repo>/suqya/api:<git-sha> \
  --env-from=secret/suqya-secrets \
  -n suqya-staging \
  -- npx prisma migrate deploy --schema=prisma/schema.prisma
```

### Web portals (Vercel)

Set environment variables in Vercel project settings:

| Variable | Staging Value |
|----------|---------------|
| `NEXT_PUBLIC_API_URL` | `https://api-staging.suqya.sa/v1` |
| `NEXT_PUBLIC_TENANT_ID` | Staging tenant UUID |

Deploy:

```bash
npx vercel link --project admin-web --yes
npx vercel deploy --yes --local-config vercel.admin.json

npx vercel link --project supplier-web --yes
npx vercel deploy --yes --local-config vercel.supplier.json
```

Production deploys add `--prod`.

## Production Deployment

Production follows the same pattern with these differences:

| Setting | Production |
|---------|------------|
| EKS namespace | `suqya-production` |
| RDS | Multi-AZ, 35-day backup retention |
| API replicas | 3 minimum (HPA scales to 10 at 70% CPU) |
| Moyasar keys | Live `pk_live_*` / `sk_live_*` |
| ZATCA | Production Fatoora API + certified EGS |
| Branch trigger | `main` → `deploy-production` job |

### Pre-deploy checklist

- [ ] All CI jobs green (`lint-and-test`, `build-api`, `build-admin`)
- [ ] Database migration reviewed and backward-compatible
- [ ] Feature flags configured for gradual rollout
- [ ] RDS snapshot taken (see [disaster-recovery.md](../operations/disaster-recovery.md))
- [ ] Moyasar webhook URL updated if API domain changed
- [ ] ZATCA sandbox → production credentials rotated
- [ ] Mobile app versions submitted if API contract changed

### Blue-green rollout

1. Deploy new image to `suqya-api-green` deployment
2. Run smoke tests against green service (internal ALB rule)
3. Switch ALB target group weights: green 100%, blue 0%
4. Monitor error rate and p99 latency for 15 minutes
5. Scale down blue deployment or keep for instant rollback

### Post-deploy verification

```bash
# Health check
curl https://api.suqya.sa/v1/tenants/public

# Auth smoke test (staging credentials)
curl -X POST https://api.suqya.sa/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phone": "+966500000001"}'
```

Verify:
- Admin dashboard loads and authenticates
- Supplier portal shows live orders
- Moyasar test payment completes end-to-end
- ZATCA invoice submission returns `REPORTED` status
- BullMQ workers processing (`dispatch`, `notification` queues)

## Environment Variable Reference

Secrets are stored in AWS Secrets Manager and mounted as Kubernetes `suqya-secrets`:

| Secret Key | Source |
|------------|--------|
| `database-url` | RDS endpoint from Terraform output |
| `redis-host` | ElastiCache endpoint |
| `jwt-secret` | Rotated quarterly |
| `moyasar-secret-key` | Moyasar dashboard |
| `zatca-api-token` | ZATCA Fatoora portal |
| `fcm-server-key` | Firebase console |

Non-secret config uses ConfigMaps (`suqya-config`): `CORS_ORIGINS`, `ZATCA_ENV`, `NODE_ENV`.

## Monorepo Build Targets

| Workspace | Build Command | Artifact |
|-----------|---------------|----------|
| `@suqya/api` | `npm run build -w @suqya/api` | `apps/api/dist/` → Docker image |
| `@suqya/admin-web` | `npm run build -w @suqya/admin-web` | Vercel static/server |
| `@suqya/supplier-web` | `npm run build -w @suqya/supplier-web` | Vercel static/server |
| `@suqya/shared-types` | Transitive dependency | Published internally |
| `@suqya/i18n` | Transitive dependency | AR/EN strings |
| `@suqya/ui-kit` | Transitive dependency | Shared web components |

## Mobile App Release

Canonical checklist: **[publish-surfaces.md](publish-surfaces.md)** (Play internal + TestFlight, PDPL notes, owner blockers).

1. Ensure native `android/` / `ios/` exist (`flutter create .` — not yet in repo)
2. Bump `version` in each app `pubspec.yaml` (see `mobile/release/VERSIONING.md`)
3. Fill `dart_defines.production.json` from the `*.example.json` beside each app
4. Build: `./scripts/flutter-build-release.sh customer android production` (or `ios` / `apk`)
5. Upload AAB to Play **internal** track; IPA to TestFlight — not production until pilot exit
6. Store copy stubs: `store/customer`, `store/driver` (AR + EN)
7. Coordinate with API deploy (backward-compatible `/v1` required)

## Related Documentation

- [Publish surfaces](publish-surfaces.md) — production Railway / Vercel / stores
- [Staging API](staging-api.md) — Railway-first staging
- [Infrastructure](infrastructure.md) — Terraform, EKS, networking
- [CI/CD](cicd.md) — GitHub Actions pipeline
- [Operations Manual](../operations/ops-manual.md) — Day-2 operations
- [Disaster Recovery](../operations/disaster-recovery.md) — RTO/RPO procedures

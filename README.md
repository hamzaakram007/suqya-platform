# Suqya — Water Tanker Ordering Platform

Production-grade, Arabic-first water logistics SaaS for Saudi Arabia.

## Stack

| Layer | Technology |
|-------|------------|
| Customer + Driver apps | Flutter 3.x |
| Admin + Supplier portals | Next.js 15 |
| API | NestJS + Prisma |
| Database | PostgreSQL 16 + PostGIS |
| Cache/Queue | Redis + BullMQ |

## Monorepo Structure

```
apps/
  api/              NestJS backend
  admin-web/        Super admin dashboard
  supplier-web/     Supplier portal
  customer-app/     Flutter customer app
  driver-app/       Flutter driver app
packages/
  shared-types/     TypeScript DTOs
  i18n/             Arabic/English translations
  ui-kit/           Shared web components
infra/
  terraform/        AWS infrastructure
  k8s/              Kubernetes manifests
  docker/           Docker Compose for local dev
docs/               Business, API, database, UX docs
```

## Live Deployments

| App | URL |
|-----|-----|
| Admin Dashboard | https://admin-web-psi-sepia.vercel.app |
| Supplier Portal | https://supplier-web-one.vercel.app |
| GitHub Repo | https://github.com/hamzaakram007/suqya-platform |

### Redeploy to Vercel

```bash
# Admin dashboard
npx vercel link --project admin-web --yes
npx vercel deploy --prod --yes --local-config vercel.admin.json

# Supplier portal
npx vercel link --project supplier-web --yes
npx vercel deploy --prod --yes --local-config vercel.supplier.json
```

> **Note:** The NestJS API requires a persistent server (Docker/Kubernetes/Railway). It is not deployed to Vercel. Connect the web apps to your API via `NEXT_PUBLIC_API_URL` in Vercel environment variables.

## Staging API (Railway-first)

See **[docs/deployment/staging-api.md](docs/deployment/staging-api.md)** for the full runbook.

```bash
# Option A — Railway (recommended staging)
railway login && railway up
# set JWT_SECRET + CORS_ORIGINS; Postgres/Redis via Railway plugins
API_BASE=https://<host>/v1 npm run smoke:staging

# Option B — Docker Compose staging stack
cp apps/api/.env.staging.example apps/api/.env.staging
docker compose -f infra/docker/docker-compose.staging.yml up -d --build
```

Wire clients: set `NEXT_PUBLIC_API_URL=https://<host>/v1` on Vercel admin + supplier; Flutter `--dart-define=API_URL=https://<host>/v1`.

```bash
# Install dependencies
npm install

# Start local infrastructure (Postgres :5433, Redis :6380)
docker compose -f infra/docker/docker-compose.yml up -d

# Align apps/api/.env with .env.example ports, then:
npm run db:migrate
npm run db:seed          # minimal demo users
npm run db:seed:pilot    # Phase 1 pack: 2 suppliers, 10 drivers, sample orders
npm run dev:api
npm run dev:admin
```

## Documentation

- [Pilot ops (Phase 1 dry-run)](docs/testing/pilot-ops.md)
- [Staging API](docs/deployment/staging-api.md)
- [Business Analysis](docs/business/)
- [System Architecture](docs/architecture/system-design.md)
- [Database ERD](docs/database/erd.md)
- [API Spec](docs/api/openapi.yaml)
- [UX Design System](docs/ux/design-system.md)

## License

Proprietary — All rights reserved.

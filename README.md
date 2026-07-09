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

## Quick Start

```bash
# Install dependencies
npm install

# Start local infrastructure
docker compose -f infra/docker/docker-compose.yml up -d

# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed

# Start API
npm run dev:api

# Start admin dashboard
npm run dev:admin
```

## Documentation

- [Business Analysis](docs/business/)
- [System Architecture](docs/architecture/system-design.md)
- [Database ERD](docs/database/erd.md)
- [API Spec](docs/api/openapi.yaml)
- [UX Design System](docs/ux/design-system.md)

## License

Proprietary — All rights reserved.

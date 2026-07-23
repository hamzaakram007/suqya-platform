# ADR-001: Modular Monolith Architecture

**Status**: Accepted  
**Date**: 2026-01-15  
**Phase**: 14 · Sprint 11  
**Decision Makers**: Engineering Lead, CTO

## Context

Suqya is a water tanker ordering platform for Saudi Arabia serving multiple actor types (customers, drivers, suppliers, admins) across marketplace, private, and franchise operating modes. The team needed to choose an architecture that:

- Supports rapid MVP delivery for the Riyadh pilot
- Handles multi-tenant isolation (PDPL, ZATCA per-tenant invoicing)
- Allows future extraction of high-load services (dispatch, payments, notifications)
- Minimizes operational complexity for a small engineering team
- Works within the existing NestJS + Prisma + PostgreSQL stack

## Decision

Adopt a **modular monolith** architecture using NestJS bounded contexts within a single deployable API (`apps/api`).

## Architecture

```
apps/api/src/
  modules/
    auth/           Identity — OTP, JWT, sessions
    tenant/         Multi-tenancy — tenants, branches, settings
    catalog/        Tank sizes, water types, geography
    order/          Order lifecycle, state machine
    dispatch/       Driver assignment, auto-dispatch
    payment/        Moyasar integration, transactions
    invoice/        ZATCA invoicing, QR generation
    supplier/       Supplier management, documents
    driver/         Driver profiles, location, earnings
    customer/       Customer profiles, addresses
    wallet/         Wallet, ledger
    credit/         Credit accounts, aging
    settlement/     Supplier payouts
    accounting/     Double-entry bookkeeping
    notification/   FCM, SMS, email (BullMQ processor)
    support/        Tickets
    dispute/        Order disputes
    analytics/      Reporting
    security/       Audit, 2FA, PDPL
    admin/          Platform administration
    coupon/         Promotional codes
    subscription/   SaaS billing (private mode)
    erp/            ERP integration hooks
    health/         Health checks
```

Each module is a self-contained NestJS module with its own controller, service, and DTOs. Modules communicate via injected services (in-process), not network calls.

## Rationale

### Why modular monolith over microservices

| Factor | Monolith | Microservices |
|--------|----------|---------------|
| Team size (4 engineers) | ✅ Manageable | ❌ Overhead |
| Time to MVP | ✅ 8 weeks | ❌ 16+ weeks |
| Operational cost | ✅ 1 deployment | ❌ 10+ services |
| Debugging | ✅ Single process | ❌ Distributed tracing needed |
| Transaction consistency | ✅ ACID in one DB | ❌ Saga patterns |
| Deploy frequency | ✅ One artifact | ❌ Coordinated releases |

### Why modular monolith over plain monolith

- Clear module boundaries enforce separation of concerns
- Each module can be extracted to a microservice without rewriting business logic
- NestJS module system provides natural dependency boundaries
- Prisma schema organized by domain (single schema, but table groups map to modules)
- Team can own modules independently within the monorepo

### Extract-to-microservice path

Defined in `docs/architecture/system-design.md`:

| Service | Trigger | Interface |
|---------|---------|-----------|
| Dispatch | > 10k orders/day, ML routing | gRPC / internal REST |
| Notifications | Multi-channel fan-out bottleneck | Queue consumer |
| Payments | PCI isolation requirement | Internal API + webhook |

Extraction process:
1. Extract module code to `packages/dispatch-service/`
2. Replace in-process calls with HTTP/gRPC client
3. Deploy as separate K8s deployment
4. Shared database initially, then dedicated DB

## Consequences

### Positive

- Single Docker image (`infra/docker/Dockerfile.api`) simplifies CI/CD
- One database migration path (`prisma migrate`)
- Consistent transaction boundaries for order → payment → invoice flow
- Shared Prisma client, no distributed data consistency issues
- Fast local development (one `npm run dev:api`)

### Negative

- All modules scale together (mitigated by HPA on API pods + separate worker deployment)
- Single point of failure (mitigated by 3+ replicas, Multi-AZ RDS)
- Module coupling risk if boundaries not respected (mitigated by code review, no cross-module Prisma queries)
- Large codebase in one repo (mitigated by monorepo workspace structure)

### Risks

| Risk | Mitigation |
|------|------------|
| Module coupling | Enforce: modules only import from their own directory + shared packages |
| Performance bottleneck | Profile before extracting; HPA handles horizontal scaling |
| Deployment blast radius | Feature flags per tenant, blue-green deploys |
| Team scaling | Module ownership model; extract when team > 8 engineers |

## Alternatives Considered

### 1. Microservices from day one
Rejected: 4-person team cannot operate 10+ services. Riyadh pilot needs speed.

### 2. Serverless (Lambda + API Gateway)
Rejected: WebSocket requirement (live tracking), BullMQ workers, long-running dispatch logic incompatible with Lambda timeouts.

### 3. Separate repos per service
Rejected: Shared types (`packages/shared-types`), i18n (`packages/i18n`), and coordinated releases require monorepo.

## References

- [System Design](../architecture/system-design.md)
- [ADR-002: AWS EKS](002-aws-eks.md)
- NestJS module documentation
- "MonolithFirst" — Martin Fowler

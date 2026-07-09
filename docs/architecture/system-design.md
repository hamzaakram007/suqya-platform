# System Architecture

## Overview

Modular monolith (NestJS) with clear bounded contexts, extract-to-microservice path for Dispatch, Notifications, and Payments at scale.

## Tenant Operating Modes

| Mode | Description | Revenue |
|------|-------------|---------|
| `marketplace` | Platform owns customers; suppliers compete | Commission per order |
| `private` | White-label; supplier owns customers | Monthly SaaS fee |
| `franchise` | Parent manages branches | SaaS + royalty |

## Bounded Contexts

```mermaid
flowchart TB
    subgraph identity [Identity]
        auth[Auth]
        rbac[RBAC]
        sessions[Sessions]
    end
    subgraph tenant [Tenant]
        tenants[Tenants]
        branches[Branches]
        settings[Settings]
    end
    subgraph catalog [Catalog]
        tanks[TankSizes]
        water[WaterTypes]
        geo[Geography]
    end
    subgraph commerce [Commerce]
        pricing[Pricing]
        orders[Orders]
        dispatch[Dispatch]
    end
    subgraph fleet [Fleet]
        suppliers[Suppliers]
        drivers[Drivers]
        trucks[Trucks]
    end
    subgraph finance [Finance]
        payments[Payments]
        invoices[Invoices]
        accounting[Accounting]
        credit[Credit]
    end
    subgraph ops [Operations]
        notify[Notifications]
        support[Support]
        reports[Reporting]
    end
    identity --> tenant
    tenant --> commerce
    catalog --> commerce
    fleet --> commerce
    commerce --> finance
    commerce --> ops
```

## Deployment Architecture

```mermaid
flowchart TB
    subgraph clients [Clients]
        custApp[CustomerFlutter]
        drvApp[DriverFlutter]
        supWeb[SupplierNextJS]
        admWeb[AdminNextJS]
    end
    subgraph edge [Edge]
        cdn[CloudFront]
        waf[WAF]
        alb[ALB]
    end
    subgraph k8s [EKS_me_south_1]
        api1[API_Pod_1]
        api2[API_Pod_2]
        api3[API_Pod_3]
        worker[Worker_Pods]
    end
    subgraph data [Data]
        rds[(RDS_PostgreSQL_PostGIS)]
        redis[(ElastiCache_Redis)]
        s3[(S3)]
        os[(OpenSearch)]
    end
    subgraph external [External]
        maps[GoogleMaps]
        zatca[ZATCA]
        pgw[Moyasar]
        fcm[FCM]
        sms[SMS_WhatsApp]
    end
    clients --> cdn --> alb --> k8s
    k8s --> data
    k8s --> external
    worker --> redis
```

## Request Flow

1. Client sends request with `Authorization: Bearer <jwt>` and `X-Tenant-Id: <uuid>`
2. API Gateway / ALB terminates TLS
3. NestJS middleware: rate limit → tenant resolve → JWT verify → RBAC guard
4. Controller → Service → Repository (Prisma)
5. Side effects via BullMQ jobs (notifications, invoicing, accounting)

## Real-Time Architecture

- **WebSocket** (Socket.io): live order tracking, dispatch updates, admin live map
- **Redis pub/sub**: broadcast driver location updates to subscribed clients
- **FCM**: push notifications when app backgrounded

## Multi-Tenant Isolation

- Every business table has `tenant_id` column
- Prisma middleware injects `tenant_id` filter on all queries
- PostgreSQL RLS as defense-in-depth
- Tenant resolved from JWT claims or `X-Tenant-Id` header

## Scalability Path

| Phase | Architecture | Trigger |
|-------|-------------|---------|
| Launch | Modular monolith, 3 API pods | < 10k orders/day |
| Growth | Extract dispatch service | > 10k orders/day |
| Scale | Extract payments + notifications | > 50k orders/day |
| Enterprise | Full microservices | Multi-region GCC |

## Security Layers

1. TLS 1.3 (edge)
2. WAF (OWASP rules)
3. Rate limiting (Redis, 100 req/min/user)
4. JWT + refresh rotation
5. RBAC per endpoint
6. Tenant isolation (app + DB)
7. Audit log (immutable)
8. Encryption at rest (RDS, S3)

## Extract-to-Microservice Candidates

| Service | Trigger | Interface |
|---------|---------|-----------|
| Dispatch | High order volume, complex ML | gRPC / REST internal |
| Notifications | Multi-channel fan-out | Queue consumer |
| Payments | PCI isolation | Internal API + webhook |

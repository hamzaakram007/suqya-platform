# ADR-002: AWS EKS for API Hosting

**Status**: Accepted  
**Date**: 2026-01-20  
**Phase**: 14 · Sprint 11  
**Decision Makers**: Engineering Lead, DevOps, CTO

## Context

The Suqya NestJS API (`apps/api`) requires persistent, long-running infrastructure for:

- REST API with WebSocket support (Socket.io for live order tracking)
- BullMQ background workers (dispatch, notifications)
- Persistent connections to PostgreSQL and Redis
- Horizontal scaling during Riyadh peak hours (10:00–14:00 AST)
- PDPL-compliant data residency in the Middle East

Web frontends (admin, supplier) deploy to Vercel. Mobile apps (customer, driver) are Flutter. Only the API needs a container orchestration platform.

## Decision

Host the NestJS API on **AWS EKS** in the **`me-south-1`** (Bahrain) region.

## Architecture

```
me-south-1 (Bahrain)
├── VPC (10.0.0.0/16)
│   ├── Public subnets → ALB, NAT Gateway
│   └── Private subnets → EKS nodes, RDS, ElastiCache
├── EKS Cluster
│   ├── suqya-api Deployment (3–10 pods, HPA)
│   ├── suqya-worker Deployment (BullMQ processors)
│   └── AWS Load Balancer Controller → ALB
├── RDS PostgreSQL 16 (Multi-AZ in production)
├── ElastiCache Redis 7
└── S3 (documents, POD, invoices)
```

Infrastructure defined in:
- `infra/terraform/main.tf` — VPC, RDS, Redis, S3
- `infra/k8s/api-deployment.yaml` — Deployment, Service, HPA

## Rationale

### Why EKS over alternatives

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **EKS** | Full K8s, HPA, IRSA, AWS integration | Operational complexity | ✅ Selected |
| ECS Fargate | Simpler, serverless containers | No HPA granularity, WebSocket limitations | ❌ |
| Railway / Render | Fast setup, low ops | No me-south-1, limited scaling | ❌ (dev only) |
| EC2 + Docker Compose | Simple | No auto-scaling, manual failover | ❌ |
| Lambda | Serverless | 15-min timeout, no WebSocket, no BullMQ | ❌ |
| Vercel | Already used for web | 10s function timeout, no WebSocket | ❌ (API incompatible) |

### Why me-south-1 (Bahrain)

| Factor | me-south-1 | eu-west-1 | us-east-1 |
|--------|------------|-----------|-----------|
| Latency to Riyadh | ~15ms | ~120ms | ~200ms |
| PDPL data residency | ✅ GCC region | ❌ EU | ❌ US |
| AWS service availability | ✅ EKS, RDS, ElastiCache | ✅ Full | ✅ Full |
| ZATCA proximity | ✅ Same timezone (AST) | ❌ | ❌ |

Saudi Arabia does not yet have an AWS region. Bahrain (`me-south-1`) is the closest GCC region and aligns with PDPL data residency requirements per our legal review.

### Why not Vercel for API

The README explicitly states: "The NestJS API requires a persistent server (Docker/Kubernetes/Railway). It is not deployed to Vercel."

Reasons:
- WebSocket connections for live driver tracking
- BullMQ workers need persistent Redis connections
- Order state machine and dispatch logic run continuously
- ZATCA invoice generation with cryptographic signing
- Moyasar webhook endpoint needs stable URL

## Configuration

### API deployment (`infra/k8s/api-deployment.yaml`)

| Setting | Value |
|---------|-------|
| Replicas | 3 (min), 10 (max via HPA) |
| CPU target | 70% utilization |
| Container port | 4000 |
| Health check | `GET /v1/tenants/public` |
| Secrets | `suqya-secrets` K8s secret from AWS Secrets Manager |

### Docker image (`infra/docker/Dockerfile.api`)

Multi-stage build:
1. Node 20 Alpine builder → compile TypeScript, generate Prisma client
2. Node 20 Alpine runtime → `node dist/main.js` on port 4000

### CI/CD integration

`.github/workflows/ci.yml`:
- `build-api` job builds Docker image tagged `suqya/api:${{ github.sha }}`
- `deploy-staging` (on `develop`) → EKS staging
- `deploy-production` (on `main`) → EKS production with manual approval

## Consequences

### Positive

- Horizontal pod autoscaling handles Riyadh peak demand
- Blue-green deployments for zero-downtime releases
- IRSA for secure S3 access without embedded credentials
- Same Docker image runs locally, in CI, and in production
- Kubernetes ecosystem (Helm, Prometheus, Datadog agent)
- Multi-AZ RDS failover integrated with EKS in same VPC

### Negative

- EKS control plane cost (~$73/month) regardless of workload
- Requires Kubernetes operational knowledge
- Cluster upgrades need planning (quarterly)
- NAT Gateway cost (~$100/month) for private subnet internet access
- More complex than Railway/Render for initial development

### Cost estimate

| Environment | Monthly Cost |
|-------------|-------------|
| Staging | ~$400 |
| Production | ~$1,300 |
| Total | ~$1,700 |

Acceptable for a platform targeting SAR 500k+ monthly GMV.

## Migration Path

| Phase | Action |
|-------|--------|
| Sprint 11 (now) | EKS staging + production, Terraform IaC |
| Sprint 12 | ECR image registry, OIDC for GitHub Actions |
| Phase 15 | Separate worker deployment, Karpenter for node autoscaling |
| Phase 16 | Multi-region (eu-west-1 standby) for DR |

## Alternatives Considered

### Railway
Used during early development. Lacks `me-south-1` region and advanced scaling. Suitable for developer preview environments only.

### AWS App Runner
Simpler than EKS but lacks WebSocket support and fine-grained HPA. Not suitable for real-time tracking.

### Self-managed K8s on EC2
Same capabilities as EKS but team must manage control plane upgrades, etcd backups. EKS offloads this for $73/month — worth it.

## References

- [Infrastructure](../deployment/infrastructure.md)
- [Deployment Guide](../deployment/deployment-guide.md)
- [Disaster Recovery](../operations/disaster-recovery.md)
- [ADR-001: Modular Monolith](001-modular-monolith.md)

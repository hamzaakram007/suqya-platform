# Disaster Recovery Plan

**Phase 14 · Sprint 11** — Business continuity for Suqya platform.

## Objectives

| Metric | Target | Scope |
|--------|--------|-------|
| **RTO** (Recovery Time Objective) | 4 hours | Full API + database restoration |
| **RPO** (Recovery Point Objective) | 1 hour | Maximum acceptable data loss |
| **Availability SLA** | 99.9% | Monthly uptime (excludes planned maintenance) |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| RDS failure | Low | Critical | Multi-AZ, automated backups, cross-region snapshot copy |
| EKS cluster failure | Low | Critical | Multi-AZ node groups, blue-green deployments |
| Region outage (`me-south-1`) | Very Low | Critical | Cross-region snapshot restore (manual, 8h RTO) |
| Moyasar outage | Medium | High | Cash payment fallback, queue card retries |
| ZATCA API outage | Medium | Medium | Queue submissions, retry with exponential backoff |
| S3 data loss | Very Low | High | Versioning enabled, cross-region replication |
| DDoS attack | Medium | High | AWS WAF, CloudFront, rate limiting |
| Data breach | Low | Critical | Encryption, RLS, audit logs, PDPL playbook |

## Backup Strategy

### RDS PostgreSQL

| Setting | Production | Staging |
|---------|------------|---------|
| Automated backups | Enabled | Enabled |
| Retention | 35 days | 7 days |
| Backup window | 02:00–03:00 AST | 02:00–03:00 AST |
| Multi-AZ | Yes | No |
| Cross-region snapshot | `eu-west-1` (weekly) | No |

**Manual snapshot** (before every production deploy):

```bash
aws rds create-db-snapshot \
  --db-instance-identifier suqya-production \
  --db-snapshot-identifier suqya-pre-deploy-$(date +%Y%m%d-%H%M)
```

### Redis (ElastiCache)

- Redis is ephemeral (cache + queue state)
- BullMQ jobs are idempotent — safe to replay after Redis loss
- Active sessions may require re-authentication
- No backup required; rebuild from empty state

### S3

| Setting | Value |
|---------|-------|
| Versioning | Enabled |
| Cross-region replication | `me-south-1` → `eu-west-1` |
| Lifecycle | Glacier after 365 days for POD/invoice archives |

### Application state

- All persistent state in PostgreSQL
- No local disk state on API pods
- Kubernetes manifests in Git (`infra/k8s/`)
- Terraform state in S3 backend with locking

## Recovery Procedures

### Scenario 1: Single API pod failure

**Detection**: Kubernetes liveness probe failure, pod restart loop.

**Recovery** (automatic):
1. Kubernetes restarts pod
2. HPA maintains minimum 3 replicas
3. ALB routes around unhealthy targets

**Manual intervention** (if persistent):
```bash
kubectl describe pod <pod-name> -n suqya-production
kubectl logs <pod-name> -n suqya-production --previous
kubectl delete pod <pod-name> -n suqya-production  # force reschedule
```

**RTO**: 2 minutes (automatic).

### Scenario 2: Full EKS cluster failure

**Detection**: All health checks fail, `kubectl` unreachable.

**Recovery**:
1. Provision new EKS cluster via Terraform (or failover to pre-provisioned standby)
2. Apply manifests: `kubectl apply -f infra/k8s/ -n suqya-production`
3. Restore latest RDS snapshot if database also affected
4. Update DNS/ALB to new cluster endpoint
5. Verify smoke tests

**RTO**: 2–4 hours.

### Scenario 3: RDS database corruption/failure

**Detection**: API returns 500 on all DB queries, RDS CloudWatch alarms.

**Recovery**:
1. Confirm failure scope (primary only vs. both AZs)
2. If Multi-AZ failover: automatic (~60 seconds)
3. If restore needed:
   ```bash
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier suqya-production-restored \
     --db-snapshot-identifier suqya-pre-deploy-YYYYMMDD-HHMM
   ```
4. Update `DATABASE_URL` in `suqya-secrets`
5. Restart API pods: `kubectl rollout restart deployment/suqya-api`
6. Run `prisma migrate deploy` to ensure schema is current
7. Verify data integrity (order count, latest transaction timestamps)

**RTO**: 1–2 hours (Multi-AZ failover: 60 seconds).
**RPO**: Up to 1 hour (point-in-time recovery available).

### Scenario 4: Complete region failure (`me-south-1`)

**Detection**: All AWS services in region unreachable.

**Recovery** (manual, disaster scenario):
1. Restore RDS snapshot in `eu-west-1`
2. Provision EKS cluster in `eu-west-1`
3. Deploy API from latest ECR image
4. Update DNS (Route 53 failover record)
5. Update Moyasar webhook URL and ZATCA callback URLs
6. Notify customers via SMS and social media

**RTO**: 8 hours.
**RPO**: Up to 24 hours (weekly cross-region snapshot).

> Full multi-region active-active is planned for Phase 16 (GCC expansion).

### Scenario 5: Payment gateway failure (Moyasar)

**Detection**: Payment success rate drops below 80%, Moyasar status page confirms outage.

**Recovery**:
1. Enable tenant feature flag: `payments.cash_only=true`
2. Customer app shows "Card payments temporarily unavailable — cash on delivery available"
3. Queue failed card transactions for retry when Moyasar recovers
4. Monitor Moyasar status: https://moyasar.com/status

**RTO**: Immediate (cash fallback).
**RPO**: No data loss (transactions remain `pending`).

### Scenario 6: ZATCA API failure

**Detection**: Invoice submission failure rate > 5%.

**Recovery**:
1. Invoices continue generating locally (QR code, PDF)
2. Fatoora submissions queued in BullMQ with retry (max 72 hours per ZATCA rules)
3. Admin dashboard shows pending submissions count
4. Batch re-submit when API recovers

**RTO**: 0 (invoicing continues, submission deferred).
**RPO**: No data loss.

### Scenario 7: Data breach

**Detection**: Anomalous access patterns, audit log alerts, external report.

**Recovery** (PDPL-compliant):
1. **Contain**: Revoke compromised credentials, isolate affected systems
2. **Assess**: Determine scope (which tenants, which PII categories)
3. **Notify**: SDAIA within 72 hours (PDPL Article 20)
4. **Remediate**: Patch vulnerability, rotate all secrets
5. **Document**: Incident report in `security/incidents/`
6. **Notify affected users**: Via SMS and in-app notification

See [Security Policy](../security/security-policy.md) for full incident response playbook.

## Rollback Procedures

### Application rollback

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/suqya-api -n suqya-production

# Rollback to specific revision
kubectl rollout history deployment/suqya-api -n suqya-production
kubectl rollout undo deployment/suqya-api --to-revision=N -n suqya-production
```

### Database rollback

- **Never** rollback migrations in production
- Restore from pre-deploy snapshot instead
- Point-in-time recovery for granular rollback:
  ```bash
  aws rds restore-db-instance-to-point-in-time \
    --source-db-instance-identifier suqya-production \
    --target-db-instance-identifier suqya-production-pitr \
    --restore-time 2026-07-09T10:00:00Z
  ```

### Vercel rollback

1. Vercel dashboard → Deployments → select previous stable deployment
2. Click "Promote to Production"

## Testing Schedule

| Test | Frequency | Last Tested | Next Due |
|------|-----------|-------------|----------|
| RDS snapshot restore (staging) | Monthly | — | Sprint 12 |
| API pod kill + recovery | Weekly (automated) | — | Ongoing |
| Blue-green deployment drill | Per release | — | Each deploy |
| Full DR tabletop exercise | Quarterly | — | Q3 2026 |
| PDPL breach simulation | Semi-annually | — | Q4 2026 |

## Emergency Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| Ops Lead | ops-lead@suqya.sa | P1/P2 |
| Engineering Lead | eng-lead@suqya.sa | P1 |
| AWS Support | Enterprise support case | Infrastructure P1 |
| Moyasar Support | support@moyasar.com | Payment P1 |
| ZATCA Technical | fatoora.zatca.gov.sa | Compliance |

## Related Documentation

- [Operations Manual](ops-manual.md)
- [Troubleshooting](troubleshooting.md)
- [Deployment Guide](../deployment/deployment-guide.md)
- [Security Policy](../security/security-policy.md)

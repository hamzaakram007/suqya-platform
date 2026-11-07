# Troubleshooting Guide

**Phase 14 · Sprint 11** — Common issues and resolutions for Suqya platform.

## Quick Diagnostics

```bash
# API health
curl -s https://api.suqya.sa/v1/tenants/public | jq .

# Pod status
kubectl get pods -n suqya-production -l app=suqya-api

# Recent pod logs
kubectl logs -l app=suqya-api -n suqya-production --tail=100

# Redis connectivity (from debug pod)
kubectl run redis-test --rm -it --image=redis:7-alpine -n suqya-production -- redis-cli -h $REDIS_HOST ping

# Database connectivity
kubectl run pg-test --rm -it --image=postgres:16-alpine -n suqya-production -- psql $DATABASE_URL -c "SELECT 1"
```

## API Issues

### API returns 502/503

**Symptoms**: All clients fail, ALB returns bad gateway.

**Diagnosis**:
```bash
kubectl get pods -n suqya-production -l app=suqya-api
kubectl describe deployment suqya-api -n suqya-production
```

**Causes & fixes**:

| Cause | Fix |
|-------|-----|
| All pods crashing (OOM) | Increase memory limit in `infra/k8s/api-deployment.yaml`, redeploy |
| Pods not ready (DB down) | Check RDS status in AWS console, fail over if Multi-AZ |
| Image pull failure | Verify ECR credentials, check image tag exists |
| Migration failure on startup | Run `prisma migrate deploy` manually, check migration logs |

### API returns 401 Unauthorized

**Symptoms**: Authenticated requests rejected.

**Causes & fixes**:

| Cause | Fix |
|-------|-----|
| Expired JWT | Client should refresh token via `POST /v1/auth/refresh` |
| Wrong `X-Tenant-Id` header | Verify tenant UUID matches JWT claims |
| JWT_SECRET rotated | All sessions invalidated — users must re-login |
| Missing Bearer prefix | Header must be `Authorization: Bearer <token>` |

### API returns 429 Too Many Requests

**Symptoms**: Rate limit exceeded.

**Cause**: Redis-backed rate limiter (100 req/min/user).

**Fix**:
- Normal: wait 60 seconds
- Bug/abuse: check `ratelimit:{userId}` keys in Redis
- Emergency: increase limit in `apps/api/src/common/guards/rate-limit.guard.ts`

### Slow API responses (p99 > 500ms)

**Diagnosis**:
```bash
# Check RDS performance insights
aws rds describe-db-instances --db-instance-identifier suqya-production

# Check slow queries in API logs
kubectl logs -l app=suqya-api -n suqya-production | grep "slow query"
```

**Causes & fixes**:

| Cause | Fix |
|-------|-----|
| Missing DB index | Add index via Prisma migration |
| N+1 queries | Review Prisma `include` usage in service layer |
| Redis connection pool exhausted | Scale Redis or increase connection limit |
| High CPU on pods | HPA should scale; check if CPU limit too low |
| PostGIS spatial query | Add spatial index on `DriverLocation` and `DeliveryZone` |

## Order & Dispatch Issues

### Orders stuck in `pending`

**Symptoms**: Order created but no supplier receives it.

**Diagnosis**:
1. Check if delivery address is within an active `DeliveryZone`
2. Verify at least one supplier is active for the tenant
3. Check BullMQ dispatch queue: `dispatch` jobs pending?

**Fix**:
- No suppliers in zone → expand zone or onboard supplier
- Dispatch processor crashed → restart worker pods
- Manual: admin assigns supplier via dashboard

### Orders stuck in `dispatching`

**Symptoms**: No driver receives job offer.

**Diagnosis**:
1. Check online drivers: `GET /v1/drivers?status=online&tenantId=...`
2. Review dispatch scoring in `apps/api/src/modules/dispatch/dispatch.service.ts`
3. Check if all drivers rejected or timed out (30s offer window)

**Fix**:
- No online drivers → contact supplier to bring drivers online
- All rejected → expand search radius or manual assign
- Dispatch bug → check `dispatch.service.spec.ts` for regression

### Driver not receiving job offers

**Symptoms**: Driver is online but no push notification.

**Checklist**:
- [ ] Driver app has FCM token registered (`Device` table)
- [ ] Driver `status` is `online` (not `busy`)
- [ ] Driver is within dispatch radius of order pickup
- [ ] Driver not on another active job
- [ ] FCM server key valid in secrets

## Payment Issues

### Moyasar payment fails

**Symptoms**: Customer sees payment error, transaction stays `pending`.

**Diagnosis**:
1. Check transaction in admin → Payments
2. Review Moyasar dashboard for decline reason
3. Check webhook delivery: `POST /v1/payments/webhook`

**Common causes**:

| Moyasar Error | Resolution |
|---------------|------------|
| `card_declined` | Customer tries different card or cash |
| `insufficient_funds` | Customer notified, order stays `payment_pending` |
| `invalid_api_key` | Rotate `MOYASAR_SECRET_KEY` in secrets |
| Webhook signature mismatch | Verify HMAC in `payment.service.ts` `verifyWebhook()` |

### Payment captured but order not completed

**Symptoms**: Moyasar shows success, order still `payment_pending`.

**Cause**: Webhook not processed (network, signature failure).

**Fix**:
```bash
# Manual capture via API
curl -X POST https://api.suqya.sa/v1/payments/{transactionId}/capture \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "X-Tenant-Id: $TENANT_ID"
```

### Split payment issues

**Symptoms**: Partial card + cash payment not reconciling.

**Check**: `PaymentSplit` records in database. Each split must reach `completed` status independently.

## ZATCA / Invoicing Issues

### Invoice QR code invalid

**Symptoms**: ZATCA validator rejects QR code.

**Diagnosis**: Check TLV encoding in `ZatcaService.generateQrTlv()` (`apps/api/src/modules/invoice/invoice.service.ts`).

**Required TLV tags**:
1. Seller name
2. VAT registration number
3. Timestamp (ISO 8601)
4. Invoice total (with VAT)
5. VAT amount

**Fix**: Regenerate invoice → `POST /v1/invoices/{id}/regenerate-qr`

### Fatoora submission rejected

**Symptoms**: `zatcaStatus: failed` on invoice.

**Common errors**:

| ZATCA Response | Fix |
|----------------|-----|
| `INVALID_VAT_NUMBER` | Update `ZATCA_VAT_NUMBER` in tenant settings |
| `DUPLICATE_UUID` | UUID collision — regenerate with new UUID |
| `INVALID_HASH` | Recompute invoice hash from UBL XML |
| `CERTIFICATE_EXPIRED` | Renew EGS certificate with ZATCA |
| `SANDBOX_ONLY` | Switch `ZATCA_ENV` to `production` with production credentials |

### B2B clearance timeout

**Symptoms**: Standard invoices (B2B) not cleared within 24 hours.

**Fix**: B2B requires real-time clearance (not 24h reporting). Check `submissionType: clearance` in `InvoiceZatcaSubmission`. Retry via admin dashboard.

## Authentication Issues

### OTP not received

**Checklist**:
- [ ] Phone number format: `+966XXXXXXXXX`
- [ ] OTP not throttled (max 3 per 10 minutes per `otp:{phone}:attempts`)
- [ ] SMS provider (Unifonic) balance sufficient
- [ ] Check `OtpCode` table for recent entries

### Flutter app login loop

**Cause**: API URL misconfigured or CORS blocking.

**Fix**: Verify `NEXT_PUBLIC_API_URL` / Flutter env points to correct API. Check `CORS_ORIGINS` includes app origin.

## Database Issues

### Migration failed

```bash
# Check migration status
npx prisma migrate status --schema=apps/api/prisma/schema.prisma

# Resolve failed migration
npx prisma migrate resolve --applied "20260101_migration_name" --schema=apps/api/prisma/schema.prisma
```

### Connection pool exhausted

**Symptoms**: `Error: Too many connections` in API logs.

**Fix**:
- Enable PgBouncer or RDS Proxy
- Reduce Prisma connection limit in `DATABASE_URL` (`?connection_limit=10`)
- Scale down API replicas if over-provisioned

## Web Frontend Issues

### Admin dashboard blank page

**Checklist**:
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel env vars
- [ ] API CORS includes Vercel domain
- [ ] Browser console for JS errors
- [ ] Vercel deployment logs

### Supplier portal not loading orders

**Cause**: Wrong `X-Tenant-Id` or supplier not linked to tenant.

**Fix**: Verify supplier's `tenantId` in database matches portal configuration.

## Mobile App Issues

### Customer app — location not detected

- Ensure location permissions granted (Android: fine location, iOS: when-in-use)
- Google Maps API key valid and billing enabled
- National Address geocoding may fail for new developments — allow manual pin drop

### Driver app — background location stops

- Android: disable battery optimization for Suqya Driver app
- iOS: enable "Always" location permission
- Check `DriverLocation` table for recent updates

### Push notifications not received

1. Verify FCM token in `Device` table
2. Check FCM server key in API secrets
3. Test with Firebase console → Send test message
4. iOS: ensure APNs certificate configured in Firebase

## Infrastructure Issues

### Redis connection refused

```bash
# Check ElastiCache status
aws elasticache describe-cache-clusters --cache-cluster-id suqya-production

# Verify security group allows EKS → Redis on port 6379
```

### S3 upload fails (POD photos)

- Check IRSA role has `s3:PutObject` on `suqya-production-assets`
- Verify bucket exists and encryption config
- Check file size limit (max 10 MB per photo)

## Log Locations

| Component | Location |
|-----------|----------|
| API pods | `kubectl logs -l app=suqya-api -n suqya-production` |
| RDS | AWS RDS → Logs & events |
| ALB | S3 access logs bucket |
| Vercel | Vercel dashboard → Deployment → Functions logs |
| Moyasar | Moyasar dashboard → Logs |
| ZATCA | Admin → Invoices → Submission details |

## Escalation

If issue not resolved within SLA, escalate per [Operations Manual](ops-manual.md) alert response table.

## Related Documentation

- [Operations Manual](ops-manual.md)
- [Disaster Recovery](disaster-recovery.md)
- [Deployment Guide](../deployment/deployment-guide.md)
- [Security Policy](../security/security-policy.md)

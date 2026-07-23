# Operations Manual

**Phase 14 · Sprint 11** — Day-2 operations for the Suqya water tanker platform.

## Operations Team Structure

| Role | Responsibility | Hours |
|------|---------------|-------|
| Ops Lead | Escalations, dispatch overrides, supplier relations | 24/7 on-call rotation |
| L1 Support | Customer/driver phone + in-app tickets | 06:00–24:00 AST |
| L2 Engineering | API incidents, payment failures, ZATCA issues | On-call pager |
| Finance Ops | Settlements, credit accounts, VAT reconciliation | Business hours |

## Daily Operations Checklist

### Morning (06:00 AST)

- [ ] Review overnight order funnel (pending → completed conversion)
- [ ] Check EKS pod health: `kubectl get pods -n suqya-production`
- [ ] Verify BullMQ queue depths (dispatch, notification) — no backlog > 100
- [ ] Review Moyasar settlement report for previous day
- [ ] Check ZATCA submission failures in admin dashboard
- [ ] Confirm driver online count meets demand forecast for Riyadh peak (10:00–14:00)

### Midday (12:00 AST)

- [ ] Monitor live map for stuck orders (in_transit > 6 hours)
- [ ] Review supplier acceptance rate (target > 85%)
- [ ] Check credit overdue accounts — trigger reminders if due today
- [ ] Respond to open support tickets (SLA: 30 min first response)

### Evening (20:00 AST)

- [ ] End-of-day revenue reconciliation per tenant
- [ ] Review driver earnings settlements queued for next day
- [ ] Check RDS backup completion
- [ ] Hand off on-call notes to night shift

## Platform Components

### NestJS API (`apps/api`)

| Endpoint | Purpose |
|----------|---------|
| `GET /v1/tenants/public` | Health check (no auth) |
| `GET /v1/health` | Detailed health (DB, Redis) |
| `GET /v1/docs` | Swagger documentation |

**Key modules for ops:**

| Module | Path | Ops Relevance |
|--------|------|---------------|
| Order | `modules/order/` | Order lifecycle, state machine |
| Dispatch | `modules/dispatch/` | Driver assignment, auto-dispatch |
| Payment | `modules/payment/` | Moyasar intents, capture, webhooks |
| Invoice | `modules/invoice/` | ZATCA QR, Fatoora submission |
| Settlement | `modules/settlement/` | Supplier payouts |
| Support | `modules/support/` | Ticket management |
| Dispute | `modules/dispute/` | Order disputes |
| Analytics | `modules/analytics/` | KPI dashboards |

### Order State Machine

Ops must understand order statuses for intervention:

| Status | Ops Action Available |
|--------|---------------------|
| `pending` | Wait or manually assign supplier |
| `supplier_review` | Escalate to supplier via phone |
| `dispatching` | Override with manual driver assign |
| `driver_offered` | Re-offer to next driver if timeout |
| `in_transit` | Contact driver, update customer ETA |
| `delivered` | Verify POD submitted |
| `payment_pending` | Retry Moyasar capture |
| `disputed` | Admin resolution via dispute module |
| `cancelled` | Process refund if card payment captured |

### Admin Dashboard (`apps/admin-web`)

URL: https://admin-web-psi-sepia.vercel.app

| Section | Function |
|---------|----------|
| Live Map | All active deliveries across tenants |
| Orders | Search, filter, manual intervention |
| Tenants | Onboard, configure operating mode |
| Suppliers | CR/VAT verification, document review |
| Disputes | Resolution workflow |
| Analytics | Revenue, orders, heatmaps |
| Audit Log | Immutable action history |

### Supplier Portal (`apps/supplier-web`)

URL: https://supplier-web-one.vercel.app

Suppliers manage their own fleet. Ops intervenes only on escalations.

## Common Operational Procedures

### Manual dispatch override

When auto-dispatch fails or supplier requests specific driver:

1. Admin dashboard → Orders → select order
2. Click "Manual Assign" → choose driver from available list
3. System sends push notification to driver app
4. Audit log records `dispatch.manual_override` with admin user ID

API: `POST /v1/dispatch/assign` with `{ orderId, driverId }`.

### Supplier onboarding

1. Supplier registers via portal or admin creates account
2. Upload Commercial Registration (CR) and VAT certificate
3. Ops verifies documents in admin → Suppliers → Documents
4. Set operating mode: `marketplace`, `private`, or `franchise`
5. Configure delivery zones, tank sizes, pricing rules
6. Activate supplier → appears in order broadcast pool

### Credit customer approval

1. Customer applies via app (company CR, requested limit)
2. Ops or supplier reviews in admin → Credit Accounts
3. Approve with limit (e.g., SAR 50,000)
4. Credit account created in `CreditAccount` table
5. Customer can select "Credit" at payment step

### Payment failure handling

1. Check transaction status in admin → Payments
2. If Moyasar webhook missed: `POST /v1/payments/{id}/capture` manually
3. If card declined: notify customer via SMS, order stays `payment_pending`
4. Cash orders: driver confirms collection in driver app

### ZATCA invoice failure

1. Admin → Invoices → filter `zatcaStatus: failed`
2. Review `InvoiceZatcaSubmission.response` for error details
3. Common fixes:
   - Invalid VAT number → update tenant settings
   - Sandbox token expired → rotate `ZATCA_API_TOKEN`
   - Hash mismatch → regenerate invoice via `POST /v1/invoices/{id}/resubmit`
4. Re-submit to Fatoora API

### Dispute resolution

1. Admin → Disputes → review evidence (POD photos, GPS trail)
2. Options: full refund, partial refund, dismiss
3. Refund triggers Moyasar refund API + credit adjustment
4. Both parties notified via push + SMS

## Monitoring Dashboards

| Dashboard | Metrics |
|-----------|---------|
| Order Funnel | Created → Accepted → Delivered → Paid (hourly) |
| Fleet | Online drivers, avg response time, utilization |
| Revenue | GMV, commission, settlements pending |
| SLA | Delivery time p50/p95, acceptance rate |
| Payments | Success rate, failed webhooks, refund volume |
| ZATCA | Submissions/hour, failure rate, clearance latency |
| Infrastructure | API latency p99, error rate, pod restarts |

## Alert Response SLAs

| Severity | Example | Response | Resolution |
|----------|---------|----------|------------|
| P1 | API down, payments failing | 15 min | 1 hour |
| P2 | Dispatch backlog, ZATCA failures | 30 min | 4 hours |
| P3 | Single supplier offline | 2 hours | Next business day |
| P4 | Non-critical UI bug | 1 business day | Sprint backlog |

## Tenant Operating Modes

| Mode | Ops Implications |
|------|-----------------|
| `marketplace` | Platform owns customers; commission per order; multi-supplier dispatch |
| `private` | White-label; single supplier; SaaS billing via `subscription` module |
| `franchise` | Parent tenant manages branches; royalty reporting |

## Scheduled Maintenance

| Task | Frequency | Window |
|------|-----------|--------|
| RDS minor version upgrade | Quarterly | Sunday 02:00–04:00 AST |
| EKS node rotation | Monthly | Sunday 02:00–04:00 AST |
| JWT secret rotation | Quarterly | Coordinated deploy |
| SSL certificate renewal | Auto (ACM) | N/A |
| Database vacuum/analyze | Weekly | Automated via RDS maintenance |
| S3 lifecycle policy review | Quarterly | Business hours |

## Communication Templates

### Customer — delivery delay

> عزيزي العميل، نعتذر عن التأخير في توصيل طلبك رقم {orderNumber}. السائق في الطريق والوقت المتوقع للوصول {eta}. للاستفسار: 920000000

### Supplier — low acceptance rate warning

> تنبيه: معدل قبول الطلبات لديك انخفض إلى {rate}% خلال الأسبوع الماضي. يرجى تحسين الاستجابة لتجنب تقليل ظهوركم في نتائج البحث.

## Related Documentation

- [Troubleshooting](troubleshooting.md)
- [Disaster Recovery](disaster-recovery.md)
- [Deployment Guide](../deployment/deployment-guide.md)
- [Admin Manual](../manuals/admin.md)

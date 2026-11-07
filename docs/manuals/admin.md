# Admin Dashboard Manual

**Phase 14 · Sprint 11** — Operations guide for Suqya platform administrators.

**URL**: https://admin-web-psi-sepia.vercel.app  
**App**: `apps/admin-web` (Next.js 15)  
**API**: `apps/api` — admin endpoints under `/v1/admin/*`

## Getting Started

### Login

1. Navigate to the admin dashboard URL
2. Enter your admin email and password
3. Complete 2FA verification (TOTP via authenticator app)
4. You are redirected to the Operations Dashboard

Admin accounts require mandatory 2FA (`TwoFactorService` in `modules/security/`). Contact the platform engineering lead to provision your account.

### Pilot / Internal Alpha (sandbox OTP)

For **Phase 1 dry-runs** against a seeded API (local Compose or staging), use OTP login instead of email/password:

| Field | Value |
|-------|-------|
| Tenant | `default-tenant` |
| Admin phone | `+966501234567` |
| OTP | `123456` when `OTP_MODE=sandbox` |

Seed first: `npm run db:seed:pilot`. Full checklist (2 suppliers / 10 drivers / sample orders): [`../testing/pilot-ops.md`](../testing/pilot-ops.md).

### Dashboard Overview

The operations dashboard shows real-time KPIs:

| Widget | Description |
|--------|-------------|
| Active Orders | Orders currently in progress across all tenants |
| Today's Revenue | GMV and platform commission for today |
| Online Drivers | Count of drivers currently available |
| Pending Disputes | Disputes awaiting resolution |
| ZATCA Alerts | Failed invoice submissions requiring attention |
| Support Tickets | Open tickets by priority |

## Live Map

**Navigation**: Dashboard → Live Map

Real-time view of all active deliveries across tenants.

| Element | Description |
|---------|-------------|
| Driver markers | Green = online, blue = on delivery, grey = offline |
| Order routes | Line from filling station to customer address |
| Heatmap overlay | Order density by district (toggle on/off) |

### Actions from Live Map

- Click a driver → view profile, current job, contact
- Click an order → view details, manual intervene
- Filter by tenant, city, status

## Order Management

**Navigation**: Orders

### Search and filter

| Filter | Options |
|--------|---------|
| Status | pending, dispatching, in_transit, delivered, completed, cancelled, disputed |
| Tenant | All or specific tenant |
| Date range | Custom or presets (today, week, month) |
| City | Riyadh, Jeddah, Dammam, etc. |
| Payment method | card, cash, credit, wallet |

### Manual intervention

When auto-dispatch fails or ops needs to override:

1. Open order detail
2. Click **Manual Assign**
3. Select supplier (if not yet assigned)
4. Select driver from available list
5. Confirm — driver receives push notification

### Cancel order

1. Open order → **Cancel**
2. Select reason (customer request, supplier unavailable, fraud)
3. If card payment captured → refund initiated via Moyasar
4. Audit log records cancellation with your user ID

## Tenant Management

**Navigation**: Tenants

### Operating modes

| Mode | Description | Configuration |
|------|-------------|---------------|
| `marketplace` | Platform owns customers; suppliers compete | Set commission rate (default 12%) |
| `private` | White-label for single supplier | Set monthly SaaS fee |
| `franchise` | Parent manages branches | Set royalty percentage |

### Onboard new tenant

1. **Create Tenant** → enter name (Arabic + English), operating mode
2. Configure settings:
   - Cities and delivery zones
   - Tank sizes and water types
   - Pricing rules and commissions
   - Payment methods enabled
3. Create tenant admin user
4. Activate tenant

### Tenant settings

| Setting | Location | Notes |
|---------|----------|-------|
| ZATCA VAT number | Tenant → Settings → Tax | Required for invoicing |
| Commission rate | Tenant → Settings → Commerce | Percentage per order |
| Feature flags | Tenant → Settings → Features | Enable/disable modules |
| Branding | Tenant → Settings → Brand | Logo, colors (private mode) |

## Supplier Management

**Navigation**: Suppliers

### Verification workflow

1. Supplier registers via portal or admin creates account
2. Supplier uploads documents:
   - Commercial Registration (CR)
   - VAT certificate
   - Water quality certificates
3. Admin reviews in **Suppliers → Documents**
4. Approve or reject with reason
5. Expiry alerts sent 30 days before document expiration

### Supplier actions

| Action | When |
|--------|------|
| Approve | Documents verified, CR/VAT valid |
| Suspend | Quality issues, low acceptance rate (< 70%) |
| Deactivate | Contract ended, compliance failure |

## Customer & Credit Management

**Navigation**: Customers, Credit Accounts

### Credit approval

1. Customer applies via mobile app (company CR, requested limit)
2. Review application in **Credit Accounts → Pending**
3. Verify company CR and payment history
4. Approve with limit (e.g., SAR 50,000) or reject with reason
5. Customer can now select "Credit" at checkout

### Credit monitoring

| Report | Description |
|--------|-------------|
| Aging | Current, 30, 60, 90+ days overdue |
| Utilization | Credit used vs. limit per account |
| Default rate | Percentage of overdue accounts |

## Dispute Resolution

**Navigation**: Disputes

### Resolution workflow

1. Open dispute → review evidence:
   - POD photos and customer signature
   - GPS trail of delivery
   - Order chat/support history
2. Decision options:
   - **Full refund** — Moyasar refund initiated
   - **Partial refund** — Adjust amount, process via Moyasar
   - **Dismiss** — No action, order stands as completed
3. Both parties notified via push + SMS
4. Audit log records decision

## Financial Operations

**Navigation**: Finance

### Settlements

Supplier payouts processed via `modules/settlement/`:

1. **Settlements → Pending** — review amounts per supplier
2. Verify: orders completed, commission deducted, no disputes open
3. Approve batch → bank transfer initiated
4. Settlement report exported as PDF

### Invoicing (ZATCA)

**Navigation**: Invoices

| Column | Description |
|--------|-------------|
| Invoice # | Sequential per tenant (INV-00000001) |
| Type | Simplified (B2C) or Standard (B2B) |
| ZATCA Status | submitted, reported, cleared, failed |
| QR Code | TLV-encoded, displayed on PDF |

Failed submissions: click **Resubmit** to retry Fatoora API call.

### Accounting

Double-entry bookkeeping via `modules/accounting/`:
- Revenue recognition on order completion
- Commission income per marketplace order
- Supplier payable tracking
- VAT liability (15%)

## Analytics & Reporting

**Navigation**: Analytics

| Report | Metrics |
|--------|---------|
| Order funnel | Created → Accepted → Delivered → Paid |
| Revenue | GMV, commission, by tenant/supplier/city |
| Fleet | Driver utilization, avg response time |
| Customer | New vs. returning, NPS, churn |
| Delivery SLA | p50/p95 delivery time by zone |

Export formats: Excel, PDF. Scheduled reports via email (weekly).

## Configuration

**Navigation**: Settings

### Geography

Manage via `modules/catalog/`:
- Countries → Regions → Cities → Districts
- Delivery zones with PostGIS polygon boundaries
- Zone-specific pricing rules

### Catalog

| Item | Examples |
|------|----------|
| Tank sizes | 8,000L, 12,000L, 18,000L, 32,000L |
| Water types | Potable, irrigation, construction |
| Pricing rules | Base price + zone surcharge + time multiplier |

### Pricing rules

| Condition | Example |
|-----------|---------|
| Zone | Central Riyadh +SAR 20 |
| Time | Peak hours (10–14) × 1.2 |
| Tank size | 32,000L base SAR 450 |
| Coupon | RAMADAN2026 −10% |

## Audit Log

**Navigation**: Audit Log

Immutable record of all admin actions:

| Field | Example |
|-------|---------|
| User | admin@suqya.sa |
| Action | `order.cancel`, `supplier.approve`, `credit.limit_change` |
| Entity | Order #12345, Supplier "Al-Nour Water" |
| Timestamp | 2026-07-09 14:30 AST |
| Metadata | `{ "reason": "customer_request", "refundAmount": 350 }` |

Audit logs cannot be modified or deleted.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `G` then `O` | Go to Orders |
| `G` then `M` | Go to Live Map |
| `G` then `D` | Go to Disputes |
| `/` | Focus search |
| `Esc` | Close modal |

## Support Escalation

| Issue | Contact |
|-------|---------|
| Platform bug | engineering@suqya.sa |
| Payment failure | finance@suqya.sa + Moyasar support |
| ZATCA compliance | compliance@suqya.sa |
| Security incident | security@suqya.sa (immediate) |

## Phase 1 pilot dry-run (operator)

Before inviting internal testers, walk this once on the environment you intend to use:

1. **Seed** — `npm run db:seed:pilot` (see [`../testing/pilot-ops.md`](../testing/pilot-ops.md)).
2. **Suppliers** — confirm Al-Nour + Najd are **active** with CR/VAT and verified sandbox documents.
3. **Drivers** — confirm 10 drivers (5 each), ≥6 online on the live map / drivers list.
4. **Orders** — open `PILOT-0001` / `PILOT-0002` (`supplier_review`); have Supplier 1 accept and dispatch.
5. **Intervene** — practice **Manual Assign** if auto-dispatch times out (see Order Management above).
6. **Log** — fill the dry-run log table in `pilot-ops.md` (date, operator, local vs staging).

This matches launch-plan Phase 1 (2 suppliers, 10 drivers). Store publishing is **out of scope**.

## Related Documentation

- [Pilot ops pack](../testing/pilot-ops.md)
- [Launch plan](../testing/launch-plan.md)
- [Operations Manual](../operations/ops-manual.md)
- [Troubleshooting](../operations/troubleshooting.md)
- [Security Policy](../security/security-policy.md)
- [User Journeys](../ux/user-journeys.md)

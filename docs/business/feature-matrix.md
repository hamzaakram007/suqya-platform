# Feature Matrix & User Stories

## Release Tiers

| Tier | Timeline | Scope |
|------|----------|-------|
| **Foundation** | Month 1–3 | Auth, tenants, orders, dispatch v1, payments (cash+card), ZATCA B2C, tracking, basic admin |
| **Growth** | Month 4–6 | Credit system, invoicing suite, supplier portal, driver earnings, all notification channels |
| **Enterprise** | Month 7–9 | Full accounting, ERP lite, reports/BI, coupons, loyalty, subscriptions |
| **Intelligence** | Month 10–12 | AI dispatch v2, demand forecasting, fraud detection, white-label, franchise |

---

## Foundation (Month 1–3)

### Auth & Tenancy
- [ ] OTP login via Saudi mobile number
- [ ] JWT access + refresh tokens
- [ ] Multi-tenant isolation (row-level)
- [ ] RBAC (customer, driver, supplier, admin roles)
- [ ] Device registration

**User story:** As a customer, I want to log in with my mobile number and OTP so I can place orders without a password.

### Orders & Dispatch
- [ ] Create order (address, tank size, payment type)
- [ ] Rule-based dispatch (distance, capacity, SLA)
- [ ] Supplier accept/reject
- [ ] Driver job offer with 30s timeout
- [ ] Order status lifecycle
- [ ] Live GPS tracking
- [ ] Proof of delivery (photo, signature, OTP)

**User story:** As a customer, I want to place an order in 3 taps and track my tanker in real time.

### Payments (Foundation)
- [ ] Cash on delivery
- [ ] Card payment (Mada, Visa, Apple Pay via gateway)
- [ ] Payment intent + capture flow

### Invoicing (Foundation)
- [ ] Simplified B2C ZATCA invoice
- [ ] PDF export with QR code

### Admin (Foundation)
- [ ] User/supplier/driver CRUD
- [ ] Order management
- [ ] Basic KPI dashboard
- [ ] City/area management

---

## Growth (Month 4–6)

### Credit System
- [ ] Credit account application workflow
- [ ] Credit limit management
- [ ] Outstanding balance tracking
- [ ] Partial payments
- [ ] Payment due dates (Gregorian + Hijri)
- [ ] Aging report
- [ ] Automated reminders (SMS, WhatsApp, email, push)

**User story:** As a factory manager, I want to order on credit and receive monthly statements with aging breakdown.

### Supplier Portal
- [ ] Dashboard with KPIs
- [ ] Order acceptance
- [ ] Fleet management (trucks, drivers)
- [ ] Revenue and settlement reports
- [ ] Customer list

### Driver Earnings
- [ ] Per-trip / per-distance / per-tank-size compensation rules
- [ ] Earnings history and wallet
- [ ] Performance score

### Notifications
- [ ] Push (FCM)
- [ ] SMS (Unifonic/Msegat)
- [ ] WhatsApp (Twilio)
- [ ] Email (SES)
- [ ] Channel preference matrix

### Invoicing (Growth)
- [ ] Standard B2B ZATCA invoice with clearance
- [ ] Credit notes, receipts
- [ ] Customer/supplier statements

---

## Enterprise (Month 7–9)

### Accounting
- [ ] Double-entry chart of accounts
- [ ] Automatic journal entries on order completion
- [ ] Customer/supplier/driver ledgers
- [ ] P&L, balance sheet, cash flow reports
- [ ] VAT reports

### ERP Lite (Supplier)
- [ ] Branch management
- [ ] Water source management
- [ ] Truck maintenance schedules
- [ ] Fuel expense tracking
- [ ] Employee management

### Customer Features
- [ ] Recurring subscriptions
- [ ] Scheduled deliveries
- [ ] Loyalty points
- [ ] Referral program
- [ ] Promo codes / coupons
- [ ] Multiple delivery addresses
- [ ] Favorite suppliers/drivers

### Reporting & BI
- [ ] Sales, revenue, orders by city
- [ ] Top customers/suppliers/drivers
- [ ] Heatmaps, peak hours
- [ ] Cancellation reports
- [ ] Excel/PDF export

---

## Intelligence (Month 10–12)

### AI & Optimization
- [ ] ML dispatch optimization (post 50k orders)
- [ ] Demand forecasting by zone/time
- [ ] Dynamic pricing recommendations
- [ ] Fraud detection (GPS spoof, velocity)
- [ ] Predictive truck maintenance
- [ ] AI support chatbot (Arabic)

### Multi-Tenant Advanced
- [ ] White-label branding (domain, logo, colors)
- [ ] Franchise parent/branch hierarchy
- [ ] Feature flags per tenant
- [ ] Webhook API for enterprise ERP

---

## Feature Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| OTP auth + orders | High | Medium | P0 |
| Rule-based dispatch | High | Medium | P0 |
| Live tracking | High | Medium | P0 |
| ZATCA B2C invoicing | High | High | P0 |
| Card payments | High | Medium | P0 |
| Credit system | High | High | P1 |
| Supplier portal | High | High | P1 |
| Double-entry accounting | Medium | High | P2 |
| AI dispatch | Medium | High | P3 |
| White-label | Medium | Medium | P3 |

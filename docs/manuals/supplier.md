# Supplier Portal Manual

**Phase 14 · Sprint 11** — Guide for water tanker suppliers using the Suqya platform.

**URL**: https://supplier-web-one.vercel.app  
**App**: `apps/supplier-web` (Next.js 15)  
**API**: `apps/api` — supplier endpoints under `/v1/suppliers/*`

## Getting Started

### Registration

1. Navigate to the supplier portal URL
2. Click **Register** (تسجيل مورد جديد)
3. Enter company details:
   - Company name (Arabic and English)
   - Commercial Registration (CR) number
   - VAT registration number
   - Contact person name and phone
   - Email address
4. Upload required documents:
   - CR certificate (شهادة السجل التجاري)
   - VAT certificate (شهادة ضريبة القيمة المضافة)
   - Water quality certificate (شهادة جودة المياه)
5. Submit for admin verification
6. You receive email notification when approved (typically 1–2 business days)

### Login

1. Enter email and password
2. Optional: complete 2FA if enabled
3. Dashboard loads with your supplier KPIs

## Dashboard

Your daily command center showing:

| Widget | Description |
|--------|-------------|
| Pending Orders | Orders awaiting your acceptance |
| Active Deliveries | Orders currently being delivered |
| Today's Revenue | Completed order revenue (SAR) |
| Fleet Status | Online/offline drivers and trucks |
| Credit Customers | Outstanding credit balances |
| Document Alerts | Expiring certificates requiring renewal |

## Order Management

### Incoming orders

When a customer places an order in your delivery zone:

1. **Notification** — browser push + sound alert
2. **Review** — order details: tank size, water type, address, price
3. **Decision**:
   - **Accept** — proceed to dispatch
   - **Reject** — select reason (out of capacity, zone unreachable, schedule conflict)
   - **Counter-offer** — propose different price or time (enterprise orders)

> Target acceptance rate: > 85%. Low acceptance reduces your visibility in the marketplace.

### Order statuses you manage

| Status | Your Action |
|--------|-------------|
| `supplier_review` | Accept or reject |
| `dispatching` | Assign driver (auto or manual) |
| `accepted` | Monitor driver progress |
| `delivered` | Verify POD submitted |
| `completed` | View in settlements |

### Dispatch

**Auto-dispatch** (recommended):
- System finds nearest available driver
- Driver has 30 seconds to accept
- If rejected/timeout, offered to next driver

**Manual dispatch**:
1. Open order → **Assign Driver**
2. View available drivers on map
3. Select driver → confirm
4. Driver receives job offer in driver app

## Fleet Management

**Navigation**: Fleet

### Drivers

| Action | How |
|--------|-----|
| Add driver | Fleet → Drivers → Add → enter name, phone, license |
| Upload documents | Driver license, Istimara (vehicle registration) |
| Deactivate | Fleet → Drivers → select → Deactivate |
| View earnings | Fleet → Drivers → select → Earnings tab |

### Trucks

| Field | Description |
|-------|-------------|
| Plate number | Saudi plate format |
| Tank capacity | Must match a catalog tank size |
| Water type | Potable, irrigation, etc. |
| Maintenance | Log service dates; alerts before due |

### Live fleet map

View all your drivers in real time:
- Green = online and available
- Blue = on active delivery
- Grey = offline

Click a driver to see current job, contact, or send message.

## Pricing

**Navigation**: Pricing

### Your pricing rules

Set prices per tank size and zone. Platform pricing rules may overlay:

| Component | Example |
|-----------|---------|
| Base price (18,000L) | SAR 300 |
| Zone surcharge (remote) | +SAR 50 |
| Peak hour multiplier | ×1.2 (10:00–14:00) |
| VAT (15%) | Added automatically |

Final price shown to customer includes VAT. Your settlement is based on subtotal minus platform commission.

### Coupons

Create promotional coupons for your customers:

1. Pricing → Coupons → Create
2. Set code, discount (% or fixed SAR), validity period
3. Optional: limit to specific tank sizes or zones

## Financial Management

### Settlements

**Navigation**: Finance → Settlements

| Column | Description |
|--------|-------------|
| Period | Settlement period (weekly) |
| Orders | Number of completed orders |
| Gross revenue | Total order value |
| Commission | Platform fee (marketplace mode) |
| Net payout | Amount transferred to your bank |

Settlement cycle: weekly, transferred to registered IBAN every Sunday.

### Credit customers

**Navigation**: Finance → Credit

Manage B2B customers with credit accounts:

| Action | Description |
|--------|-------------|
| Approve credit | Review application, set limit |
| View balance | Current outstanding amount |
| Send reminder | Manual payment reminder |
| Block credit | Suspend credit privileges |

Credit aging report: current, 30, 60, 90+ days.

### Invoices

All completed orders generate ZATCA-compliant tax invoices:
- Simplified invoice (B2C) — auto-reported to ZATCA within 24 hours
- Standard invoice (B2B) — cleared in real-time via Fatoora API
- Download PDF with QR code from Finance → Invoices

## Reports

**Navigation**: Reports

| Report | Frequency | Content |
|--------|-----------|---------|
| Daily summary | Daily | Orders, revenue, fleet utilization |
| Driver performance | Weekly | Deliveries, avg time, rating, earnings |
| Customer analysis | Monthly | Top customers, repeat rate, credit usage |
| Zone analysis | Monthly | Orders and revenue by delivery zone |
| Maintenance | Monthly | Upcoming truck service dates |

Export: Excel or PDF.

## Document Management

**Navigation**: Documents

Keep compliance documents current:

| Document | Renewal |
|----------|---------|
| Commercial Registration | Annual |
| VAT certificate | Annual |
| Water quality certificate | Annual |
| Municipal water extraction permit | Per municipality |

System alerts you 30 days before expiry. Expired documents may suspend your account.

## Settings

| Setting | Description |
|---------|-------------|
| Company profile | Name, logo, contact info |
| Bank details | IBAN for settlements |
| Notification preferences | Email, SMS, push for orders |
| Operating hours | Hours when you accept orders |
| Delivery zones | Zones you serve (within tenant geography) |
| Language | Arabic (default) or English |

## Mobile Access

The supplier portal is responsive and works on tablets. For on-the-go fleet monitoring, use a tablet in your operations office with the portal open on the Live Map view.

A dedicated supplier mobile app is planned for Phase 15.

## Tips for Success

1. **Accept quickly** — orders offered to multiple suppliers; first acceptance wins in marketplace mode
2. **Keep drivers online** — more online drivers = faster dispatch = happier customers
3. **Maintain documents** — expired CR/VAT suspends your account immediately
4. **Monitor credit** — follow up on overdue accounts before platform intervention
5. **Use auto-dispatch** — faster than manual, especially during peak hours
6. **Respond to disputes** — submit evidence promptly when disputes are opened

## Support

| Channel | Contact |
|---------|---------|
| In-portal | Support → New Ticket |
| Phone | 920000000 (06:00–24:00 AST) |
| WhatsApp | +966 50 000 0000 |
| Email | suppliers@suqya.sa |

## Related Documentation

- [Admin Manual](admin.md)
- [Driver Manual](driver.md)
- [Operations Manual](../operations/ops-manual.md)
- [User Journeys](../ux/user-journeys.md)

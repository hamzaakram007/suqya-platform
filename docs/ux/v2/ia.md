# Information Architecture V2

Consolidated navigation. Every surface has one job.

## Customer app

```
Splash → Auth (phone/OTP)
         ↓
    ┌────┴────┐
    │  Shell  │  Bottom tabs (RTL)
    └────┬────┘
   Home(Map) · Track · Account
```

| Surface | Purpose | Notes |
|---------|---------|-------|
| Map Home | 3-tap order | Defaults remembered; sheet for tank → confirm |
| Live Track | Active delivery | Map + ETA + timeline |
| Orders | History | Cards, not tables |
| Order Detail | Receipt + rate | Deep link from push |
| Wallet/Credit | Money | Merged money hub |
| Addresses | Defaults | Map picker |
| Profile/Settings | Identity | Language, biometrics |
| Support | Help | FAQ + ticket |
| Invoice | ZATCA QR | Share / save |

**Removed from primary IA:** separate tank/payment/favorites screens as top-level (embedded in home sheet).

## Driver app

```
Auth → Online Map Home
         ├─ Job Offer sheet (modal)
         ├─ Active Job (+ nav / POD)
         └─ Earnings / Profile
```

One-handed bottom action zone. No hamburger menus for core flow.

## Supplier portal

```
Today (command) · Orders · Fleet · Money · More
```

| Surface | Purpose |
|---------|---------|
| Today | KPIs + map + next actions |
| Orders | Pipeline / timeline |
| Fleet | Map-first trucks/drivers |
| Drivers | Performance cards |
| Money | Settlements + revenue |
| Analytics | Trends |
| ERP Lite | Fuel / inventory / people panels |
| Settings | Progressive |

## Admin command center

```
Live Ops · Exceptions · Finance · Manage
```

| Surface | Purpose |
|---------|---------|
| Live Ops Map | First viewport — fleet + orders |
| Exceptions | Stuck / failed / SLA |
| Orders | Monitor + intervene |
| Tenants / Users | Progressive CRUD |
| Finance | Settlements, credit aging |
| Disputes / Support | Ops queue |
| Coupons / Credit | Growth tools |
| Analytics | BI |
| Audit | Immutable log |
| System | Config |

Dense tables only behind **Manage**.

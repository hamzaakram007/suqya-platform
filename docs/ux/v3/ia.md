# Information Architecture V3 — Bilingual

Phase 16 Sprint B. Same surfaces as [V2 IA](../v2/ia.md); navigation structure is unchanged. What changes is **language parity**: Arabic and English are equal first-class experiences, with a consistent language switch in Account/Settings on every app.

## Language switch placement (all apps)

| App | Location | Control | Persistence |
|-----|----------|---------|-------------|
| Customer (Flutter) | Account tab → Settings → **Language** | Segmented: العربية · English | `SharedPreferences` + API `PATCH /users/me/locale` |
| Driver (Flutter) | Profile/Settings → **Language** | Same segmented control | Same |
| Supplier (Next.js) | More → Settings → **Language** | Toggle in settings sidebar | `localStorage` + cookie + API |
| Admin (Next.js) | Manage → Settings → **Language** | Toggle in settings sidebar | Same |

**Rules**

- Language switch is never buried more than two taps from Account/Settings.
- First launch follows device locale (`Accept-Language` / `Platform.localeName`); user override wins.
- Switching language rebuilds the UI direction (RTL ↔ LTR) without re-auth.
- Catalog content (FAQ, tank names, notifications) resolves server-side via `Accept-Language` or `?locale=`.

---

## Customer app

```
Splash → Auth (phone/OTP)
         ↓
    ┌────┴────┐
    │  Shell  │  Bottom tabs (direction follows locale)
    └────┬────┘
   Home(Map) · Track · Account
```

| Surface | Purpose | Bilingual notes |
|---------|---------|-----------------|
| Map Home | 3-tap order | CTA, chips, price in active locale; map chrome LTR |
| Live Track | Active delivery | ETA, timeline, push deep links locale-aware |
| Orders | History | Date/amount formatting per locale |
| Order Detail | Receipt + rate | Bilingual receipt fields where legally required |
| Wallet/Credit | Money | Currency always SAR; numerals per preference |
| Addresses | Defaults | Geocoded labels bilingual where available |
| Profile/Settings | Identity + **Language** | Primary home for locale switch |
| Support | Help | FAQ from API localized; search bilingual |
| Invoice | ZATCA QR | Arabic legal block + EN summary optional |

**Removed from primary IA (unchanged from V2):** separate tank/payment/favorites as top-level.

---

## Driver app

```
Auth → Online Map Home
         ├─ Job Offer sheet (modal)
         ├─ Active Job (+ nav / POD)
         └─ Earnings / Profile / Settings
```

| Surface | Purpose | Bilingual notes |
|---------|---------|-----------------|
| Online Map | Availability | Toggle labels AR/EN; earnings shortcut localized |
| Job Offer / Active Job | Work flow | Route endpoints, payout, POD copy localized |
| Earnings | Money | Period chips, trip list, settlement badge |
| Profile / Settings | Identity + **Language** | Language switch here |

One-handed bottom action zone. No hamburger for core flow.

---

## Supplier portal

```
Today (command) · Orders · Fleet · Money · More
```

| Surface | Purpose | Bilingual notes |
|---------|---------|-----------------|
| Today | KPIs + map + next actions | KPI labels, action cards localized |
| Orders | Pipeline | Status enums mapped per locale |
| Fleet | Map-first | Driver names as stored; UI chrome localized |
| Drivers | Performance | |
| Money | Settlements | |
| Analytics | Trends | Axis labels follow locale |
| ERP Lite | Panels | Field labels bilingual in DB |
| Settings | Progressive + **Language** | Language switch in settings nav |

---

## Admin command center

```
Live Ops · Exceptions · Finance · Manage
```

| Surface | Purpose | Bilingual notes |
|---------|---------|-----------------|
| Live Ops Map | First viewport | Critical rail, filters localized |
| Exceptions | Stuck / SLA | |
| Orders | Monitor + intervene | |
| Tenants / Users | CRUD | |
| Finance | Settlements, credit aging | |
| Disputes / Support | Ops queue | Ticket content may be mixed-language |
| Coupons / Credit | Growth | |
| Analytics | BI | Export headers bilingual |
| Audit | Immutable log | Actor/action labels localized |
| Settings / System | Config + **Language** | Language switch under Manage → Settings |

Dense tables only behind **Manage**.

---

## Cross-app IA invariants

1. **Same tree as V2** — no new top-level tabs or portals for bilingual.
2. **Language lives in Settings** — not splash, not map chrome, not admin top nav.
3. **Equal depth** — every string key has AR + EN in `app_*.arb` / `@suqya/i18n`.
4. **Direction follows locale** — `ar` → RTL layout; `en` → LTR layout (see [design-system.md](./design-system.md)).
5. **Mixed-language content** — user-generated text (support tickets, dispute notes) displays as-is with `dir="auto"` on web and `TextDirection.ltr` fallback for Latin-only blobs in RTL UI.

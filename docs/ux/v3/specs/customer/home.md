# Customer — Map Home (Bilingual)

**Surface:** Primary home — 3-tap order  
**Platform:** Flutter  
**IA:** [V3 IA](../../ia.md) — Home tab  
**V2 reference:** [Map Home V2](../../v2/specs/customer/03-map-home.md)  
**Scorecard:** [customer-home](../../scorecards/customer-home.md)

---

## Business impact

Map Home drives conversion. Bilingual parity removes friction for expat households and EN-preferring users (~35% of Riyadh pilot cohort) without slowing the 3-tap path. Language is inherited from device or Account Settings — not chosen on every visit.

---

## UX rationale

Same Careem-style map + sheet as V2. V3 adds equal AR/EN strings, locale-aware address labels from API, and direction-safe layout. Returning users still land with defaults loaded; language affects copy and direction only.

---

## Wireframe (locale-aware)

```
┌─────────────────────────────┐
│ [Search address]  [◎ Locate]│  ← AR: [بحث عنوان] [◎ موقعي]
│         MAP                 │
├─────────────────────────────┤
│ ══  drag handle             │
│ Saved address / edit        │
│  [18] [20] [30] m³          │
│  Pay: Wallet ·••• 42        │
│  Total  180 SAR             │
│  [ Confirm order ]          │  ← AR: [ تأكيد الطلب ]
└─────────────────────────────┘
│  Home │ Track │ Account     │  ← direction mirrors
└─────────────────────────────┘
```

---

## Component hierarchy

```
MapHomeScreen
├── SqMap
├── SqMapChrome (localized)
├── SqSheet
│   ├── AddressRow (localizeName)
│   ├── TankChipRow
│   ├── PaymentSummaryRow
│   ├── PriceBlock (SqBidiNumber)
│   └── SqButton (l10n confirm)
└── SqTabBar
```

---

## LTR behavior (EN)

- `Directionality.ltr`; IBM Plex Sans
- Tab order: Home → Track → Account (start to end)
- Search pill at **start**, locate at **end**
- CTA: "Confirm order"; price "180 SAR"
- Tank chips: Western digits unless user enabled Arabic numerals in Settings
- Page push to Live Track: enter from **end** edge
- Semantics: "Confirm order, 180 riyals"

---

## RTL behavior (AR)

- `Directionality.rtl`; IBM Plex Sans Arabic
- Tab visual order mirrored; Home at **start** (right side)
- Search pill at **start** (right), locate at **end** (left)
- CTA: **تأكيد الطلب**; price **١٨٠ ر.س** (Arabic-Indic per default)
- Chevrons on address/payment rows mirror
- Map compass and gestures remain geographic LTR
- Semantics: "تأكيد الطلب، ١٨٠ ريال"

---

## Loading / error (localized)

| State | EN | AR |
|-------|----|----|
| Pricing | Calculating price… | يحسب السعر… |
| Out of zone | Outside service area | خارج نطاق الخدمة |
| Active order | You have an active order — Track | لديك طلب جاري — تتبع |

---

## Animation

Per [motion-a11y.md](../../motion-a11y.md): sheet 280ms; locale switch cross-fade only (no Hero during rebuild).

---

## Accessibility

- Tank chips: radio group, localized selected state
- CTA includes price in semantics
- Min touch 48dp; locate 48dp

---

## API / data

- `GET /catalog/tanks` with `Accept-Language`
- `localizeName` for saved address
- `POST /orders` errors via `api-messages` locale

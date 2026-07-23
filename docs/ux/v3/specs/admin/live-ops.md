# Admin — Live Ops (Bilingual)

**Surface:** Command-center live map  
**Platform:** Next.js (admin-web)  
**IA:** [V3 IA](../../ia.md) — first viewport  
**V2 reference:** [Live Ops V2](../../v2/specs/admin/01-live-ops.md)  
**Scorecard:** [admin-live-ops](../../scorecards/admin-live-ops.md)

---

## Business impact

Live Ops is where SLA breaches are prevented. Bilingual critical rail lets mixed-language NOC teams share one dashboard. J4 intervene path must work keyboard-only in EN and AR for 24/7 ops.

---

## UX rationale

Full-bleed map + critical orders rail. Stuck = red; healthy = teal. Language from Manage → Settings; map geographic LTR always.

---

## Wireframe

```
┌──────────────────────────────────────────────┐
│ Live · Exceptions · Finance · Manage         │
│ ┌──────────────────────────────────────────┐ │
│ │           LIVE MAP                        │ │
│ └──────────────────────────────────────────┘ │
│ Critical rail / شريط الطلبات الحرجة          │
└──────────────────────────────────────────────┘
```

---

## Component hierarchy

```
LiveOpsPage
├── AdminTopNav (i18n)
├── SqMap
├── CriticalRail
├── OrderQuickDrawer
└── SqMapChrome
```

---

## LTR behavior (EN)

- Top nav LTR; Live Ops first item **start**
- Critical rail **end** (right) width 360px
- Filters: Stuck / Delayed / All
- Actions: **Reassign** / **Call driver** / **Call customer**
- Live region (throttled): "New stuck order"
- Quiet: "No exceptions — system stable"
- Customer names: `SqLocaleText` / `dir="auto"`

---

## RTL behavior (AR)

- Nav RTL; rail on **start** (right) or **end** per layout token — consistent with design-system logical rules
- Actions: **إعادة تعيين** / **اتصال بالسائق** / **اتصال بالعميل**
- Live region: **طلب جديد متعثر**
- Quiet: **لا استثناءات — النظام مستقر**

---

## Map invariants (both locales)

- Compass LTR
- Pin clustering unchanged
- Driver markers teal; stuck order red pulse ×2 (600ms, respect reduced motion)

---

## Order drawer

| Field | Display |
|-------|---------|
| Order ID | LTR always |
| Customer phone | LTR |
| Address | Localized + `dir="auto` |
| SLA timer | Localized relative time |

---

## Accessibility

- Critical list is primary navigation path; map secondary
- Keyboard: rail → drawer → actions
- Focus-visible rings (teal)
- Live region max 1 announcement / 30s

---

## WS disconnect

- EN: Reconnecting…
- AR: **جاري إعادة الاتصال…**

---

## Business metrics

Mean time to intervene; stuck order count by shift locale.

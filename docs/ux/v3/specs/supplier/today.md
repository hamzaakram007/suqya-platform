# Supplier — Today (Bilingual)

**Surface:** Daily command center  
**Platform:** Next.js (supplier-web)  
**IA:** [V3 IA](../../ia.md) — primary nav Today  
**V2 reference:** [Today V2](../../v2/specs/supplier/01-today.md)  
**Scorecard:** [supplier-today](../../scorecards/supplier-today.md)

---

## Business impact

Today is the supplier's decision screen. Bilingual KPIs and action cards let expat ops staff and Arabic-native owners share one portal. Faster accept on new orders improves customer ETA (J3).

---

## UX rationale

KPI row + mini fleet map + next actions. Unchanged layout from V2; all labels from `@suqya/i18n`. Language switch in More → Settings.

---

## Wireframe

```
┌──────────┬──────────────────────────────────┐
│ Nav      │ Today / اليوم                    │
│ Today    │ [KPI] [KPI] [KPI] [KPI]          │
│ Orders   │ ┌────────────┬─────────────────┐   │
│ Fleet    │ │ Mini map   │ Next actions    │   │
│ Money    │ │            │ New order Accept│   │
│ More     │ └────────────┴─────────────────┘   │
└──────────┴──────────────────────────────────┘
```

---

## Component hierarchy

```
TodayPage
├── SqKpiRow (i18n labels)
├── Split
│   ├── MiniFleetMap
│   └── NextActionsList
│       └── OrderActionCard
└── AlertsStrip?
```

---

## LTR behavior (EN)

- Nav rail on **start** (left); content LTR
- KPI labels: Today's orders / Active trucks / Revenue / Avg ETA
- Accept **Accept** / Reject **Reject** — keyboard focus-visible
- Map compass LTR; truck list alt text EN
- New order animation slide from **end** (280ms)
- Empty: "No actions now — fleet is stable"

---

## RTL behavior (AR)

- Nav rail on **start** (right)
- KPI: طلبات اليوم / الشاحنات النشطة / الإيراد / متوسط ETA
- **قبول** / **رفض**
- Empty: **لا إجراءات الآن — الأسطول مستقر**
- Numbers LTR in KPI values (`tabular-nums`)

---

## Locale change

Settings → Language → cookie + `router.refresh()`. WebSocket subscriptions persist; KPI refetch with new `Accept-Language`.

---

## Responsive

| Breakpoint | Behavior |
|------------|----------|
| ≥1200 | 4 KPIs; map \| actions |
| <768 | Stack; bottom nav |

Direction rules apply at all breakpoints.

---

## Accessibility

- KPIs: label + value announced
- Map: supplementary truck list
- Accept/Reject: not color-only

---

## Business metrics

Time-to-accept new orders; Today DAU by portal locale.

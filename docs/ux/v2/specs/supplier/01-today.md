# Supplier — Today (Command)

**Surface:** Daily command center  
**Platform:** Next.js web (supplier portal)  
**IA:** Primary nav Today

---

## 1. UX rationale

Today is the supplier’s Careem Business home: KPIs + mini fleet map + next actions in one viewport. One job—decide what needs attention now. Arabic-first, teal trust, gold only on “settled today” micro-badge. Not a dense dashboard of everything.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Login default | Land Today |
| Nav Today | Refresh command view |
| Accept order push | Highlight new order card |

Journey J3: new order card → Accept → visible on Fleet.

---

## 3. Wireframe description

```
┌──────────┬──────────────────────────────────┐
│ Nav      │ اليوم                             │
│ اليوم    │ [KPI] [KPI] [KPI] [KPI]           │
│ الطلبات  │ ┌────────────┬─────────────────┐  │
│ الأسطول  │ │ خريطة مصغّرة │ إجراءات تالية   │  │
│ المال    │ │             │ • طلب جديد قبول │  │
│ المزيد   │ └────────────┴─────────────────┘  │
└──────────┴──────────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| KPIs | SqKpi; teal accents; delta Caption |
| Map | Radius lg 16; height ~320 |
| Action cards | Interaction cards only; border `#E3EEEE` |
| Primary accept | Teal `#0A6E6E` |
| Gold | Settlement paid badge only |
| Type | IBM Plex Sans Arabic Title 1 page; Title 3 cards |
| Spacing | 24 page; 16 KPI gap |

---

## 5. Component hierarchy

```
TodayPage
├── SqKpiRow
├── Split
│   ├── MiniFleetMap
│   └── NextActionsList
│       └── OrderActionCard (Accept/Reject)
└── AlertsStrip?
```

---

## 6. Responsive behavior

| Breakpoint | Behavior |
|------------|----------|
| ≥1200 | KPI row 4; map\|actions split |
| 768–1199 | KPI 2×2; map above actions |
| <768 | Stack; nav → bottom or hamburger |

---

## 7. RTL behavior

- Nav rail inline-start (right in RTL).
- Map compass LTR; KPI numbers LTR.
- Logical padding throughout.

---

## 8. Accessibility notes

- KPIs labeled; deltas announced “ارتفاع ١٢٪”.
- Accept/Reject keyboard operable; focus-visible rings.
- Map has text list alternative of active trucks.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| New order | Card slide-in 280ms |
| Accept | Check 180ms → remove to pipeline |
| KPI refresh | Number tween 280ms |
| Reduced motion | Instant updates |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | SqSkeleton KPIs + map |
| Empty actions | “لا إجراءات الآن — الأسطول مستقر” |
| Error | SqError retry |
| Surge | Amber strip |
| No drivers online | Action: “فعّل سائقين” → Drivers |

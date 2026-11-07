# Admin — Analytics (BI)

**Surface:** Platform-wide analytics  
**Platform:** Next.js  
**IA:** Analytics

---

## 1. UX rationale

Platform BI: GMV, orders, fill time, tenant mix, geo heat. Calm Linear charts; teal series; Arabic. One job—executive + ops insight, not spreadsheet hell. Map-first heat optional secondary.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Nav Analytics | Default 7d |
| Finance “اتجاه” | Revenue focus |
| Tenant compare | Multi-select |

---

## 3. Wireframe description

```
┌────────────────────────────────────────────┐
│ التحليلات  نطاق زمني · مستأجرون            │
│ KPI صف                                     │
│ مخطط GMV / الطلبات                         │
│ خريطة حرارية (اختياري) · ترتيب المستأجرين  │
└────────────────────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Series | `#0A6E6E` |
| Gold | Unused |
| Heat | Teal density scale |
| Type | IBM Plex Sans Arabic |
| Spacing | 24 |
| Cards | Light border |

---

## 5. Component hierarchy

```
AdminAnalyticsPage
├── RangeTenantFilters
├── SqKpiRow
├── TrendCharts
├── HeatMapOptional
└── TenantLeaderboard
```

---

## 6. Responsive behavior

- Desktop multi-chart grid.
- Mobile stacked; simplify heat off by default.

---

## 7. RTL behavior

- Chrome RTL; time axes chronological LTR.
- Leaderboard RTL names.

---

## 8. Accessibility notes

- Chart data tables toggle.
- Filters announced on change.
- Focusable legends.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Range | Crossfade 280ms |
| Line enter | 420ms; reduced motion static |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeletons |
| Empty | Widen range |
| Delayed warehouse | Stale watermark |
| Error | Retry |
| Huge tenant set | Cap + search |

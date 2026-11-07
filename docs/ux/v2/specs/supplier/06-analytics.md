# Supplier — Analytics

**Surface:** Trends & performance BI lite  
**Platform:** Next.js  
**IA:** More → التحليلات

---

## 1. UX rationale

Trends only—orders volume, fill rate, SLA, revenue over time. Linear/Stripe calm charts, Arabic labels, teal series. One job—spot weekly patterns, not configure BI.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| More → Analytics | Default 7d |
| Today KPI “عرض الاتجاه” | Prefill metric |
| Date range share link | Restore filters |

---

## 3. Wireframe description

```
┌────────────────────────────────────────────┐
│ التحليلات  [٧ أيام] [٣٠] [مخصص]            │
│ ┌ خط الطلبات ─────────────────────────┐    │
│ └─────────────────────────────────────┘    │
│ ┌ معدل القبول ┐ ┌ زمن التوصيل ┐            │
│ └─────────────┘ └────────────┘            │
│ أفضل السائقين                              │
└────────────────────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Charts | Teal `#0A6E6E` primary series; muted grid |
| Gold | Unused |
| Type | IBM Plex Sans Arabic; Caption axis |
| Cards | Minimal border; avoid heavy shadow |
| Spacing | 24 |

---

## 5. Component hierarchy

```
AnalyticsPage
├── RangeToolbar
├── OrdersTrendChart
├── MetricCards
└── TopDriversList
```

---

## 6. Responsive behavior

- Desktop: 2-col metrics under main chart.
- Mobile: stack; charts full width; simplify ticks.

---

## 7. RTL behavior

- Time axis still left→right chronologically (data LTR); labels RTL.
- Tooltips RTL text.

---

## 8. Accessibility notes

- Data table toggle under each chart.
- Color not sole encoding (patterns optional).
- Focusable legends.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Range change | Crossfade 280ms |
| Line draw | 420ms once on load; reduced motion = static |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Chart skeletons |
| Empty range | SqEmpty adjust dates |
| Partial data | Note “بيانات غير مكتملة” |
| Error | Retry |

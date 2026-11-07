# Driver — Earnings

**Surface:** Today / period earnings  
**Platform:** Flutter  
**IA:** Online Map chrome → الأرباح

---

## 1. UX rationale

Motivational but honest: big today’s total (SqKpi), trip list, tips/cash breakdown. Stripe-like clarity. Gold only for “paid out / settled” badge—not for vanity.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Map chrome | الأرباح |
| Push payout | Deep link period |
| Profile | Link |

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ الأرباح                     │
│ اليوم                       │
│ ٣٤٠ ر.س                     │  ← SqKpi
│ ١٢ رحلة · ٤٫٩ ★             │
│ [اليوم] [أسبوع] [شهر]       │
│                             │
│ رحلة #٢٨٤١ · ٤٥ ر.س         │
│ رحلة #٢٨٣٩ · ٤٠ ر.س         │
│                             │
│ التسوية: مدفوعة ◆gold       │
└─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| KPI | Teal card or large dark type on mist |
| Chips | Period filters; selected teal |
| Settled badge | Gold `#C9A227` sparingly |
| Type | IBM Plex Sans Arabic Display for total |
| Spacing | 16/20 |

---

## 5. Component hierarchy

```
EarningsScreen
├── SqKpi Today
├── PeriodChips
├── TripEarningsList
└── SettlementStatus
```

---

## 6. Responsive behavior

- Phone: stack.
- Tablet: KPI + chart start; list end.

---

## 7. RTL behavior

- RTL list; amounts LTR cluster.
- Period chips scroll logical.

---

## 8. Accessibility notes

- KPI as heading.
- Trip rows summarize distance + pay.
- Gold badge has text “مدفوعة”.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Period switch | Crossfade list 180ms |
| Number update | Tween 280ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton KPI + rows |
| Empty day | “لا رحلات اليوم” + go online CTA |
| Error | Retry |
| Negative adjustment | Explain caption |
| Pending settlement | Muted badge not gold |

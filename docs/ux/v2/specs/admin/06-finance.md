# Admin — Finance

**Surface:** Settlements, revenue, credit aging  
**Platform:** Next.js  
**IA:** Finance top-level

---

## 1. UX rationale

Finance command: platform take, supplier settlements, credit aging. Gold for **paid**. Stripe-like seriousness; Arabic labels; clear SAR. One job—cash health + aging risk.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Nav Finance | KPIs + tabs |
| Aging alert | Credit aging tab |
| Settlement push | Detail |

---

## 3. Wireframe description

```
┌────────────────────────────────────────────┐
│ المالية                                    │
│ KPIs: إيراد · عمولة · مستحق · متأخر        │
│ [تسويات] [ائتمان متقادم] [مدفوعات]         │
│ جداول + إجراءات اعتماد الدفع               │
└────────────────────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| KPIs | SqKpi; overdue red delta |
| Paid | Gold `#C9A227` badge |
| Approve payout | Teal |
| Type | IBM Plex Sans Arabic |
| Tables | Dense OK; row 52 |
| Spacing | 24 |

---

## 5. Component hierarchy

```
FinancePage
├── SqKpiRow
├── Tabs
├── SettlementsPanel
├── CreditAgingPanel
└── PaymentsPanel
```

---

## 6. Responsive behavior

- Desktop: full tables.
- Mobile: KPI stack + card settlements.

---

## 7. RTL behavior

- Tabs RTL; money columns numeric LTR aligned.

---

## 8. Accessibility notes

- Overdue not color-only.
- Approve payout dual-control note if policy.
- Export accessible.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Mark paid | Gold badge 280ms |
| Tab | Fade 180ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeletons |
| Empty aging | Healthy empty |
| Payout fail | Error + retry ledger-safe |
| Partial settlement | Clear split UI |
| FX N/A | SAR only note |

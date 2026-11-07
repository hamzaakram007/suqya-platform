# Supplier — Money (Settlements & Revenue)

**Surface:** Settlements + revenue hub  
**Platform:** Next.js  
**IA:** Nav المال

---

## 1. UX rationale

Money hub = Stripe clarity: revenue KPIs, settlement list, payout status. Gold `#C9A227` only for **paid/settled** badges. Arabic invoices and SAR formatting. One job—understand cash position and settle.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Nav Money | Default |
| Today settled badge | Filter paid |
| Push payout | Open settlement detail |

---

## 3. Wireframe description

```
┌────────────────────────────────────────────┐
│ المال                                      │
│ إيراد الأسبوع · مستحق · محصّل              │
│ التسويات                                   │
│ #S-١٢ · ٢٬٤٠٠ ر.س · [مدفوعة ◆]             │
│ #S-١١ · ١٬٨٠٠ ر.س · قيد المعالجة           │
│ [تصدير]                                    │
└────────────────────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| KPIs | SqKpi |
| Paid badge | Gold sparingly |
| Pending | Teal outline chip |
| Tables | Allowed here (finance); still generous row height 52 |
| Type | IBM Plex Sans Arabic |
| Spacing | 24 sections |

---

## 5. Component hierarchy

```
MoneyPage
├── SqKpiRow
├── SettlementsTable / Cards
├── SettlementDetailDrawer
└── ExportActions
```

---

## 6. Responsive behavior

- Desktop: table.
- Mobile: settlement cards.

---

## 7. RTL behavior

- Table logical columns; numeric align inline-end carefully with RTL.
- Export filenames LTR OK.

---

## 8. Accessibility notes

- Finance table headers scoped.
- Badges have text.
- Export progress announced.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Status → paid | Badge morph + gold appear 280ms |
| KPI refresh | Tween 280ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton |
| Empty | “لا تسويات بعد” |
| Export fail | Retry |
| Dispute hold | Amber row + link |
| Negative adjustment | Explain tooltip |

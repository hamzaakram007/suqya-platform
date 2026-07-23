# Customer — Wallet & Credit

**Surface:** Merged money hub  
**Platform:** Flutter  
**IA:** Account → المحفظة والائتمان

---

## 1. UX rationale

One money surface: wallet balance, top-up, credit limit/usage, and aging warnings. Apple Wallet calm + Stripe clarity. Gold accent only for “settled / VIP credit” badges—not primary CTA. Arabic-first amounts with clear SAR formatting.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Account | المحفظة |
| Map Home payment row | “تغيير / تعبئة” |
| Low balance at checkout | Sheet deep-link here |
| Credit aging push | Open credit tab |

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ المحفظة والائتمان           │
│ ┌─────────────────────────┐ │
│ │ الرصيد                   │ │
│ │ ٣٥٠ ر.س     [تعبئة]     │ │  ← SqKpi big number
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ الائتمان                 │ │
│ │ المستخدم ١٬٢٠٠ / ٢٬٠٠٠   │ │
│ │ شريط تقدم                │ │
│ └─────────────────────────┘ │
│ آخر العمليات                │
│ • تعبئة · +١٠٠             │
│ • طلب #٢٨٤١ · −١٨٠         │
└─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Balance card | Teal surface `#0A6E6E`, white type; radius xl 24 |
| Credit card | Light surface; progress track `#D0E0E0`; fill teal |
| Gold | Paid/settled micro-badge `#C9A227` only |
| Type | Display/Title for balance; Caption for txs |
| Spacing | 16 page; 12 list gaps |
| Top-up CTA | White on teal or secondary teal outline on light |

---

## 5. Component hierarchy

```
WalletCreditScreen
├── WalletKpiCard (SqKpi)
│   └── TopUpButton → TopUpSheet
├── CreditUsageCard
├── TransactionsList
└── SqEmpty / SqError
```

TopUpSheet: amount chips + card redirect (hosted payment).

---

## 6. Responsive behavior

- Phone: stacked cards.
- Tablet: wallet | credit side-by-side; txs full width below.

---

## 7. RTL behavior

- KPI label end-aligned with RTL; numbers LTR cluster.
- Progress bar fills inline-start→end.
- Tx amounts: debit/credit signs localized.

---

## 8. Accessibility notes

- Balance as heading + live value.
- Progress “١٢٠٠ من ٢٠٠٠ ريال مستخدم”.
- Top-up flow announces redirect to payment page.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Top-up success | Wallet icon morph, 420ms |
| Balance update | Number tween 280ms |
| Sheet | Slide 280ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton KPIs |
| Empty txs | “لا عمليات بعد” |
| Top-up fail | SqError in sheet + retry |
| Credit overdue | Red banner + pay CTA |
| Credit frozen | Disabled order note linking here |
| Offline | Cached balance + stale label |

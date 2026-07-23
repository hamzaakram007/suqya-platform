# Customer — Invoice (ZATCA)

**Surface:** Tax invoice view / share  
**Platform:** Flutter  
**IA:** Order Detail → الفاتورة · push after delivery

---

## 1. UX rationale

Invoice is trust + compliance: ZATCA QR, clear Arabic legal lines, share/save. Visual quiet like Apple Wallet pass—not a spreadsheet. Brand سقيا present but does not overpower invoice title.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Order Detail | الفاتورة |
| Orders card menu | فاتورة |
| Email/SMS link | Authenticated web/app view |
| Account (future) | Invoices list → this |

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ ← فاتورة ضريبية             │
│ سقيا · رقم الفاتورة         │
│                             │
│ [ZATCA QR]                  │
│                             │
│ البائع / المشتري            │
│ البنود: وايت ٢٠م³           │
│ المجموع · الضريبة · الإجمالي│
│                             │
│ [مشاركة] [حفظ PDF]          │
└─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Surface | White / dark elevated; radius none on print layout |
| QR | High contrast black on white; quiet zone |
| Type | IBM Plex Sans Arabic; totals Title 3; legal Caption 14 |
| Teal | Header rule / subtle brand line `#0A6E6E` |
| Gold | Unused |
| Spacing | Dense but readable 12–16; print margins 24 |

---

## 5. Component hierarchy

```
InvoiceScreen
├── InvoiceHeader (brand quiet + number)
├── ZatcaQr
├── PartiesBlock
├── LineItems
├── TaxTotals
└── ShareSaveBar
```

---

## 6. Responsive behavior

- Phone: scroll + sticky share bar.
- Tablet: centered max-width 640.
- Print/PDF: single page A4 when possible.

---

## 7. RTL behavior

- Document RTL; QR centered (direction-agnostic).
- Numbers and tax IDs LTR.
- Share sheet system-localized.

---

## 8. Accessibility notes

- QR has text alternative (invoice hash / URL).
- Totals announced as summary.
- Share/save 48dp targets.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Open | Fade 280ms |
| Save success | Brief check 180ms |
| Reduced motion | Instant appear |

No decorative motion on legal surface.

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Generating | Skeleton + “جاري إصدار الفاتورة” |
| Not ready (pre-delivery) | Empty: available after complete |
| ZATCA fail | SqError + support; show provisional receipt |
| Share fail | Toast retry |
| Expired link | Re-auth + regenerate |

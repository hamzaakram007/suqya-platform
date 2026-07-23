# Customer — Order Detail

**Surface:** Single order receipt + actions  
**Platform:** Flutter  
**IA:** Orders → Detail · push deep link · post-delivery

---

## 1. UX rationale

Order Detail is the receipt hub: status timeline, map snapshot, money breakdown, invoice entry, and rating. One job—understand this order and act (track, reorder, support, invoice). Premium Careem clarity: big status, calm teal accents, no dense table.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Orders list tap | Push detail |
| Push notification | Deep link `order/:id` |
| Live Track “التفاصيل” | Modal or push |
| Invoice share back-link | Open parent order |

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ ←  طلب #٢٨٤١               │
│ [خريطة مصغّرة]              │
│                             │
│ الحالة: تم التسليم          │
│ SqTimeline …                │
│                             │
│ التفاصيل                    │
│ الحجم · العنوان · الوقت     │
│                             │
│ الدفع                       │
│ ١٨٠ ر.س · محفظة             │
│                             │
│ [الفاتورة] [الدعم]          │
│ [اطلب مرة أخرى]             │
│ ★★★★★ تقييم                 │
└─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Header | Title 2 order id; status Title 3 teal/success |
| Map snapshot | Radius lg 16; height 160; non-interactive preview → tap opens Live Track if active |
| Money rows | Body 16; totals Title 3 |
| Primary reorder | Teal button |
| Type | IBM Plex Sans Arabic |
| Gold | Unused unless VIP promo line |
| Spacing | Section gaps 24; horizontal 20 |

---

## 5. Component hierarchy

```
OrderDetailScreen
├── MiniMapPreview
├── StatusHeader
├── SqTimeline
├── OrderMetaSection
├── PaymentBreakdown
├── ActionRow (Invoice, Support)
├── SqButton Reorder
└── RatingBlock
```

---

## 6. Responsive behavior

- Phone: vertical scroll.
- Tablet: map + timeline left/start; money + actions end panel.

---

## 7. RTL behavior

- Sections RTL; map preview chrome mirrored controls only if any.
- Order ID numerals LTR.
- Rating stars LTR fill direction acceptable; labels RTL.

---

## 8. Accessibility notes

- Timeline steps as ordered list semantics.
- Rating: adjustable with announcements.
- Buttons min 48; invoice opens new surface announced.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Enter | Shared-axis 280ms |
| Rate submit | Check 420ms deliberate |
| Reorder | Sheet confirm 280ms → Map Home prefilled |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton header + rows |
| Not found | SqError “الطلب غير موجود” |
| Refund pending | Amber banner |
| Dispute open | Link to Support with context |
| Partial delivery | Timeline + note |
| Cash unpaid edge | Show collect status if relevant |

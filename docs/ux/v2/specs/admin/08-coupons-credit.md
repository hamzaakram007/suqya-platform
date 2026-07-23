# Admin — Coupons & Credit Tools

**Surface:** Growth coupons + credit policy tools  
**Platform:** Next.js  
**IA:** Manage → كوبونات وائتمان

---

## 1. UX rationale

Growth tools with guardrails: create coupon, limits, tenant scope; credit limit adjustments with audit reason. Teal create; gold unused (not VIP salesy). Arabic form clarity.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Manage → Coupons/Credit | Tabs |
| Campaign launch | Create coupon |
| Aging finance | Adjust credit deep link |

---

## 3. Wireframe description

```
┌────────────────────────────────────────────┐
│ [كوبونات] [سياسات الائتمان]                │
│ قائمة كوبونات · حالة · استخدام             │
│ إنشاء: رمز · خصم · سقف · صلاحية · مستأجرون │
│ ائتمان: مستخدم · حد · تعديل مع سبب         │
└────────────────────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Active coupon | Teal chip |
| Expired | Muted |
| Create | Teal CTA |
| Type | IBM Plex Sans Arabic |
| Forms | 48 inputs |
| Spacing | 20 |

---

## 5. Component hierarchy

```
CouponsCreditPage
├── Tabs
├── CouponsPanel
│   └── CouponEditorModal
└── CreditPolicyPanel
    └── AdjustLimitModal (reason required)
```

---

## 6. Responsive behavior

- Desktop tables; mobile cards + full-screen editors.

---

## 7. RTL behavior

- Forms RTL; coupon codes LTR monospace.
- Percent/amount LTR.

---

## 8. Accessibility notes

- Reason field required announced.
- Destructive expire confirm.
- Tables headers scoped.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Modal | 280ms |
| Create success | Toast 280ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton |
| Empty coupons | Create CTA |
| Code collision | Inline error |
| Credit raise over risk | Warning threshold |
| Retroactive coupon | Policy block message |

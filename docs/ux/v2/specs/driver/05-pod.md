# Driver — Proof of Delivery (POD)

**Surface:** Photo / signature / OTP proof  
**Platform:** Flutter  
**IA:** Active Job stage Arrived → POD → Cash or Online

---

## 1. UX rationale

POD must be completable in under 30 seconds outdoors: large capture shutter, clear Arabic steps, optional sign or customer OTP. Trust for disputes without bureaucracy. Teal primary; high contrast under sun.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Active Job “تأكيد التسليم” | Open POD |
| Resume incomplete POD | Return to last step |

Success → Cash Collect if COD else Online Map + earnings bump.

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ إثبات التسليم               │
│ ١ صورة الخزان/العداد        │
│ [كاميرا معاينة]             │
│                             │
│ ٢ توقيع العميل (اختياري)    │
│ [لوحة توقيع]                │
│                             │
│ ٣ رمز العميل (إن لزم)       │
│ ○○○○                        │
│                             │
│ [ تأكيد التسليم ]           │
└─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Camera frame | Full width; guides teal corners |
| Shutter | 72dp circular teal |
| Sign pad | Border `#D0E0E0`; radius md |
| CTA | Teal 64h |
| Type | IBM Plex Sans Arabic Title 3 steps |
| Spacing | Step gaps 24 |

---

## 5. Component hierarchy

```
PodScreen
├── PhotoStep
├── SignatureStep?
├── CustomerOtpStep?
└── SqButton ConfirmDelivery
```

Config per tenant which steps required.

---

## 6. Responsive behavior

- Portrait lock recommended for camera.
- Tablet: camera start; form end.

---

## 7. RTL behavior

- Steps RTL; signature canvas direction-agnostic.
- OTP digits LTR.

---

## 8. Accessibility notes

- Steps as progress “٢ من ٣”.
- Camera permission rationale Arabic.
- Confirm disabled until required proofs present; reason announced.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Photo capture | Shutter flash 100ms |
| Success | Checkmark deliberate 420ms + haptic |
| Step next | Shared-axis 280ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Upload loading | CTA spinner; keep local draft |
| Upload fail | Retry; offline queue |
| Blurry detect | Soft warn + retake |
| OTP wrong | Inline error |
| Camera unavailable | Fallback gallery if policy allows |
| Customer refuses sign | Skip if optional + note |

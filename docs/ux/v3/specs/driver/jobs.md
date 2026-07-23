# Driver — Jobs: Offer → Active → POD (Bilingual)

**Surface:** Job Offer sheet, Active Job, Proof of Delivery  
**Platform:** Flutter  
**IA:** Overlay / push on Online Map  
**V2 reference:** [Job Offer](../../v2/specs/driver/03-job-offer.md), [Active Job](../../v2/specs/driver/04-active-job.md), [POD](../../v2/specs/driver/05-pod.md)  
**Scorecard:** [driver-jobs](../../scorecards/driver-jobs.md)

---

## Business impact

Offer-to-POD is revenue realization. Bilingual clarity on payout, route, and POD requirements reduces failed deliveries and dispute rates. 30s offer window must remain legible in both languages on narrow devices.

---

## Job Offer

### Wireframe

```
┌─────────────────────────────┐
│  (◉ 0:28 countdown)         │
│ New job / طلب جديد          │
│ 20 m³ · 2.4 km              │
│ Fare 45 SAR                 │
│ From: Station → To: Al Narjis│
│ [ Accept 64dp ]             │
│ [ Decline ]                 │
└─────────────────────────────┘
```

### LTR (EN)

- Countdown announced at 30s, 10s, 5s: "28 seconds remaining"
- **Accept** primary teal; **Decline** ghost
- Route: "From" / "To" labels; addresses LTR or `dir="auto"`
- Timeout: "Offer expired"

### RTL (AR)

- Announcements: **٢٨ ثانية متبقية**
- **قبول** / **رفض**
- **من:** / **إلى:**
- Timeout: **انتهى وقت العرض**

---

## Active Job

| Step | EN | AR |
|------|----|----|
| Navigate | Navigate | التوجيه |
| Mark filled | Mark filled | تم التعبئة |
| Arrive | Arrived | وصلت |
| Start POD | Proof of delivery | إثبات التسليم |

### LTR

- Timeline top-to-bottom; icons on **start** side
- Step CTA full-width bottom zone

### RTL

- Timeline mirrored; icons on **start** (right)
- Same bottom CTA zone (one-handed)

---

## POD

Requirements: photo OR signature OR customer OTP (supplier policy).

| Error | EN | AR |
|-------|----|----|
| Missing proof | Add a photo or signature | أضف صورة أو توقيعاً |
| OTP invalid | Invalid code | الرمز غير صحيح |

### LTR / RTL

- Camera shutter universal center
- Signature pad full width; clear button at **end**
- OTP fields LTR always (Western digits)

---

## Cash collect (if applicable)

Sheet after POD when payment method cash.

- EN: **Collect 180 SAR** / Confirm collected
- AR: **تحصيل ١٨٠ ر.س** / تأكيد التحصيل

Stack vertically on narrow EN to avoid button clip.

---

## Component hierarchy

```
JobOfferSheet → ActiveJobScreen → PodScreen → CashCollectSheet?
```

---

## Accessibility

- Offer: Accept/Reject names + countdown state
- POD: camera button labeled; signature area role
- Errors: `Semantics(liveRegion: true)`

---

## Business metrics

Accept rate, POD failure rate, time-on-step by locale.

---

## Language switch policy

Do not switch locale during 30s offer. Settings change applies next job.

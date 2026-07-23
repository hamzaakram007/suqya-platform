# Critical Journeys V3 — Bilingual

Each step notes **AR** and **EN** copy/behavior. Layout direction follows active locale unless noted (maps stay geographic LTR).

Reference: [V2 journeys](../v2/journeys.md).

---

## J1 — Customer 3-tap order (returning user)

| Step | Action | AR | EN |
|------|--------|----|----|
| 1 | Open app → Map Home | العنوان والدفع والخزان محمّلة مسبقاً | Address, payment, tank preloaded |
| 2 | Tap tank chip (or keep default) | [١٨] [٢٠] [٣٠] م³ or [18] [20] [30] m³ per numeral pref | Same chips, Western digits if user disabled Arabic-Indic |
| 3 | Tap confirm CTA | **تأكيد الطلب** | **Confirm order** |
| 4 | System creates order → Live Track | انتقال إلى التتبع المباشر | Navigate to Live Track |

**First-time:** after OTP, guided pin drop once.

| Step | AR | EN |
|------|----|----|
| Coach pin | حدّد موقع التوصيل | Set delivery location |
| Then | same 3-tap forever | same 3-tap forever |

**Language switch mid-journey:** if user changes language in Settings before step 3, sheet rebuilds; selections preserved; CTA label updates without clearing cart.

**Push notification (order confirmed):**

- AR: تم تأكيد طلبك · تتبع الآن
- EN: Order confirmed · Track now

---

## J2 — Driver offer → POD

| Step | Action | AR | EN |
|------|--------|----|----|
| 1 | Online on map | **متصل** toggle | **Online** toggle |
| 2 | Offer sheet 30s → Accept | **قبول** · طلب جديد · countdown | **Accept** · New job · countdown |
| 3 | Navigate → Mark filled | **تعبئة** · **وصلت** | **Filled** · **Arrived** |
| 4 | POD (photo / sign / OTP) | **إثبات التسليم** | **Proof of delivery** |
| 5 | Cash collect if needed | **تحصيل نقدي** | **Collect cash** |
| 6 | Return online | **متصل** restored | **Online** restored |

**Reject / timeout:**

- AR: انتهى وقت العرض · **رفض**
- EN: Offer expired · **Decline**

**POD validation errors:**

- AR: أضف صورة أو توقيعاً
- EN: Add a photo or signature

**Language:** driver app reads locale from profile; offer sheet uses same locale as map home. Changing language in Settings applies on next screen push (not mid-countdown).

---

## J3 — Supplier today (accept order)

| Step | Action | AR | EN |
|------|--------|----|----|
| 1 | Login → Today | **اليوم** default landing | **Today** default landing |
| 2 | New order card appears | طلب جديد · **قبول** / **رفض** | New order · **Accept** / **Reject** |
| 3 | Accept → fleet map | يظهر على خريطة الأسطول | Visible on fleet map |
| 4 | KPI refresh | طلبات اليوم +١ | Today's orders +1 |

**Empty state:**

- AR: لا إجراءات الآن — الأسطول مستقر
- EN: No actions now — fleet is stable

**Language switch:** Settings → Language; Today page hot-reloads with `router.refresh()`; WebSocket subscriptions unchanged.

---

## J4 — Admin command (intervene on stuck order)

| Step | Action | AR | EN |
|------|--------|----|----|
| 1 | Live Ops — stuck order (red pin) | طلب متعثر | Stuck order |
| 2 | Exceptions rail → select | **استثناءات** rail | **Exceptions** rail |
| 3 | Reassign / call | **إعادة تعيين** · **اتصال** | **Reassign** · **Call** |
| 4 | Confirm action | تأكيد الإجراء | Confirm action |

**Quiet ops:**

- AR: لا استثناءات — النظام مستقر
- EN: No exceptions — system stable

**Live region (new stuck):**

- AR: طلب جديد متعثر
- EN: New stuck order

**Language:** admin UI strings from `@suqya/i18n`; order/customer names display as stored. Audit log entries store locale of acting admin for label resolution.

---

## Journey success metrics (Sprint B)

| Journey | Bilingual gate |
|---------|----------------|
| J1 | 3-tap path completable in EN without layout break |
| J2 | POD completable in AR with TalkBack AR labels |
| J3 | Accept flow keyboard-only in either locale |
| J4 | Critical rail operable LTR and RTL |

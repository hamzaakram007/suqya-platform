# Customer — Map Home (3-Tap Order)

**Surface:** Primary home — order in three taps  
**Platform:** Flutter  
**IA:** Bottom tab Home · Track · Account  
**Priority:** MOST IMPORTANT customer surface (Journey J1)

---

## 1. UX rationale

Map Home is Suqya’s Careem moment: the map is the product, the sheet is the order. Returning users land with address, preferred tank size, and payment method already resolved—so the path is (1) confirm or tweak tank chip, (2) glance price, (3) tap **تأكيد الطلب**. First-time users get a single guided pin-drop, then the same forever. Nothing else (wallet, invoices, FAQ) competes in the first viewport. Gold is unused here; teal and water calm signal trust and speed.

---

## 2. User journey / entry points

| Entry | Behavior |
|-------|----------|
| Post-auth default | Land Map Home with last delivery pin |
| Bottom tab Home | Restore map camera + sheet collapsed/expanded state |
| “اطلب مرة أخرى” from Orders | Prefill tank + address; open confirm-ready sheet |
| Deep link `suqya://order` | Open sheet expanded |
| After delivered | Soft return here with success toast cleared |

**3-tap returning path**
1. Open app → Map Home (defaults loaded)  
2. Tap tank chip *or* keep default  
3. Tap **تأكيد الطلب** → Live Track  

**First-time path:** Auth → Map Home → guided “حدد موقع التوصيل” once → then 3-tap.

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ [🔍 بحث عنوان]    [◎ موقعي] │  ← SqMapChrome glass
│                             │
│         MAP (full bleed)    │
│              📍             │  ← delivery pin
│                             │
│                             │
├─────────────────────────────┤
│ ══  drag handle             │  ← SqSheet
│ الحي / العنوان المحفوظ      │  ← Title 3 + edit chevron
│                             │
│  [١٨] [٢٠] [٣٠] م³          │  ← SqChip tank sizes
│                             │
│  الدفع: محفظة ·••• ٤٢       │  ← compact payment row
│  الإجمالي  ١٨٠ ر.س          │  ← Title 2 price
│                             │
│  [ تأكيد الطلب ]            │  ← SqFAB-height primary
└─────────────────────────────┘
│  الرئيسية │ التتبع │ حسابي  │  ← SqTabBar
└─────────────────────────────┘
```

Collapsed sheet shows: address one-liner + price + CTA peek. Expanded shows chips + payment.

---

## 4. Visual specification

| Layer | Spec |
|-------|------|
| Map | Full-bleed; muted water-friendly basemap; no purple pins |
| Pin | Teal `#0A6E6E` drop pin; white center |
| Sheet | Surface `#FFFFFF` / dark `#122222`; radius xl 24 top; shadow `lg` |
| Chips | Selected: teal fill white text; unselected: border `#D0E0E0` |
| CTA | Full width teal `#0A6E6E`, height 52–56, radius md 12 |
| Type | IBM Plex Sans Arabic; price Title 2 22/30 600; address Body 16 |
| Gold | Never on home order CTA |
| Spacing | Sheet padding 20; chip gap 8; CTA 16 below payment |
| Map chrome | Glass blur 20, radius full for locate FAB 48×48 |

---

## 5. Component hierarchy

```
MapHomeScreen
├── SqMap (camera, pin, traffic optional)
├── SqMapChrome
│   ├── AddressSearchPill
│   └── LocateMeButton
├── SqSheet (order)
│   ├── DragHandle
│   ├── AddressRow → Addresses picker
│   ├── TankChipRow (SqChip[])
│   ├── PaymentSummaryRow → Wallet/Credit
│   ├── PriceBlock
│   └── SqButton تأكيد الطلب
├── FirstTimeCoachMark? (once)
└── SqTabBar
```

Embedded (not top-level IA): tank selection, payment picker sheet, ETA estimate line.

---

## 6. Responsive behavior

| Breakpoint | Behavior |
|------------|----------|
| Narrow phone | Sheet 42–58% height; map always visible above |
| Tall phone | Sheet peeks at 36% collapsed |
| Tablet | Sheet as side panel inline-end 400px; map fills rest |
| Keyboard (search) | Sheet dismisses temporarily; search overlay |

Camera never jumps under sheet: padding bottom equals sheet peek height.

---

## 7. RTL behavior

- Tab order visual RTL: حسابي | التتبع | الرئيسية (per design system).
- Sheet padding uses `inline-start/end`.
- Map compass and gestures remain LTR geographic.
- Price and SAR symbol: number LTR within RTL sentence.
- Chevrons on address/payment rows mirror.

---

## 8. Accessibility notes

- Map pin announced: “موقع التوصيل، اسحب للتعديل”.
- Tank chips are radio-group; selected state spoken.
- CTA label includes price when TalkBack/VoiceOver: “تأكيد الطلب، ١٨٠ ريال”.
- Min touch 48; locate button 48.
- Focus order: search → locate → sheet address → chips → payment → CTA → tabs.
- High-contrast pin outline for outdoor glare.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Sheet expand/collapse | 280ms emphasize slide |
| Chip select | Scale 0.98→1 + border, 180ms |
| Locate me | Map camera slow 420ms |
| Order confirm | Checkmark draw + haptic, 420ms → Hero morph to Live Track |
| Pin drop (first time) | Soft land 280ms |
| Price update | Number crossfade 180ms |

Reduced motion: cut transitions; keep haptic optional off.

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Pricing load | Skeleton on price; CTA disabled with “يحسب السعر…” |
| No saved address | Coach: drop pin; CTA disabled until geocode OK |
| Out of service area | Sheet swaps to `SqEmpty`: “خارج نطاق الخدمة” + support |
| Payment missing | CTA opens payment picker instead of submit |
| Create order fail | `SqError` in sheet + retry; keep selections |
| Surge / high demand | Inline caption amber; still allow confirm |
| Offline | Banner; CTA queues optimistic only if policy allows—else block with clear Arabic |
| Active order exists | Soft redirect banner: “لديك طلب جاري — تتبع” |
| Duplicate tap CTA | Debounce; single flight |

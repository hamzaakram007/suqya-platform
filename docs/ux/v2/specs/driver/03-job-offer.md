# Driver — Job Offer

**Surface:** Incoming offer modal (30s)  
**Platform:** Flutter  
**IA:** Overlay on Online Map

---

## 1. UX rationale

High-stakes 30-second decision: distance, tank size, payout, pickup→drop. Countdown ring creates urgency without panic. Large Accept (64dp); Reject secondary. Arabic-first meta. Benchmark: Uber offer sheet clarity.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Dispatch push + socket | Sheet rises on Online Map |
| Background | Full-screen intent → open offer |
| Missed / timeout | Sheet dismiss; stay online |

Accept → Active Job. Reject/timeout → Online Map.

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ MAP dimmed                  │
├─────────────────────────────┤
│  (◉ 0:28 countdown ring)    │
│ طلب جديد                    │
│ ٢٠ م³ · ٢٫٤ كم              │
│ الأجرة ٤٥ ر.س               │
│ من: المحطة / إلى: النرجس    │
│                             │
│ [ قبول ]  height 64         │
│ [ رفض ]                     │
└─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Sheet | Radius xl 24; elevated lg |
| Countdown | Teal ring `#0A6E6E`; urgent <10s amber |
| Accept | Teal solid 64h |
| Reject | Ghost/danger text |
| Type | Title 2 payout; Body meta |
| Gold | Unused |
| Spacing | 20 pad; 12 meta stack |

---

## 5. Component hierarchy

```
JobOfferSheet
├── CountdownRing
├── OfferSummary (size, km, pay)
├── RouteEndpoints
├── SqButton Accept
└── SqButton Reject
```

---

## 6. Responsive behavior

- Always bottom sheet; on tablet still bottom (thumb), max width 480 centered.

---

## 7. RTL behavior

- Sheet RTL; ring geometry LTR.
- Distances/numbers LTR.

---

## 8. Accessibility notes

- Announce offer + payout + time remaining every 10s (not every second).
- Accept/Reject large and labeled.
- Reduce motion: static timer digits, no ring spin—sweep still OK as progress.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Present | Slide + scrim 280ms |
| Countdown | Ring 30s linear |
| Accept | Haptic medium + sheet dismiss → Active Job |
| Timeout | Sheet exit 180ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Accept in flight | Lock buttons; spinner on Accept |
| Accept fail (taken) | Toast “تم تعيين سائق آخر” |
| Double offer | Queue; show one at a time |
| Going offline mid-offer | Auto reject |
| Low GPS accuracy | Show warning still allow accept |

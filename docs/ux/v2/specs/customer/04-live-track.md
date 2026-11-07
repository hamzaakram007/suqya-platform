# Customer — Live Track

**Surface:** Active delivery tracking  
**Platform:** Flutter  
**IA:** Tab Track · deep link from push · post-confirm from Map Home

---

## 1. UX rationale

Live Track is the Uber-quality reassurance loop: map-first with driver marker, ETA badge, and a calm timeline. The customer should never hunt for status—sheet + map explain “where is my water?” in one glance. Motion is purposeful (marker pulse on assign, ETA glow once on arriving). No confetti; trust over celebration.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| After تأكيد الطلب | Auto-navigate with Hero from Map Home |
| Tab Track | Shows active order; if none → empty → Home CTA |
| Push “السائق في الطريق” | Deep link to this screen |
| Order Detail “تتبع” | Push Live Track |

Exit: Delivered → success banner → optional rate → Map Home or Order Detail.

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ [←]     تتبع الطلب          │
│                             │
│     MAP: route + truck 🚚   │
│     ETA pill: ١٢ دقيقة      │
│                             │
├─────────────────────────────┤
│ السائق: أحمد · ★ ٤٫٨        │
│ [اتصال] [رسالة]             │
│                             │
│ ○ تم التأكيد                │
│ ○ تم التعيين                │
│ ● في الطريق                 │
│ ○ تم التسليم                │
│                             │
│ الحجم ٢٠ م³ · ١٨٠ ر.س       │
└─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| ETA pill | Teal glass over map; Body 16 medium white on `#0A6E6E` |
| Timeline | `SqTimeline`; active node teal; done muted; pending `#C5D5D5` |
| Driver row | Avatar 40; name Title 3; rating Caption |
| Call/Message | Secondary ghost buttons, 48 min height |
| Type | IBM Plex Sans Arabic throughout |
| Gold | Only if VIP driver badge (rare) |
| Spacing | Sheet padding 20; timeline indent 16 |

---

## 5. Component hierarchy

```
LiveTrackScreen
├── SqMap (driver, destination, polyline)
├── EtaBadge
├── SqSheet
│   ├── DriverCard
│   │   ├── CallButton
│   │   └── MessageButton
│   ├── SqTimeline
│   └── OrderSummaryMini
└── RateSheet? (post-delivery)
```

---

## 6. Responsive behavior

- Portrait: map 55% / sheet 45%.
- Landscape: map full; sheet as side drawer.
- Tablet: split view map + persistent timeline panel.

Camera follows driver with bottom padding for sheet.

---

## 7. RTL behavior

- Back and actions use logical start/end.
- Timeline vertical; labels RTL; connector line stays center-start aligned with logical padding.
- Map north-up; no RTL flip of geography.
- Phone numbers LTR in call UI.

---

## 8. Accessibility notes

- Live region updates on status change: “السائق في الطريق، الوصول خلال ١٢ دقيقة”.
- Call/Message labeled clearly.
- ETA announced on change (throttle 60s).
- Color not sole status cue—icons + text on timeline.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Enter from confirm | Hero order→track, 280ms |
| Driver assigned | Marker pulse ×2, 600ms deliberate |
| Arriving | ETA badge glow once |
| Delivered | Success banner slide; no confetti |
| Polyline update | Camera ease 420ms slow |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Locating driver | Skeleton driver card; map pin destination only |
| No active order | `SqEmpty`: “لا يوجد طلب للتتعب” + اطلب الآن |
| GPS stale >90s | Amber banner “آخر موقع منذ …” |
| Driver cancel | Error sheet → redispatch or support |
| Network drop | Cached last known; offline banner |
| Multiple actives (rare) | Pager chips to switch orders |

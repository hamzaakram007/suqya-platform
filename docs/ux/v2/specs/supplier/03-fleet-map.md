# Supplier — Fleet Map

**Surface:** Map-first trucks & drivers  
**Platform:** Next.js  
**IA:** Nav الأسطول

---

## 1. UX rationale

Fleet is map-first: live truck pins, status color, click → driver card. Benchmark Uber fleet / Careem Captains map. Arabic side list mirrors map selection. Teal online; gray offline; amber idle long.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Nav Fleet | Full map |
| Today mini map | Expand here |
| After dispatch | Focus assigned truck |
| Drivers “عرض على الخريطة” | Focus pin |

---

## 3. Wireframe description

```
┌──────────────┬─────────────────────────────┐
│ قائمة السائقين│         MAP FULL           │
│ ● أحمد متصل  │         🚚 pins             │
│ ○ سامي غير   │                             │
│ فلتر الحالة  │  [تفاصيل الشاحنة]           │
└──────────────┴─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Map | Full panel; muted basemap |
| Pins | Teal / gray / amber |
| List | Width 320; selected row teal wash 8% |
| Type | IBM Plex Sans Arabic |
| Chrome | Glass locate / fit-bounds |
| Spacing | List pad 12; row 48 min |

---

## 5. Component hierarchy

```
FleetMapPage
├── DriverFilterList
├── SqMap (trucks)
├── TruckDetailPopover / Drawer
└── SqMapChrome
```

---

## 6. Responsive behavior

- Desktop: list | map.
- Mobile: map full; list as bottom sheet.

---

## 7. RTL behavior

- List inline-start; map fills rest.
- Geographic LTR; UI RTL.

---

## 8. Accessibility notes

- List is primary accessible tree; map optional enhancement.
- Selected sync announced.
- Color + icon status.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Pin select | Pulse once 280ms |
| Camera fit | 420ms slow |
| List select | Highlight 180ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton list + map shimmer |
| No trucks | SqEmpty add fleet CTA |
| Stale GPS | “آخر ظهور …” |
| Websocket drop | Banner reconnecting |
| Cluster dense | Cluster then expand |

# Admin — Live Ops

**Surface:** Command-center live map  
**Platform:** Next.js (admin-web)  
**IA:** First viewport — Live Ops

---

## 1. UX rationale

Admin opens on a live ops map—fleet + orders—not a KPI wall. Stuck orders are red pins; healthy teal. Journey J4 starts here. Dense tables stay behind Manage. Arabic-first chrome, map-first trust.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Login default | Live Ops |
| Nav Live Ops | Refresh |
| Alert click | Focus pin + Exceptions rail |

---

## 3. Wireframe description

```
┌──────────────────────────────────────────────┐
│ مباشر · استثناءات · مالية · إدارة            │
│ ┌──────────────────────────────────────────┐ │
│ │           LIVE MAP                        │ │
│ │   🚚 teal  📍 red stuck                   │ │
│ └──────────────────────────────────────────┘ │
│ شريط جانبي: طلبات حرجة / بحث                 │
└──────────────────────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Map | Full bleed under top nav |
| Healthy | Teal `#0A6E6E` |
| Stuck | Red pin + amber SLA |
| Gold | Unused on ops map |
| Type | IBM Plex Sans Arabic |
| Rail | Width 360; glass |
| Spacing | Chrome 16 |

---

## 5. Component hierarchy

```
LiveOpsPage
├── AdminTopNav
├── SqMap (orders + drivers)
├── CriticalRail
├── OrderQuickDrawer
└── SqMapChrome (filters, fit)
```

---

## 6. Responsive behavior

- Desktop: map + rail.
- Tablet: map; rail as drawer.
- Mobile: map; bottom sheet critical list (ops primarily desktop).

---

## 7. RTL behavior

- Nav RTL; rail inline-end or start per layout token.
- Map geographic LTR.

---

## 8. Accessibility notes

- Critical list is accessible primary; map secondary.
- Live region throttled for new stuck items.
- Focus-visible.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| New stuck | Pin pulse ×2, 600ms |
| Camera focus | 420ms |
| Drawer | 280ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Map skeleton + rail skeletons |
| Quiet ops | “لا استثناءات — النظام مستقر” |
| WS disconnect | Banner reconnect |
| Overplot | Clustering |
| Multi-tenant filter | Empty if filter too narrow |

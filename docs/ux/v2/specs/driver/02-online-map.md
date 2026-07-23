# Driver — Online Map Home

**Surface:** Availability + fleet position home  
**Platform:** Flutter  
**IA:** Root after auth; earnings/profile via chrome

---

## 1. UX rationale

Map-first command surface: online/offline power toggle, own location, and incoming work. One-handed bottom action zone—no hamburger for core flow. Feels Careem Captain: big Online button, calm map, minimal chrome. Teal = online trust.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Post-auth | Default |
| After POD/cash | Return online |
| From Offline mode | Resume |
| Background location resume | Restore map + status |

Job Offer overlays this map (modal sheet).

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ الأرباح اليوم   الملف       │  ← glass chrome
│                             │
│         MAP (driver)        │
│                             │
│                             │
│      [ ● متصل ]             │  ← large toggle FAB zone
│   اسحب لقبول الطلبات        │
└─────────────────────────────┘
```

Offline: muted map + “غير متصل” secondary CTA.

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Online toggle | Teal fill when on; gray when off; height 64; radius xl |
| Chrome | SqMapChrome glass |
| Type | IBM Plex Sans Arabic; earnings Caption/Title 3 |
| Gold | Unused on map home |
| Spacing | Bottom safe + 24; toggle centered thumb |

---

## 5. Component hierarchy

```
OnlineMapScreen
├── SqMap
├── SqMapChrome (Earnings shortcut, Profile)
├── OnlineToggle (SqButton/SqFAB family)
├── StatusCaption
└── JobOfferSheet (overlay when offered)
```

---

## 6. Responsive behavior

- Phone: full-bleed map; controls bottom.
- Landscape: toggle remains bottom-center; chrome top.
- Tablet: same; larger map padding.

---

## 7. RTL behavior

- Chrome actions logical start/end.
- Map geographic LTR.
- Earnings numerals LTR.

---

## 8. Accessibility notes

- Toggle announces “متصل” / “غير متصل”.
- Min 64×64 primary.
- Location permission rationale in Arabic before enable.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Go online | Toggle color 180ms + subtle pulse once |
| Job offer arrive | Sheet + countdown (see Job Offer) |
| Camera self-follow | 420ms slow |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| GPS acquiring | Banner “جاري تحديد موقعك” |
| Location denied | Blocking card → settings |
| No network | Auto Offline mode (see 09) |
| Supplier pause | Cannot go online; reason text |
| Battery saver kill | Prompt disable optimization (Android) |

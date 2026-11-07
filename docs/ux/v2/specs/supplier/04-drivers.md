# Supplier — Drivers

**Surface:** Driver performance & management  
**Platform:** Next.js  
**IA:** More / Drivers (or nav sibling)

---

## 1. UX rationale

Cards (not spreadsheets) for performance: trips, rating, online hours, docs status. Progressive CRUD for invite/suspend. Arabic names primary; phone LTR.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Nav Drivers | List |
| Fleet list “إدارة” | Open driver |
| Docs expiry alert | Filter expiring |

---

## 3. Wireframe description

```
┌────────────────────────────────────────────┐
│ السائقون  [دعوة] [بحث]                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ أحمد    │ │ سامي    │ │ نورة    │        │
│ │ ★ ٤٫٩   │ │ غير متصل│ │ مستندات │        │
│ │ ١٢ رحلة │ │         │ │ تنتهي   │        │
│ └─────────┘ └─────────┘ └─────────┘        │
└────────────────────────────────────────────┘
```

Detail: stats, docs, assign vehicle, suspend.

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Cards | Radius lg 16; pad 16; interaction |
| Rating | Caption; star icon |
| Invite CTA | Teal |
| Docs warn | Amber chip |
| Type | IBM Plex Sans Arabic Title 3 names |
| Spacing | Grid gap 16 |

---

## 5. Component hierarchy

```
DriversPage
├── Toolbar
├── DriverCardGrid
└── DriverDetailDrawer
    ├── Stats
    ├── Docs
    └── Actions (suspend, message)
```

---

## 6. Responsive behavior

- Desktop: 3–4 col grid.
- Tablet: 2 col.
- Mobile: 1 col.

---

## 7. RTL behavior

- Grid RTL flow.
- Phone/email LTR.

---

## 8. Accessibility notes

- Cards keyboard activatable.
- Suspend confirm dialog.
- Status text + color.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Drawer | 280ms |
| Invite success | Toast 280ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton cards |
| Empty | Invite CTA |
| Suspend fail | Error toast |
| Duplicate invite | Inline message |
| Low performers filter | Empty state copy |

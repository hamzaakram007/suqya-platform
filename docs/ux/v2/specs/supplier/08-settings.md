# Supplier — Settings

**Surface:** Tenant preferences & progressive config  
**Platform:** Next.js  
**IA:** More → الإعدادات

---

## 1. UX rationale

Progressive settings: business profile, hours, service zones, notifications, users/roles, billing contacts. Not a dumping ground for ops. Calm list; teal saves; Arabic-first.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| More → Settings | Default |
| Zone empty on order reject | Deep link zones |
| Invite user | Users section |

---

## 3. Wireframe description

```
┌────────────┬───────────────────────────────┐
│ الملف      │ اسم المنشأة · السجل التجاري   │
│ المناطق    │ …                             │
│ الفريق     │                               │
│ الإشعارات  │                               │
│ الفوترة    │                               │
└────────────┴───────────────────────────────┘
```

Zones: map polygon editor.

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Side nav | Quiet; active teal |
| Forms | 48 inputs; teal submit |
| Map zones | Teal fill 20% opacity |
| Type | IBM Plex Sans Arabic |
| Gold | Unused |
| Spacing | 24 form sections |

---

## 5. Component hierarchy

```
SettingsPage
├── SettingsNav
├── ProfileSection
├── ZonesMapEditor
├── TeamRolesSection
├── NotificationsSection
└── BillingSection
```

---

## 6. Responsive behavior

- Desktop: side nav | content.
- Mobile: stacked settings index → detail.

---

## 7. RTL behavior

- Side nav inline-start.
- Map editor geographic LTR.
- CR numbers LTR.

---

## 8. Accessibility notes

- Nav current page announced.
- Destructive role changes confirm.
- Focus rings on web.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Section switch | Fade 180ms |
| Save | Toast 280ms |
| Polygon edit | Vertex feedback 100ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton form |
| Save conflict | Reload prompt |
| Invalid zone | Inline map error |
| Last admin removal | Blocked |
| Empty team | Invite CTA |

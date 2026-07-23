# Driver — Profile & Documents

**Surface:** Identity + compliance docs  
**Platform:** Flutter  
**IA:** Map chrome → الملف · Docs gate post-auth

---

## 1. UX rationale

Drivers cannot go online without required docs. Profile shows status chips (valid / expiring / rejected) with clear Arabic upload. Operational, not social. Teal for valid; amber expire; no purple.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Chrome profile | Open |
| Auth docs gate | Forced |
| Expiry push | Deep link doc |

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ الملف                       │
│ الاسم · المركبة · المورد    │
│                             │
│ المستندات                   │
│ رخصة القيادة    سارية ✓     │
│ استمارة         تنتهي قريباً│
│ تأمين           مرفوض       │
│                             │
│ [رفع مستند]                 │
│ الإعدادات · تسجيل الخروج    │
└─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Valid chip | Teal |
| Expiring | Amber |
| Rejected | Danger red |
| Upload CTA | Teal |
| Type | IBM Plex Sans Arabic |
| Gold | Unused |
| Spacing | 16 rows ≥56h |

---

## 5. Component hierarchy

```
DriverProfileScreen
├── IdentityHeader
├── VehicleSupplierMeta
├── DocumentsList
│   └── DocRow → UploadSheet
├── SettingsLinks
└── Logout
```

---

## 6. Responsive behavior

- Phone: list.
- Tablet: profile card + docs grid.

---

## 7. RTL behavior

- RTL rows; status chips inline-end.
- File names LTR if Latin.

---

## 8. Accessibility notes

- Status text not color-only.
- Upload progress announced.
- Logout confirm.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Upload progress | Linear bar |
| Approval (push) | Soft banner 280ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton |
| Missing required | Blocking banner cannot online |
| Upload fail | Retry; size/type errors |
| Rejected reason | Show admin note |
| Expiring <7d | Amber home banner too |

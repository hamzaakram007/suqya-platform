# Customer — Profile & Settings

**Surface:** Identity + preferences  
**Platform:** Flutter  
**IA:** Tab Account → الملف والإعدادات

---

## 1. UX rationale

Account is progressive disclosure: who I am, language, notifications, biometrics, legal—not a dumping ground for orders/wallet (those are siblings). Calm list rows, teal accents on toggles, Arabic-first with EN secondary. Brand quiet here; utility clear.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Tab Account | Hub then Profile/Settings |
| System OS settings deep link | Notifications |
| Language change | Immediate RTL/LTR rebuild |

Hub also links: Orders, Wallet, Addresses, Support (spec’d elsewhere).

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ حسابي                       │
│ [Avatar] الاسم · الجوال     │
│                             │
│ طلباتي ›                    │
│ المحفظة ›                   │
│ العناوين ›                  │
│ الدعم ›                     │
│ ─────────                   │
│ اللغة          العربية ›    │
│ الإشعارات              ◉    │
│ الدخول بالبصمة         ◉    │
│ الوضع الداكن       النظام › │
│ الأرقام العربية        ○    │
│ ─────────                   │
│ عن سقيا · الشروط            │
│ [تسجيل الخروج]              │
└─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Header | Avatar 64; name Title 2; phone Caption |
| Rows | Height ≥56; chevron logical end |
| Toggle on | Teal `#0A6E6E` |
| Logout | Danger text/ghost; not primary teal |
| Type | IBM Plex Sans Arabic |
| Gold | Unused |
| Spacing | Section 8; group gaps 24 |

---

## 5. Component hierarchy

```
AccountShell
├── ProfileHeader
├── NavLinks (Orders, Wallet, Addresses, Support)
├── SettingsGroup
│   ├── Language
│   ├── Notifications
│   ├── Biometrics
│   ├── Theme
│   └── NumeralStyle
├── LegalLinks
└── LogoutButton
```

---

## 6. Responsive behavior

- Phone: single scroll.
- Tablet: profile card start; settings list end.

---

## 7. RTL behavior

- Entire list RTL; chevrons mirror.
- Language switch to EN flips layout LTR with confirmation.
- Phone number always LTR.

---

## 8. Accessibility notes

- Toggles have names + state.
- Logout confirm dialog.
- Dynamic type: rows grow; no clip.
- Focus visible on web if embedded.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Toggle | 180ms fast |
| Language switch | Fade rebuild 280ms |
| Logout | Sheet confirm 280ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Profile load | Skeleton header |
| Biometric unavailable | Hide or disabled row with reason |
| Save prefs fail | Toast + revert toggle |
| Forced logout | Message then Auth |
| Guest (shouldn’t) | Redirect Auth |

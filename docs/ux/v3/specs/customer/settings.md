# Customer — Settings (Bilingual)

**Surface:** Account → Profile & Settings — **language switch home**  
**Platform:** Flutter  
**IA:** [V3 IA](../../ia.md)  
**V2 reference:** [Profile Settings V2](../../v2/specs/customer/09-profile-settings.md)  
**Scorecard:** [customer-settings](../../scorecards/customer-settings.md)

---

## Business impact

Centralizing language in Settings reduces support tickets about "stuck Arabic" and enables household devices shared between AR/EN users. Persisting locale to profile keeps push notifications and SMS aligned with in-app language.

---

## UX rationale

Account hub unchanged from V2. **Language** row uses `SqLanguageSegment` (العربية · English). Switching triggers root rebuild with cross-fade, API persist, and accessibility announcement.

---

## Wireframe

```
┌─────────────────────────────┐
│ Account / حسابي             │
│ [Avatar] Name · Phone       │
│ Orders ›  Wallet ›  …       │
│ ─────────                   │
│ Language                    │
│   [ العربية | English ]     │  ← SqLanguageSegment
│ Notifications          ◉    │
│ Biometric login        ◉    │
│ Theme              System › │
│ Arabic numerals        ○    │
│ ─────────                   │
│ About · Terms               │
│ [ Sign out ]                │
└─────────────────────────────┘
```

---

## Component hierarchy

```
AccountSettingsScreen
├── ProfileHeader
├── NavLinks
├── SqLanguageSegment → LocaleProvider
├── SettingsToggles (l10n)
├── LegalLinks
└── LogoutButton
```

---

## LTR behavior (EN)

- Full LTR list; chevrons point **end** (right)
- Language segment: selecting **English** highlights end segment
- Phone number LTR isolate always
- Theme values: System / Light / Dark
- Logout confirm: "Sign out?" / Cancel / Sign out
- On switch from AR: `MaterialApp` rebuilds LTR; `SemanticsService.announce('Language changed to English')`

---

## RTL behavior (AR)

- RTL list; chevrons point **end** (left)
- Language segment: **العربية** at start (right)
- Arabic numerals toggle default **on**
- Logout: **تسجيل الخروج؟** / إلغاء / خروج
- Announce: **تم تغيير اللغة إلى العربية**

---

## Language switch flow

1. User taps segment
2. Optimistic UI direction + strings
3. `PATCH /users/me/locale` `{ "locale": "en" | "ar" }`
4. On failure: revert + toast localized error

---

## Edge cases

| Case | Behavior |
|------|----------|
| Mid-order | Allow switch; Map Home preserves state |
| Biometric unavailable | Row hidden with localized reason EN/AR |
| Forced logout | Message in last known locale |

---

## Accessibility

- Segment is `radio` group with two options
- Toggles expose name + state in active locale
- Logout dialog traps focus; ESC dismiss

---

## Business metrics

Track `settings.language_changed` event with `from` / `to` for cohort analysis.

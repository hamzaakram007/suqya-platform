# Driver — Settings (Bilingual)

**Surface:** Profile → Settings  
**Platform:** Flutter  
**IA:** [V3 IA](../../ia.md) — language switch  
**V2 reference:** [Profile Docs V2](../../v2/specs/driver/08-profile-docs.md) (settings subset)  
**Scorecard:** [driver-home](../../scorecards/driver-home.md) (settings shared)

---

## Business impact

Drivers switch language less often than customers but need parity for onboarding and compliance documents. Locale on profile drives dispatch SMS language where configured.

---

## UX rationale

Compact settings list: Language, notifications, navigation app preference, documents, logout. Language uses same `SqLanguageSegment` as customer app for consistency.

---

## Wireframe

```
┌─────────────────────────────┐
│ Settings / الإعدادات        │
│ Language  [ AR | EN ]       │
│ Notifications          ◉    │
│ Navigation app         ›    │
│ Documents              ›    │
│ ─────────                   │
│ [ Sign out ]                │
└─────────────────────────────┘
```

---

## LTR behavior (EN)

- IBM Plex Sans; list LTR
- Navigation app picker: Google Maps / Apple Maps / Waze
- Documents: license, insurance upload labels EN
- Sign out confirm English

---

## RTL behavior (AR)

- IBM Plex Sans Arabic; list RTL
- Document expiry dates: Hijri optional caption
- Sign out Arabic confirm

---

## Language switch

Same flow as customer Settings: segment → rebuild → `PATCH /users/me/locale` → announce.

If driver has active job: allow switch; active job labels update on next step transition.

---

## Accessibility

- Document upload buttons labeled
- Notification toggle state in locale

---

## Business impact notes

- Align push notification template with profile locale
- Document rejection reasons from API localized

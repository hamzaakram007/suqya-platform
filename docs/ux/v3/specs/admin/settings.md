# Admin — Settings / System (Bilingual)

**Surface:** Manage → Settings — **language switch home**  
**Platform:** Next.js (admin-web)  
**IA:** [V3 IA](../../ia.md)  
**V2 reference:** [System V2](../../v2/specs/admin/11-system.md)  
**Scorecard:** [admin-settings](../../scorecards/admin-settings.md)

---

## Business impact

Admin users include vendor support and tenant ops with varying language preference. Bilingual settings and system health labels reduce misconfiguration during incidents (maintenance mode, feature flags).

---

## UX rationale

Settings nav: **Language** (top), General, Features, Integrations, Queues. System config remains progressive; dangerous toggles use bilingual confirm dialogs.

---

## Wireframe

```
┌────────────┬───────────────────────────────┐
│ Language   │ Language [ AR | EN ]          │
│ General    │ Maintenance · App versions    │
│ Features   │ Feature flags                 │
│ Integrations│ SMS · Payment · Maps health  │
│ Queues     │ Dispatch queue depth          │
└────────────┴───────────────────────────────┘
```

---

## LTR behavior (EN)

- Side nav **start** (left)
- Language segment updates `<html lang="en" dir="ltr">`
- Maintenance toggle → confirm: "Enable maintenance mode? Users will see a banner."
- Integration status: Healthy / Degraded / Down
- Feature flag descriptions EN (technical keys remain LTR monospace)
- URLs and API keys LTR

---

## RTL behavior (AR)

- Side nav **start** (right)
- `<html lang="ar" dir="rtl">`
- Maintenance confirm Arabic
- Status: **سليم** / **متدهور** / **متوقف**

---

## Language switch

Same mechanism as supplier portal: cookie, refresh, API persist, cross-fade (no horizontal push).

Announce to screen readers on switch.

---

## Dangerous actions

| Action | EN confirm | AR confirm |
|--------|------------|------------|
| Maintenance on | Enable maintenance mode? | تفعيل وضع الصيانة؟ |
| Force logout all | Sign out all users? | تسجيل خروج جميع المستخدمين؟ |

---

## Accessibility

- Toggle switches labeled
- Status not color-only (icon + text)
- Skip to content link top of shell

---

## Business impact notes

- Maintenance banner text pulled from CMS bilingual fields
- Min app version messages shown to end users in their locale, configured here with AR + EN fields
- Audit log stores admin locale at action time for compliance review

---

## Technical keys (intentionally EN)

Feature flag keys (`dispatch.v2_enabled`), queue names, and masked API keys stay LTR English — not translated. User-facing labels wrap them.

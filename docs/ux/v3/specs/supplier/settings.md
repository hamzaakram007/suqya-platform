# Supplier — Settings (Bilingual)

**Surface:** More → Settings — **language switch home**  
**Platform:** Next.js (supplier-web)  
**IA:** [V3 IA](../../ia.md)  
**V2 reference:** [Settings V2](../../v2/specs/supplier/08-settings.md)  
**Scorecard:** [supplier-today](../../scorecards/supplier-today.md) (settings gate)

---

## Business impact

Supplier tenants often have bilingual staff. Settings locale drives portal UI, email reports, and optional SMS alerts. Zone editor labels must be clear for EN-speaking logistics managers.

---

## UX rationale

Progressive settings: Profile, Zones, Team, Notifications, Billing. **Language** is first item under Preferences for discoverability (V3 IA).

---

## Wireframe

```
┌────────────┬───────────────────────────────┐
│ Profile    │ Preferences                   │
│ Zones      │ Language [ العربية | EN ]   │
│ Team       │ Notifications                 │
│ Billing    │ …                             │
└────────────┴───────────────────────────────┘
```

---

## LTR behavior (EN)

- Side nav **start** (left); active item teal border **start**
- Language segment at top of Preferences
- Zone map editor: draw tools labeled EN; map geographic LTR
- CR number fields LTR
- Save: **Save changes** teal button

---

## RTL behavior (AR)

- Side nav **start** (right)
- Language segment mirrored visually; map still geographic LTR
- Save: **حفظ التغييرات**

---

## Language switch flow

1. Toggle segment
2. Set cookie `suqya_locale` + `localStorage`
3. Update `<html lang dir>`
4. `router.refresh()` all server components
5. `PATCH /suppliers/me/locale` if authenticated

Cross-fade 280ms per [motion-a11y.md](../../motion-a11y.md).

---

## Zones map editor

| Element | Both locales |
|---------|--------------|
| Polygon draw | Teal fill 20% |
| Save zone | Localized |
| Delete confirm | Bilingual dialog |

Coordinates display LTR.

---

## Accessibility

- Side nav: `aria-current="page"`
- Form errors linked to fields
- Skip link localized

---

## Business impact notes

- Export CSV headers follow portal locale
- Team invite emails use invitee locale if known, else tenant default

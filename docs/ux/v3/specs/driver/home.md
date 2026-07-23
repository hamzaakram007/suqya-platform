# Driver — Online Map Home (Bilingual)

**Surface:** Availability + map home  
**Platform:** Flutter  
**IA:** [V3 IA](../../ia.md)  
**V2 reference:** [Online Map V2](../../v2/specs/driver/02-online-map.md)  
**Scorecard:** [driver-home](../../scorecards/driver-home.md)

---

## Business impact

Driver online time directly affects fill rate. Clear EN/AR status labels reduce accidental offline states among non-Arabic-speaking drivers and improve compliance with location permission prompts.

---

## UX rationale

Map-first with large online toggle (64dp). Earnings and Profile shortcuts in chrome. Language switch lives in Profile → Settings, not on map overlay.

---

## Wireframe

```
┌─────────────────────────────┐
│ Earnings        Profile     │  ← localized chrome
│         MAP                 │
│      [ ● Online ]           │  ← AR: متصل
│   Pull to accept jobs       │
└─────────────────────────────┘
```

---

## Component hierarchy

```
OnlineMapScreen
├── SqMap
├── SqMapChrome (Earnings, Profile)
├── OnlineToggle
├── StatusCaption (l10n)
└── JobOfferSheet (overlay)
```

---

## LTR behavior (EN)

- Chrome: **Earnings** (start), **Profile** (end)
- Toggle: **Online** / **Offline**
- Caption: "Pull to accept jobs" / "You are offline"
- Earnings amount Western digits in chrome chip
- GPS banner: "Finding your location…"
- Permission dialog English copy before OS prompt

---

## RTL behavior (AR)

- Chrome: **الأرباح** / **الملف**
- Toggle: **متصل** / **غير متصل**
- Caption: **اسحب لقبول الطلبات**
- Earnings may use Arabic-Indic if driver enabled numerals
- GPS: **جاري تحديد موقعك**

---

## Offline / edge states

| State | EN | AR |
|-------|----|----|
| GPS denied | Location required to go online | الموقع مطلوب للاتصال |
| Supplier pause | Supplier paused new jobs | المورد أوقف الطلبات الجديدة |
| No network | Offline mode | وضع دون اتصال |

API pause reasons via localized `code` → message map.

---

## Accessibility

- Toggle 64×64; semantics reflect state
- Location rationale screen before iOS/Android prompt
- Map controls labeled in locale

---

## Link to Settings

Profile → Settings → Language (`SqLanguageSegment`). Change applies after returning to map (not during active offer countdown).

---

## Business metrics

Online minutes by driver locale; permission grant rate EN vs AR.

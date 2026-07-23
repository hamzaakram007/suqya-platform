# Scorecard — Driver Jobs (Offer → POD)

**Surface:** Job Offer, Active Job, POD  
**Spec:** [../specs/driver/jobs.md](../specs/driver/jobs.md)

---

## Scores (0–100)

| Framework | Score | Notes |
|-----------|-------|-------|
| Apple HIG | 87 | Countdown clear; stress UX OK |
| Material Design 3 | 88 | Bottom sheet offer |
| Nielsen heuristics | 85 | Error recovery on POD weak in EN |
| WCAG 2.2 AA | 81 | Countdown not announced every 10s |
| Bilingual parity | 77 | Route endpoint labels from geocoder single-language |
| **Composite** | **84** | |

**Target:** ≥95

---

## Gaps

1. Countdown ring accessibility live region too chatty / not localized
2. POD validation errors hardcoded
3. Cash collect sheet EN layout overflow
4. Reject/Accept not differentiated by haptic + semantics in EN
5. Active job step labels missing from `app_en.arb`

---

## Remediations

| # | Action | Lift |
|---|--------|------|
| R1 | Announce at 30s, 10s, 5s in locale | WCAG +5 |
| R2 | POD error strings ARB | Bilingual +5 |
| R3 | Cash collect responsive stack on narrow EN | MD3 +3 |
| R4 | Geocoder dual-line address display | Bilingual +4 |
| R5 | Active job timeline l10n keys | Bilingual +4 |
| R6 | Offer sheet max width 480 centered both locales | HIG +2 |

**Projected composite:** 97

---

## Sign-off

- [ ] Full J2 in EN with VoiceOver
- [ ] POD photo + sign flow AR TalkBack
- [ ] Missed offer copy bilingual


---

## Phase 16 status

Remediations from this scorecard are **implemented** in Sprint C�G (l10n catalogs, language switch, FAQ/API locale, next-intl, ops alerts). **Projected composite =95** pending device QA in both locales.


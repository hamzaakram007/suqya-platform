# Scorecard — Customer Settings

**Surface:** Customer Profile & Settings (Language home)  
**Spec:** [../specs/customer/settings.md](../specs/customer/settings.md)

---

## Scores (0–100)

| Framework | Score | Notes |
|-----------|-------|-------|
| Apple HIG | 92 | Clear hierarchy; language placement correct per IA |
| Material Design 3 | 91 | Lists, toggles standard |
| Nielsen heuristics | 90 | User control strong |
| WCAG 2.2 AA | 84 | Toggle state announced; logout dialog EN strings partial |
| Bilingual parity | 80 | Language switch works; Arabic-Indic toggle EN label awkward |
| **Composite** | **87** | |

**Target:** ≥95

---

## Gaps

1. Logout confirm dialog missing `messageEn` in API error path
2. "Arabic numerals" row English copy unclear ("Arabic-Indic numerals" preferred)
3. No `SemanticsService.announce` on locale change
4. Theme picker values ("System") not translated
5. Biometric row hidden on EN without explanation string

---

## Remediations

| # | Action | Lift |
|---|--------|------|
| R1 | Full ARB for settings + dialog buttons | Bilingual +4 |
| R2 | Announce locale change per motion-a11y | WCAG +5 |
| R3 | Rename numeral toggle: EN "Use Arabic numerals" / AR "الأرقام العربية" | Bilingual +3 |
| R4 | Localize theme enum labels | MD3 +2 |
| R5 | Biometric unavailable row with localized reason | Nielsen +2 |
| R6 | Persist locale to API before UI rebuild; rollback toast on fail | Nielsen +2 |

**Projected composite:** 97

---

## Sign-off

- [ ] Language switch ≤280ms perceived
- [ ] Profile loads in both locales
- [ ] Logout confirm bilingual


---

## Phase 16 status

Remediations from this scorecard are **implemented** in Sprint C�G (l10n catalogs, language switch, FAQ/API locale, next-intl, ops alerts). **Projected composite =95** pending device QA in both locales.


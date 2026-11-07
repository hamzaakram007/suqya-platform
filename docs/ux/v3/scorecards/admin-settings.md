# Scorecard — Admin Settings

**Surface:** Admin Settings / System Config  
**Spec:** [../specs/admin/settings.md](../specs/admin/settings.md)

---

## Scores (0–100)

| Framework | Score | Notes |
|-----------|-------|-------|
| Apple HIG | 86 | Progressive disclosure |
| Material Design 3 | 87 | Side nav settings |
| Nielsen heuristics | 85 | Dangerous actions gated |
| WCAG 2.2 AA | 82 | Maintenance confirm dialog partial EN |
| Bilingual parity | 70 | Technical keys EN-only (OK) but labels mixed |
| **Composite** | **82** | |

**Target:** ≥95

---

## Gaps

1. Language switch buried under Manage → Settings (IA OK but undiscoverable in audit)
2. Feature flag labels Arabic-only
3. Integration health status not localized
4. Maintenance mode confirm EN missing
5. `<html lang>` not updated on admin locale switch

---

## Remediations

| # | Action | Lift |
|---|--------|------|
| R1 | Settings i18n for all user-facing labels | Bilingual +8 |
| R2 | Language toggle prominent in Settings nav top | Nielsen +3 |
| R3 | Maintenance confirm dialog ARB | WCAG +4 |
| R4 | Integration status: "Healthy" / "سليم" | Bilingual +3 |
| R5 | Update `lang` + `dir` on locale hook | WCAG +4 |
| R6 | Feature flags show EN description Caption | Bilingual +2 |

**Projected composite:** 96

---

## Sign-off

- [ ] Language switch updates entire admin shell
- [ ] Maintenance flow bilingual confirm
- [ ] Technical monospace keys remain LTR in RTL


---

## Phase 16 status

Remediations from this scorecard are **implemented** in Sprint C�G (l10n catalogs, language switch, FAQ/API locale, next-intl, ops alerts). **Projected composite =95** pending device QA in both locales.


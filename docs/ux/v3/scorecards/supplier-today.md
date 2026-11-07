# Scorecard — Supplier Today

**Surface:** Supplier Today (command)  
**Spec:** [../specs/supplier/today.md](../specs/supplier/today.md)

---

## Scores (0–100)

| Framework | Score | Notes |
|-----------|-------|-------|
| Apple HIG | 85 | Web portal; density OK |
| Material Design 3 | 88 | KPI + cards |
| Nielsen heuristics | 87 | J3 clear |
| WCAG 2.2 AA | 83 | Accept/Reject keyboard ✓; map alt list partial |
| Bilingual parity | 74 | `@suqya/i18n` partial; KPI labels mixed |
| **Composite** | **83** | |

**Target:** ≥95

---

## Gaps

1. Page title hardcoded Arabic in some builds
2. New order toast English missing
3. Mini map truck list alternative incomplete
4. Language toggle in Settings not propagated to Today without refresh
5. Date range on KPIs uses browser default locale

---

## Remediations

| # | Action | Lift |
|---|--------|------|
| R1 | Full `@suqya/i18n` for Today module | Bilingual +7 |
| R2 | `router.refresh()` on locale change | Bilingual +4 |
| R3 | KPI `Intl` with user locale cookie | Bilingual +3 |
| R4 | Map text alternative list component | WCAG +5 |
| R5 | Accept/Reject aria-labels EN/AR | WCAG +3 |
| R6 | New order slide-in respects reduced motion | HIG +2 |

**Projected composite:** 97

---

## Sign-off

- [ ] J3 completable in EN
- [ ] KPI numbers LTR in RTL shell
- [ ] Keyboard Accept flow


---

## Phase 16 status

Remediations from this scorecard are **implemented** in Sprint C�G (l10n catalogs, language switch, FAQ/API locale, next-intl, ops alerts). **Projected composite =95** pending device QA in both locales.


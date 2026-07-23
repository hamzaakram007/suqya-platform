# Scorecard — Driver Home (Online Map)

**Surface:** Driver Online Map Home  
**Spec:** [../specs/driver/home.md](../specs/driver/home.md)

---

## Scores (0–100)

| Framework | Score | Notes |
|-----------|-------|-------|
| Apple HIG | 90 | One-handed zone strong |
| Material Design 3 | 89 | FAB/toggle patterns |
| Nielsen heuristics | 88 | Status visibility good |
| WCAG 2.2 AA | 83 | Online toggle 64dp ✓; EN label length on chrome |
| Bilingual parity | 79 | Earnings shortcut localized; GPS banners partial EN |
| **Composite** | **86** | |

**Target:** ≥95

---

## Gaps

1. GPS permission rationale dialog Arabic-only
2. "Go online" caption truncates in EN
3. Settings language entry not linked from profile chrome
4. Offline auto-mode banner not in ARB
5. Supplier pause reason from API not localized

---

## Remediations

| # | Action | Lift |
|---|--------|------|
| R1 | Permission rationale ARB both locales | Bilingual +5 |
| R2 | Caption multi-line max 2 lines | HIG +3 |
| R3 | Profile → Settings → Language IA link | Bilingual +3 |
| R4 | `api-messages` for supplier pause codes | Bilingual +4 |
| R5 | Toggle semantics "Online" / "متصل" dynamic | WCAG +4 |
| R6 | Offline banner l10n | Nielsen +2 |

**Projected composite:** 96

---

## Sign-off

- [ ] Toggle operable one-handed EN/AR
- [ ] Location permission flow bilingual
- [ ] Return from POD preserves locale


---

## Phase 16 status

Remediations from this scorecard are **implemented** in Sprint C�G (l10n catalogs, language switch, FAQ/API locale, next-intl, ops alerts). **Projected composite =95** pending device QA in both locales.


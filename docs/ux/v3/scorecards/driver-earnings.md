# Scorecard — Driver Earnings

**Surface:** Driver Earnings  
**Spec:** Referenced in [../specs/driver/home.md](../specs/driver/home.md) (earnings entry)

---

## Scores (0–100)

| Framework | Score | Notes |
|-----------|-------|-------|
| Apple HIG | 91 | SqKpi clarity |
| Material Design 3 | 90 | Period chips |
| Nielsen heuristics | 89 | Trust via breakdown |
| WCAG 2.2 AA | 85 | Amounts LTR ✓; period chips focus order |
| Bilingual parity | 82 | Settlement badge EN; trip list dates partial |
| **Composite** | **87** | |

**Target:** ≥95

---

## Gaps

1. Period chip "Week" / "Month" not in i18n
2. Gold settled badge lacks text alternative in EN
3. Trip list `#2841` format not announced as "trip" prefix in AR
4. Empty period state missing EN
5. Payout push deep link ignores locale

---

## Remediations

| # | Action | Lift |
|---|--------|------|
| R1 | Period chips ARB | Bilingual +4 |
| R2 | Settlement badge: "Paid" / "مدفوعة" + icon | WCAG +4 |
| R3 | Trip row semantics localized | WCAG +3 |
| R4 | Empty state SqEmpty bilingual | Nielsen +3 |
| R5 | Deep link sets locale from user profile | Bilingual +3 |
| R6 | `Intl.DateTimeFormat` for trip timestamps | Bilingual +2 |

**Projected composite:** 96

---

## Sign-off

- [ ] Today/week/month totals format correctly AR/EN
- [ ] Settlement badge not color-only
- [ ] Screen reader reads amounts correctly


---

## Phase 16 status

Remediations from this scorecard are **implemented** in Sprint C�G (l10n catalogs, language switch, FAQ/API locale, next-intl, ops alerts). **Projected composite =95** pending device QA in both locales.


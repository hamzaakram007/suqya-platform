# Scorecard — Customer Map Home

**Surface:** Customer Map Home (3-tap order)  
**Spec:** [../specs/customer/home.md](../specs/customer/home.md)  
**Baseline audit:** Sprint B kickoff

---

## Scores (0–100)

| Framework | Score | Notes |
|-----------|-------|-------|
| Apple HIG | 88 | Strong map-first; EN CTA width stress untested |
| Material Design 3 | 90 | Sheet + FAB patterns aligned |
| Nielsen heuristics | 86 | Visibility good; error recovery bilingual gaps |
| WCAG 2.2 AA | 82 | Semantics AR-only on tank chips in build |
| Bilingual parity | 78 | EN home completable but numeral toggle missing in QA |
| **Composite** | **85** | |

**Target after remediations:** ≥95 composite

---

## Gaps

1. Tank chip `Semantics` uses Arabic-only labels when UI is EN
2. Price block does not wrap long EN "Calculating price…" without clip at 320px
3. `SqLanguageSegment` not yet in Account path — home inherits locale but no mid-flow indicator
4. Address search placeholder not in `app_en.arb` (falls back to key)
5. Hero transition to Live Track breaks under RTL→LTR switch mid-order

---

## Remediations (planned score ≥95)

| # | Action | Framework lift | Est. score |
|---|--------|----------------|------------|
| R1 | Add l10n semantics for chips: "20 m³ tank, selected" / "خزان ٢٠ م³، محدد" | WCAG + Bilingual | +4 |
| R2 | Allow CTA row + price Caption to wrap; min height 56 | HIG + MD3 | +3 |
| R3 | Wire `localizeName` for saved address labels from API | Bilingual | +4 |
| R4 | Complete `app_en.arb` home keys; CI parity gate | Bilingual | +5 |
| R5 | Disable Hero during locale rebuild; cross-fade only | Nielsen + HIG | +3 |
| R6 | Out-of-zone `SqEmpty` EN copy + support deep link | Nielsen | +2 |

**Projected composite:** 96

---

## Sign-off criteria

- [ ] 3-tap completable EN on iPhone SE width
- [ ] TalkBack AR + VoiceOver EN pass chip selection
- [ ] Language switch from Account → return Home preserves tank selection
- [ ] Lighthouse a11y ≥95 on web embed if applicable


---

## Phase 16 status

Remediations from this scorecard are **implemented** in Sprint C�G (l10n catalogs, language switch, FAQ/API locale, next-intl, ops alerts). **Projected composite =95** pending device QA in both locales.


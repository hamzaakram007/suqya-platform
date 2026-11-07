# Scorecard — Customer Help

**Surface:** Customer Support / Help  
**Spec:** [../specs/customer/help.md](../specs/customer/help.md)

---

## Scores (0–100)

| Framework | Score | Notes |
|-----------|-------|-------|
| Apple HIG | 86 | Search-first good; FAQ hierarchy flat |
| Material Design 3 | 88 | Lists OK |
| Nielsen heuristics | 84 | Cross-locale search not discoverable |
| WCAG 2.2 AA | 80 | FAQ expand missing `aria-expanded` on web embed |
| Bilingual parity | 76 | FAQ API localized; search fallback badge missing |
| **Composite** | **83** | |

**Target:** ≥95

---

## Gaps

1. FAQ search indexes only active locale
2. Ticket status chips color-only for "closed"
3. Create ticket topic chips EN overflow on small screens
4. AI-suggested replies not gated by locale strategy
5. Attachment error strings hardcoded Arabic

---

## Remediations

| # | Action | Lift |
|---|--------|------|
| R1 | Bilingual FAQ search with fallback badge per localization.md | Bilingual +6 |
| R2 | Status chip icon + text | WCAG +4 |
| R3 | Topic chips wrap or horizontal scroll logical | MD3 +3 |
| R4 | Wire `localizeFaq` from API; seed EN content | Bilingual +5 |
| R5 | Localize attachment errors via api-messages | Nielsen +2 |
| R6 | FAQ expand a11y attributes Flutter + web | WCAG +3 |

**Projected composite:** 96

---

## Sign-off

- [ ] Search finds EN FAQ when UI is AR (with badge)
- [ ] Ticket create flow EN complete
- [ ] Screen reader FAQ navigation


---

## Phase 16 status

Remediations from this scorecard are **implemented** in Sprint C�G (l10n catalogs, language switch, FAQ/API locale, next-intl, ops alerts). **Projected composite =95** pending device QA in both locales.


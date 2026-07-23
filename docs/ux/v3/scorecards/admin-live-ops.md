# Scorecard — Admin Live Ops

**Surface:** Admin Live Ops Map  
**Spec:** [../specs/admin/live-ops.md](../specs/admin/live-ops.md)

---

## Scores (0–100)

| Framework | Score | Notes |
|-----------|-------|-------|
| Apple HIG | 84 | Map-first; desktop bias OK |
| Material Design 3 | 86 | Nav + rail |
| Nielsen heuristics | 88 | J4 intervention path short |
| WCAG 2.2 AA | 80 | Critical list primary ✓; live region throttle needed |
| Bilingual parity | 72 | Admin chrome mixed AR/EN |
| **Composite** | **82** | |

**Target:** ≥95

---

## Gaps

1. Top nav labels not all in `@suqya/i18n`
2. Stuck order live region fires too often / English only
3. Critical rail keyboard order breaks in RTL
4. Order drawer mixed-language customer names without `dir="auto"`
5. WS disconnect banner hardcoded

---

## Remediations

| # | Action | Lift |
|---|--------|------|
| R1 | Admin i18n namespace complete for Live Ops | Bilingual +8 |
| R2 | Throttled localized live region (max 1/30s) | WCAG +4 |
| R3 | RTL keyboard tab order audit + fix | WCAG +5 |
| R4 | `SqLocaleText` on customer names | Bilingual +3 |
| R5 | Reconnect banner ARB | Nielsen +2 |
| R6 | Skip-to-content link localized | WCAG +2 |

**Projected composite:** 96

---

## Sign-off

- [ ] J4 keyboard-only AR + EN
- [ ] Map + rail usable RTL
- [ ] Quiet ops empty state bilingual


---

## Phase 16 status

Remediations from this scorecard are **implemented** in Sprint C�G (l10n catalogs, language switch, FAQ/API locale, next-intl, ops alerts). **Projected composite =95** pending device QA in both locales.


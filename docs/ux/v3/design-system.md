# Suqya Design System V3 — Bilingual

Extends [V2 design system](../v2/design-system.md). Same tokens and components; V3 adds **bilingual type pairing** and **LTR-native layouts** (direction as runtime, not separate mirrored designs).

## Brand emotion

Unchanged from V2: trust (teal), water (mist), luxury logistics (gold sparingly), speed (≤280ms).

---

## Color

Unchanged. See `@suqya/design-tokens` and `tokens.css`.

- Primary: `#0A6E6E` (light) / `#3DADB0` (dark)
- Accent gold: `#C9A227` — VIP, settled, paid badges only

Contrast verified in **both** AR and EN screenshots (EN often longer strings → test overflow).

---

## Typography — bilingual pairing

| Role | Arabic face | Latin face | Size / LH | Weight |
|------|-------------|------------|-----------|--------|
| Display | IBM Plex Sans Arabic | IBM Plex Sans | 40 / 48 | 700 |
| Title 1 | IBM Plex Sans Arabic | IBM Plex Sans | 28 / 36 | 700 |
| Title 2 | IBM Plex Sans Arabic | IBM Plex Sans | 22 / 30 | 600 |
| Title 3 | IBM Plex Sans Arabic | IBM Plex Sans | 18 / 26 | 600 |
| Body | IBM Plex Sans Arabic | IBM Plex Sans | 16 / 24 | 400–500 |
| Caption | IBM Plex Sans Arabic | IBM Plex Sans | 14 / 20 | 400 |
| Micro | IBM Plex Sans Arabic | IBM Plex Sans | 12 / 16 | 500 |

**Locale switch:** Flutter `ThemeData` sets `fontFamily` from locale — `IBM Plex Sans Arabic` for `ar`, `IBM Plex Sans` for `en`. Do not mix faces in one sentence except proper nouns (brand **Suqya** / **سقيا**).

**Line length:** EN body max ~40ch in sheets; AR ~32ch. Allow +1 line growth before truncating; never clip dynamic type.

**Bilingual labels in admin/supplier:** secondary locale in Caption below primary, not inline parentheses spam.

---

## Spacing, radius, elevation

Unchanged from V2 scale (4–80, radius sm–xl, shadows sm–fab).

**V3 rule:** padding uses logical properties only. Audit V2 screens for physical `paddingLeft` during Sprint B.

---

## Components (catalog)

Same `Sq*` catalog as V2. V3 additions:

| Component | Bilingual notes |
|-----------|-----------------|
| `SqLanguageSegment` | العربية · English; min 48dp; announces locale change |
| `SqLocaleText` | Wraps mixed-direction user content with `dir="auto"` |
| `SqBidiNumber` | Currency/phone with LTR isolate in RTL |
| `SqButton` | Label from l10n; width expands for EN ("Confirm order" vs "تأكيد") |
| `SqSheet` | Drag handle centered; title start-aligned per direction |
| `SqEmpty` / `SqError` | Human copy in active locale only |

---

## Layout — LTR-native (not mirrored Arabic)

V3 rejects designing Arabic RTL and English LTR as two separate Figma files.

| Pattern | Implementation |
|---------|----------------|
| Single component tree | `Directionality.of(context)` / `<html dir={locale}>` |
| Tabs | Order: Home · Track · Account in LTR; same visual order mirrored in RTL via direction |
| FAB / primary CTA | Full-width bottom; text centered |
| Map chrome | Search pill **inline-start**, locate **inline-end** — swaps with direction |
| Tables (admin) | `text-align: start` on cells; numeric columns `tabular-nums` + LTR isolate |
| Icons | Mirror chevrons; do **not** mirror play/send/map compass |

**English is not "RTL flipped":** EN uses natural LTR reading order. AR uses natural RTL. Shared mockups use logical annotations (`start`/`end`), not left/right.

---

## RTL / LTR quick reference

| Element | AR (RTL) | EN (LTR) |
|---------|----------|----------|
| Back chevron | → | ← |
| Sheet enter | from bottom (same) | from bottom |
| Page push | from start edge | from end edge |
| Swipe dismiss | toward start | toward end |
| Tab bar | start = Home in RTL order | start = Home |

See [localization.md](./localization.md) for numbers, dates, search.

---

## Motion

Token durations unchanged (100–600ms). Direction-aware shared-axis transitions — see [motion-a11y.md](./motion-a11y.md).

---

## Accessibility

WCAG AA in both locales. Semantics labels must exist in **active locale** (not AR-only with EN UI).

- Min touch 48×48 (driver primary 64)
- Focus rings on web (`:focus-visible`)
- `prefers-reduced-motion` + Flutter `disableAnimations`

---

## Dark mode

Unchanged. Verify EN strings do not wrap worse in dark compact headers.

---

## Packages

- `@suqya/design-tokens` — colors, type stacks, CSS variables
- `@suqya/i18n` — web string tables, locale hook
- `packages/flutter_core` — `SuqyaTheme`, locale-aware `Sq*`
- `packages/flutter_core/l10n` — generated ARB

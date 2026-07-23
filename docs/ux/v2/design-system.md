# Suqya Design System V2

Arabic-first, RTL-native design system for the premium GCC water logistics platform.

> Replaces V1 Material-template aesthetics. Benchmarks: Careem, Uber, Apple Wallet, Stripe, Linear.

## Brand emotion

| Attribute | Expression |
|-----------|------------|
| Trust | Deep teal primary, calm surfaces, clear status color |
| Water | Soft mist backgrounds, fluid sheet motion |
| Luxury logistics | Gold accent sparingly (premium / VIP only) |
| Speed | Instant skeletons, optimistic UI, ≤280ms transitions |

## Color

See `@suqya/design-tokens` and `tokens.css`.

- **Primary:** `#0A6E6E` (light) / `#3DADB0` (dark)
- **Accent gold:** `#C9A227` — badges, VIP, settlements paid
- Never use purple→indigo AI gradients or cream+terracotta tropes

## Typography

**Arabic (primary):** IBM Plex Sans Arabic  
**Latin (secondary):** IBM Plex Sans

| Role | Size / LH | Weight |
|------|-----------|--------|
| Display | 40 / 48 | 700 |
| Title 1 | 28 / 36 | 700 |
| Title 2 | 22 / 30 | 600 |
| Title 3 | 18 / 26 | 600 |
| Body | 16 / 24 | 400–500 |
| Caption | 14 / 20 | 400 |
| Micro | 12 / 16 | 500 |

Hero brand name must dominate landing/splash; never let a headline overpower سقيا.

## Spacing & radius

Scale: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80  
Radius: sm 8 · md 12 · lg 16 · xl 24 · full pill only for true chips/status

## Elevation

Soft layered shadows (`sm` / `md` / `lg` / `fab`). Prefer border + surface over heavy multi-shadow stacks.

## Components (catalog)

| Component | Notes |
|-----------|-------|
| `SqButton` | Primary / secondary / ghost / danger; min 48dp |
| `SqFAB` | Teal FAB with fab shadow — order CTA |
| `SqSheet` | Bottom sheet, drag handle, RTL-safe padding |
| `SqCard` | Interaction container only when needed |
| `SqChip` | Tank size / filters |
| `SqInput` | Phone-first, large tap |
| `SqMapChrome` | Floating glass controls over map |
| `SqKpi` | Big number + label + delta |
| `SqTimeline` | Order / delivery status |
| `SqSkeleton` | Shimmer, never blank white |
| `SqEmpty` | Illustration + one action |
| `SqError` | Human Arabic copy + retry |
| `SqNavRail` / `SqTabBar` | Progressive disclosure |

## RTL

- Logical properties only (`inline-start/end`)
- Mirror chevrons; keep map compass LTR
- Bottom tabs: Home | Track | Account (RTL visual order)
- Numbers: locale-aware (Arabic-Indic optional via settings)

## Motion

| Token | ms | Use |
|-------|-----|-----|
| instant | 100 | Press feedback |
| fast | 180 | Chip select |
| normal | 280 | Sheet / page |
| slow | 420 | Map camera |
| deliberate | 600 | Success celebration |

Easing: `cubic-bezier(0.2, 0, 0, 1)`. Never bounce-spam.

## Accessibility

- WCAG AA contrast on text/icons
- Min touch 48×48 (driver primary 64)
- Dynamic type support
- Semantics labels in AR + EN
- Focus rings on web (`:focus-visible`)
- Reduce-motion: honor `prefers-reduced-motion`

## Dark mode

Full token set under `[data-theme=dark]`. Default to system preference after user opt-in on mobile settings.

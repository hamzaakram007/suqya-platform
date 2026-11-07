# Phase 16 — Quality gate (Sprint G)

## Scorecard pass

Primary surfaces documented under [`scorecards/`](./scorecards/). Each lists remediations targeting **≥95**. Implementation remediations applied in Phase 16:

| Surface | Key remediations shipped |
|---------|--------------------------|
| Customer Home | Localized strings; order-defaults ≤3-tap; payment chips incl. Apple/Google Pay; smart reorder API |
| Customer Settings | Instant AR/EN switch; `preferredLanguage` PATCH; Directionality flip |
| Customer Help | FAQs from `GET /faqs` (bilingual resolve) |
| Driver Home / Jobs / Earnings | Full ARB coverage; offline banner both locales; language toggle |
| Supplier Today | next-intl; `lang`/`dir` dynamic; Accept-Language |
| Admin Live Ops | next-intl; ops alerts API; locale search |
| Admin/Supplier Settings | Language switcher in chrome |

## WCAG 2.2 AA spot-check (both locales)

- [x] Text contrast: V2 tokens (primary on surface) used for buttons/labels
- [x] Focus order: logical properties (`border-e`, `end-4`) preserve LTR/RTL reading order
- [x] Language: `lang` + `dir` on document root (web); Flutter `Directionality` + `locale`
- [x] Touch targets: driver primary actions remain 64dp
- [x] Error copy: localized empty/error/retry strings on clients + API message catalog
- [x] Motion: web `prefers-reduced-motion` (V2); Flutter should respect `MediaQuery.disableAnimations` for shimmer (see motion-a11y.md)

## Performance

- Skeleton-first loading copy localized (`loading` key)
- Order defaults cached client-side after fetch; persist after successful order
- Optimistic confirm path when defaults complete (1-tap)
- FAQ / catalog list endpoints lightweight; locale resolved in middleware once per request

## Bilingual parity checklist

- [x] Language switch on all four clients without restart
- [x] Driver + web: user-facing strings from catalogs (ARB / next-intl / `@suqya/i18n`)
- [x] FAQ + catalog + notifications localized end-to-end
- [x] Returning customer smart reorder / defaults ≤3 taps
- [x] Admin alerts + search locale-aware
- [x] Invoice document layouts: `ar` | `en` | `bilingual`

## Explicit non-regressions

- V2 design tokens / Sq* / MapShell retained
- No vanity AI chatbot
- Legal PDF machine-translation avoided — template keys only; ops fills approved copy

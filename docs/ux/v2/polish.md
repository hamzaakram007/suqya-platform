# Phase 6 — Polish & modern extras

## Dark mode

- Tokens: `[data-theme=dark]` in `packages/design-tokens/src/tokens.css`
- Flutter: `SuqyaTheme.dark` + `buildSuqyaTheme(brightness: Brightness.dark)`
- User toggle in Account/Settings (system / light / dark)

## Performance

- Skeleton-first on all list/map loads
- Optimistic order confirm (show Track immediately, reconcile API)
- Cache last order defaults locally (secure storage + API when available)
- Paginate orders/earnings
- Map tiles / placeholders — no blocking network for first paint

## Modern extras (shipped as UX-ready)

| Feature | Status |
|---------|--------|
| Apple Pay / Google Pay presentation | Spec + payment method chips on home sheet |
| QR ZATCA invoice | Invoice surface shows QR placeholder + share |
| Biometric unlock | Settings toggle + local_auth hook point |
| Deep links | `/track/:id`, `/orders/:id` routes reserved |
| Home widgets / Live Activities | Specced in motion/journeys — implement post-MVP |
| Voice order | Deferred; mic affordance hidden behind feature flag |

## Reduce motion CSS

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

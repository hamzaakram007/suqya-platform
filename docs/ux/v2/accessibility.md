# Accessibility V2 — WCAG AA

## Requirements

| Area | Standard |
|------|----------|
| Contrast | Text ≥ 4.5:1, large text ≥ 3:1 |
| Touch | ≥ 48×48 dp (driver primary 64) |
| Focus | Visible `:focus-visible` rings on web |
| Motion | Honor `prefers-reduced-motion` |
| Screen readers | Semantics / aria-labels AR+EN |
| Dynamic type | Flutter text scales; web rem-based type |

## Flutter checklist

- [ ] All `SqButton` / list tiles have Semantics labels
- [ ] Map controls labeled (تكبير، موقعي، الطبقات)
- [ ] OTP fields announce digit position
- [ ] Errors linked via `Semantics(liveRegion: true)`
- [ ] Reduce motion: disable skeleton shimmer when MediaQuery.disableAnimations

## Web checklist

- [ ] Skip-to-content link on admin/supplier shells
- [ ] Icon-only buttons have `aria-label`
- [ ] Tables (when used) have captions / scope
- [ ] Dark mode maintains AA contrast (tokens verified)

## Spot-check flows

1. Customer 3-tap order with TalkBack  
2. Driver accept offer with large targets  
3. Admin Live Ops keyboard-only nav  

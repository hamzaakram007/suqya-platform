# Motion Design V2

## Principles

1. Motion explains state change — never decoration alone  
2. 2–3 intentional motions per primary journey  
3. Honor `prefers-reduced-motion`  
4. Map camera moves slower than UI chrome  

## Shared transitions

| Event | Spec |
|-------|------|
| Page push | Shared-axis horizontal (RTL: reverse), 280ms |
| Sheet present | Slide up + fade scrim, 280ms emphasize |
| Sheet dismiss | Exit ease, 180ms |
| Chip select | Scale 0.98→1 + border, 180ms |
| Order confirmed | Checkmark draw + haptic, 420ms |
| Driver assigned | Marker pulse ×2, 600ms |
| Arriving | ETA badge glow once |
| Delivered | Confetti-free: success banner slide |
| Payment success | Wallet icon morph |
| Job offer | Sheet + countdown ring |

## Flutter

Use `AnimatedSwitcher`, `Hero` for order→track, `AnimationController` for countdown.

## Web

CSS `transition` on transform/opacity only; Framer-like spring only for FAB.

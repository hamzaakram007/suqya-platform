# Customer — Splash

**Surface:** Launch / brand moment  
**Platform:** Flutter (iOS · Android)  
**IA:** Pre-auth gate → Auth or Map Home

---

## 1. UX rationale

Splash is the only surface where the brand name **سقيا** is allowed to dominate without a competing headline. It establishes trust (deep teal), water calm (soft mist), and speed (≤1.2s total, then navigate). Returning users should feel “I’m home”; first-time users should feel premium logistics, not a utility form. No marketing copy, no feature list, no version clutter in the first viewport.

---

## 2. User journey / entry points

| Entry | Condition | Exit |
|-------|-----------|------|
| Cold start | App icon tap | Auth if no session; Map Home if valid JWT + biometrics skip optional |
| Warm start from kill | Process recreate | Same routing; splash may shorten to logo only (≤400ms) |
| Deep link while logged out | Push / invoice / track URL | Splash → Auth → resume deep link |
| Force update required | Remote config min version | Splash → blocking update sheet (not a separate screen) |

**Flow:** Launch → token check (parallel with brand hold) → route.

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│                             │
│                             │
│         [ water mist ]      │
│                             │
│            سقيا             │  ← Display 40/48 Bold, brand-dominant
│                             │
│        ○ thin ring          │  ← optional indeterminate, teal
│                             │
│                             │
│                             │
└─────────────────────────────┘
```

- Full-bleed teal gradient plane (`#0A6E6E` → deeper `#085858`), subtle radial mist highlight center-top.
- Centered wordmark only. No tagline in V2 splash.
- Optional micro progress ring below logo after 600ms if routing still pending (never show spinner before then).

---

## 4. Visual specification

| Token | Value |
|-------|-------|
| Background | Gradient `#0A6E6E` → `#064F4F`, soft white mist opacity 0.08 |
| Brand type | IBM Plex Sans Arabic Display 40/48 weight 700, color `#FFFFFF` |
| Accent | Gold `#C9A227` **not used** on splash (reserved for VIP/settlements) |
| Spacing | Logo vertically centered; ring 24dp below baseline |
| Safe areas | Respect notch; content stays in center 60% of height |

---

## 5. Component hierarchy

```
SplashScreen
├── SqMistBackground
├── SqBrandMark (سقيا)
└── SqProgressRing? (delayed)
```

No buttons, no sheets, no toast.

---

## 6. Responsive behavior

| Device | Behavior |
|--------|----------|
| Phone portrait | Default composition |
| Phone landscape | Keep logo centered; mist fills width |
| Tablet | Cap logo optical size; do not stretch mist artifacts |
| Fold unfold | Re-center; no layout jump of brand |

---

## 7. RTL behavior

- Arabic is default; wordmark is Arabic — no mirroring needed.
- If locale EN temporarily: still show سقيا (brand invariant); do not swap to Latin “Suqya” on splash.
- Progress ring remains LTR geometric (no mirror).

---

## 8. Accessibility notes

- Announce once: “سقيا، جاري التحميل” / “Suqya, loading” then silence.
- Min contrast: white on teal exceeds AA.
- `prefers-reduced-motion`: static teal fill, instant fade of logo at 0ms hold.
- Do not trap focus; splash is non-interactive.

---

## 9. Animation specification

| Phase | Spec |
|-------|------|
| Enter | Logo opacity 0→1, 280ms, ease `cubic-bezier(0.2, 0, 0, 1)` |
| Hold | Brand hold 400–800ms while auth resolves |
| Exit | Crossfade to next screen 280ms shared-axis |
| Reduced motion | Opacity cut only |

No bounce, no water ripple spam, no confetti.

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Brand hold + delayed ring |
| Empty | N/A |
| Offline at launch | Proceed to Map Home if cached session; else Auth with offline banner after |
| Token expired | Soft route to Auth; no error dialog on splash |
| Crash loop | After 3 failed boots in 60s, show `SqError` overlay with “إعادة المحاولة” on splash plane |
| Maintenance mode | Full-screen message with support link; brand still visible top |

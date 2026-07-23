# Motion & Accessibility V3 — Bilingual

Links V2 foundations and adds RTL↔LTR transition rules plus bilingual a11y requirements.

**References**

- [V2 motion](../v2/motion.md) — principles, shared transitions, Flutter/Web notes
- [V2 accessibility](../v2/accessibility.md) — WCAG AA checklist, Flutter/Web spot-checks

---

## Motion principles (unchanged)

1. Motion explains state change — not decoration alone
2. 2–3 intentional motions per primary journey
3. Honor `prefers-reduced-motion`
4. Map camera slower than UI chrome

---

## Direction-aware transitions

| Event | LTR (EN) | RTL (AR) | Duration |
|-------|----------|----------|----------|
| Page push | Enter from end, exit to start | Enter from start, exit to end | 280ms |
| Back pop | Reverse of push | Reverse of push | 280ms |
| Sheet present | Slide up + fade scrim | Same (vertical is direction-agnostic) | 280ms |
| Sheet dismiss | Exit down 180ms | Same | 180ms |
| Tab switch | Fade + slight horizontal toward selected tab | Mirror horizontal | 180ms |
| Language switch | Cross-fade layout 280ms; **no** horizontal push (avoids disorientation) | Same | 280ms |
| Chip select | Scale 0.98→1 | Same | 180ms |
| Order confirmed | Checkmark draw + haptic | Same | 420ms |
| Driver assigned | Marker pulse ×2 | Same | 600ms |

**Language switch rule:** On locale change, use `AnimatedSwitcher` / CSS opacity cross-fade on shell root. Do **not** play shared-axis push — user did not navigate deeper.

**Flutter:** `PageTransitionsTheme` with `CupertinoPageTransitionsBuilder` replaced by custom builder reading `Directionality`. Hero flights disabled during locale rebuild.

**Web:** `transition: transform 280ms` on slide panels uses `translateX(100%)` vs `translateX(-100%)` via `[dir=rtl]` selector.

---

## RTL ↔ LTR live switch

| Concern | Rule |
|---------|------|
| In-flight page transition | Cancel; snap to destination |
| Open bottom sheet | Preserve sheet; update strings in place |
| Map camera | No re-animate; only chrome mirrors |
| Focus | Move focus to language control after switch announcement |
| Scroll position | Preserve vertical scroll offset |
| Countdown (job offer) | Timer continues; ring direction not mirrored |

---

## Reduced motion

### Web

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- Keep opacity cross-fades or cut entirely per component policy
- Skeleton shimmer off
- Map camera: jump cut allowed

### Flutter

```dart
final reduceMotion = MediaQuery.disableAnimationsOf(context)
    || MediaQuery.of(context).accessibleNavigation;
```

- Disable skeleton shimmer when `reduceMotion`
- `AnimationController` duration → `Duration.zero`
- Haptics optional off when reduce motion (platform setting)
- Language switch: instant layout swap if `reduceMotion`; else 280ms fade

**Test matrix:** AR + EN × reduce motion on/off for J1 and J2.

---

## Accessibility — bilingual extensions

Extends [V2 accessibility](../v2/accessibility.md).

| Area | V3 requirement |
|------|----------------|
| Semantics | Labels in **active locale** only |
| Language change | Announce: "Language changed to English" / "تم تغيير اللغة إلى العربية" |
| Live regions | Localized template strings |
| FAQ expand | `aria-expanded` + localized question text |
| Error links | `aria-describedby` in active locale |
| Skip link | EN: "Skip to content" / AR: "تخطي إلى المحتوى" |
| Focus order | Follows visual `start→end` in both directions |
| Color | Status not color-only; icon + text in both languages |

### Flutter checklist (additions)

- [x] `LocaleProvider` rebuild triggers locale + Directionality (announce optional polish)
- [x] `MaterialApp.locale` + `localizationsDelegates` complete (customer + driver)
- [x] `SqSkeleton` respects `MediaQuery.disableAnimations` (static fill)
- [ ] TalkBack reading order matches visual RTL/LTR (device QA)
- [ ] OTP fields: "Digit 2 of 4" / "الرقم ٢ من ٤" (follow-up)

### Web checklist (additions)

- [x] `<html lang="ar|en" dir="rtl|ltr">` updated on switch
- [x] Language toggle in chrome (admin + supplier)
- [x] Admin critical rail includes locale-aware ops alerts
- [ ] Keyboard order in RTL matches visual (device QA)

---

## Spot-check flows (V3)

1. Customer 3-tap order — TalkBack AR, VoiceOver EN
2. Driver accept offer — large targets; countdown announced in locale
3. Admin Live Ops — keyboard-only, RTL rail
4. **Language switch** from Settings — no focus trap, no motion sickness
5. Supplier Today — Accept with screen reader EN

---

## Benchmark alignment

| Standard | V3 bilingual gate |
|----------|-----------------|
| Apple HIG | Respect Reduce Motion; localized accessibility labels |
| Material Design 3 | Motion schemes; expressive disabled when reduced |
| Nielsen | Visibility of system status in user's language |
| WCAG 2.2 AA | 3.2.6 Consistent Help; 3.1.2 Language of Parts for mixed content |

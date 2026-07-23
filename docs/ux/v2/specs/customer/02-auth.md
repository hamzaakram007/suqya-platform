# Customer — Auth (Phone + OTP)

**Surface:** Identity gate  
**Platform:** Flutter  
**IA:** Splash → Auth → Map Home (or deep-link resume)

---

## 1. UX rationale

Auth must feel as fast as Careem: phone-first, large taps, Arabic default, minimal fields. Trust comes from calm teal surfaces and clear OTP timing—not security theater copy. OTP is a continuation of the same sheet family, not a jarring second app. Returning users with biometrics skip OTP when policy allows.

---

## 2. User journey / entry points

| Entry | Path |
|-------|------|
| First install | Splash → phone → OTP → optional pin drop on Map Home |
| Session expired | Any protected route → Auth → return to intended screen |
| Logout | Account → logout → Auth |
| Change number | Settings → re-auth flow |
| Biometric fail ×3 | Fall back to OTP |

**J1 prerequisite:** Auth completes before 3-tap order.

---

## 3. Wireframe description

**Phone step**
```
┌─────────────────────────────┐
│  سقيا                       │  ← Title 2, not Display (brand quiet)
│  أدخل رقم جوالك             │  ← Title 3
│  سنرسل رمز التحقق           │  ← Body caption
│                             │
│  ┌─────────────────────┐    │
│  │ 🇸🇦 +966  5X XXX XXXX │    │  ← SqInput phone
│  └─────────────────────┘    │
│                             │
│  [ متابعة ]                 │  ← SqButton primary full-width
│                             │
│  الشروط · الخصوصية          │  ← Caption links
└─────────────────────────────┘
```

**OTP step**
```
┌─────────────────────────────┐
│  ←                           │
│  رمز التحقق                 │
│  أرسل إلى +9665XXXXXXX      │
│                             │
│   ○ ○ ○ ○ ○ ○               │  ← 6 cells, autofocus
│                             │
│  إعادة الإرسال خلال 0:45    │
│  [ تأكيد ]                  │
└─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Surface | `#F7FAFA` mist; cards none — flat form on soft background |
| Primary CTA | `#0A6E6E` fill, white label, radius md 12, height 52 |
| Type | IBM Plex Sans Arabic; Title 2 for screen title; Body 16 for helper |
| Gold | Unused |
| Spacing | 24 horizontal padding; 16 between field and CTA; 48 top after status bar |
| Country chip | Inline-start of input; flag +966 fixed for KSA MVP |

---

## 5. Component hierarchy

```
AuthFlow
├── PhoneStep
│   ├── SqBrandQuiet
│   ├── SqInput (phone)
│   ├── SqButton (متابعة)
│   └── LegalLinks
└── OtpStep
    ├── SqBack
    ├── SqOtpBoxes (6)
    ├── ResendTimer
    └── SqButton (تأكيد)
```

Optional: `BiometricPrompt` overlay after OTP success for enroll.

---

## 6. Responsive behavior

- Keyboard open: scroll title up; CTA pinned above keyboard.
- Landscape phone: two-column only if width ≥720; prefer portrait lock for OTP.
- Tablet: form max-width 420 centered; mist still full-bleed.

---

## 7. RTL behavior

- Labels and helpers RTL; phone digits LTR inside input (`dir=ltr` on field).
- Back chevron mirrors (→ becomes ← visual per RTL).
- OTP boxes fill start→end in reading direction but digits remain Western Arabic numerals by default.
- Legal links: inline-end stack on small screens.

---

## 8. Accessibility notes

- Inputs labeled: “رقم الجوال”, “رمز التحقق خانة ن”.
- Announce SMS autofill when pasted.
- Touch targets ≥48×48; OTP cells ≥48.
- Errors announced via live region: “الرمز غير صحيح”.
- Contrast AA on teal button and dark text `#0F1C1C` on mist.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Phone → OTP | Shared-axis horizontal RTL reverse, 280ms |
| OTP digit entry | Scale 0.96→1 per cell, 100ms instant |
| Success | Soft check in button, haptic light, then navigate 280ms |
| Error shake | TranslateX ±4dp ×2, 180ms; reduced-motion: border red only |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Sending OTP | CTA loading spinner; disable input |
| Verifying | OTP cells locked; button loading |
| Wrong OTP | `SqError` inline under boxes; remaining attempts |
| Rate limit | Disable resend; show wait message |
| SMS delayed | After 60s: “لم يصلك الرمز؟ تواصل مع الدعم” |
| Invalid SA number | Inline validation before submit |
| Network fail | Toast + retry; keep number filled |
| Account banned | Full `SqError` with support CTA, no retry loop |

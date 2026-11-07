# Driver — Auth

**Surface:** Driver identity gate  
**Platform:** Flutter (Driver app)  
**IA:** Splash-equivalent → Auth → Online Map

---

## 1. UX rationale

Driver auth is phone/OTP like customer, but tone is operational: large targets (64dp primary), one-handed friendly, Arabic-first. Trust teal; no gold. Fast return-to-road—biometrics after first OTP for glove-friendly reentry.

---

## 2. User journey / entry points

| Entry | Path |
|-------|------|
| Install / logout | Phone → OTP → docs gate if incomplete → Online Map |
| Session expiry | Mid-job: soft re-auth preserving active job context |
| Supplier-created account | First login same OTP |
| Biometric | Optional unlock → Map |

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ سقيا سائق                   │
│ أدخل رقم الجوال             │
│ ┌─────────────────────┐     │
│ │ +966 5X …           │     │
│ └─────────────────────┘     │
│ [ متابعة ]  ← height 56–64  │
│                             │
│ OTP: ○○○○○○                 │
│ [ تأكيد ]                   │
└─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Background | Mist `#F7FAFA`; header teal strip optional |
| CTA | `#0A6E6E`, min height 56 (prefer 64 for primary) |
| Type | IBM Plex Sans Arabic Title 2/3 |
| Gold | Unused |
| Spacing | 24 horizontal; large vertical rhythm for thumb zone |

---

## 5. Component hierarchy

```
DriverAuthFlow
├── PhoneStep
├── OtpStep
└── DocsIncompleteGate? → Profile Docs
```

---

## 6. Responsive behavior

- Portrait preferred; landscape keeps CTA in thumb reach bottom.
- Tablet: centered form 420 width.

---

## 7. RTL behavior

- RTL chrome; phone/OTP digits LTR fields.
- Chevrons mirrored.

---

## 8. Accessibility notes

- 64dp primary targets.
- VoiceOver labels AR+EN.
- High contrast outdoor mode optional (increase pin/button edge).

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Step change | Shared-axis 280ms |
| Success | Haptic + navigate 280ms |
| Error | Shake 180ms or border-only if reduced motion |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| OTP send/verify loading | CTA spinner |
| Not a driver account | Clear Arabic: contact supplier |
| Suspended | Blocking SqError + support number |
| Offline | Queue not allowed; show offline auth message |
| Docs missing | After OTP route to Profile Docs before Online |

# Customer — Addresses

**Surface:** Saved delivery locations  
**Platform:** Flutter  
**IA:** Account → العناوين · Map Home address row

---

## 1. UX rationale

Addresses power the 3-tap order. Map-picker first; National Address / short code supported for KSA. Default star is obvious. Editing never feels like a form warehouse—map + one sheet.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Account | العناوين |
| Map Home | Edit address chevron |
| First-time coach | Save after pin drop |
| Checkout edge | “أضف عنواناً” |

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ العناوين           [+]      │
│ ┌─────────────────────────┐ │
│ │ ★ المنزل · النرجس       │ │
│ │ وصف مختصر               │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ العمل · …               │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘

Add/Edit sheet:
┌─────────────────────────────┐
│ MAP picker full             │
│ اسم العنوان                 │
│ تفاصيل إضافية               │
│ رمز وطني (اختياري)          │
│ [حفظ] [تعيين كافتراضي]      │
└─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| List cards | Radius lg 16; default star teal |
| Map picker | Full-bleed under glass chrome |
| Inputs | SqInput large; 48 height |
| CTA | Teal primary |
| Type | IBM Plex Sans Arabic Title 3 labels |
| Spacing | 16 list; sheet 20 |

---

## 5. Component hierarchy

```
AddressesScreen
├── AddressList
│   └── AddressCard (default badge, edit, delete)
├── SqFAB / [+] Add
└── AddressEditor (sheet or full)
    ├── SqMap picker
    ├── SqInput fields
    └── Save / SetDefault
```

---

## 6. Responsive behavior

- Phone: list → full-screen editor.
- Tablet: list start; map editor end pane.

---

## 7. RTL behavior

- List RTL; map geographic LTR.
- Short address codes LTR monospace-friendly.
- Default star inline-start.

---

## 8. Accessibility notes

- Default announced “العنوان الافتراضي”.
- Delete confirms with explicit Arabic.
- Map pin instructions for VoiceOver drag alternatives (lat/lng search field).

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Open editor | Sheet 280ms |
| Pin move | Camera slow 420ms |
| Save success | Check 180ms + dismiss |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton list |
| Empty | SqEmpty + map CTA “أضف عنوانك” |
| Geocode fail | Inline error; keep pin |
| Out of zone | Warning on save |
| Delete default | Force choose new default first |
| Max addresses | Cap message |

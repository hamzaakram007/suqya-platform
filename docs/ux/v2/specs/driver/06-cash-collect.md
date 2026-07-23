# Driver — Cash Collect

**Surface:** COD confirmation  
**Platform:** Flutter  
**IA:** After POD when payment method = cash

---

## 1. UX rationale

Cash collect is stressful—show amount huge, confirm received, optional change helper. One primary: **تم التحصيل**. Prevents under-report disputes. Calm teal, not alarming red unless mismatch.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| POD complete + COD | Auto-route |
| Resume unpaid COD | Banner on Online Map |

Exit → Online Map; earnings update.

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ تحصيل نقدي                  │
│                             │
│        ١٨٠ ر.س              │  ← Display 40
│     المطلوب من العميل       │
│                             │
│ المبلغ المستلم [____]       │
│ الباقي: ٠                   │
│                             │
│ [ تم التحصيل ]              │
│ [ مشكلة في التحصيل ]        │
└─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Amount | Display 40/48 Bold; color `#0F1C1C` |
| CTA | Teal 64h |
| Problem | Ghost danger |
| Type | IBM Plex Sans Arabic |
| Gold | Unused (cash ≠ VIP gold) |
| Spacing | Generous 32 vertical around amount |

---

## 5. Component hierarchy

```
CashCollectScreen
├── AmountHero
├── ReceivedInput
├── ChangeHint
├── SqButton Collected
└── ProblemAction → Support note
```

---

## 6. Responsive behavior

- Phone: centered hero.
- Tablet: constrained width 400.

---

## 7. RTL behavior

- Labels RTL; numeric keypad LTR.
- Currency suffix/prefix per locale.

---

## 8. Accessibility notes

- Amount announced on focus.
- Mismatch (received < due) confirm dialog.
- Large targets for outdoor use.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Success | Payment-style morph 420ms |
| Open | Fade 280ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Submit loading | Lock CTA |
| Partial pay | Confirm + flag for admin |
| Customer cannot pay | Problem flow → dispute ticket |
| Offline | Queue collection event |
| Already collected | Idempotent success → Online |

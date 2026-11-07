# Admin — Exceptions

**Surface:** Stuck / failed / SLA queue  
**Platform:** Next.js  
**IA:** Live Ops sibling — Exceptions

---

## 1. UX rationale

Exceptions is the intervention queue: stuck dispatch, payment fail, driver no-show, SLA breach. One job—triage and act (reassign, call, compensate). Arabic urgency labels; teal actions; red severity.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Nav Exceptions | Full queue |
| Live Ops red pin | Prefill exception |
| Alert webhook | Deep link row |

Journey J4: see stuck → reassign / call.

---

## 3. Wireframe description

```
┌────────────────────────────────────────────┐
│ الاستثناءات  [خطورة] [نوع] [بحث]           │
│ ● حرج · تأخر تعيين · طلب #٢٨٤١  [إعادة تعيين]│
│ ● عالي · فشل دفع · …                        │
│ تفاصيل + جدول زمني + إجراءات                │
└────────────────────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Severity | Critical red; high amber; med muted |
| Primary action | Teal button |
| Type | IBM Plex Sans Arabic Title 3 |
| Row height | ≥56 |
| Gold | Unused |
| Spacing | 12 list gap |

---

## 5. Component hierarchy

```
ExceptionsPage
├── Filters
├── ExceptionList
└── ExceptionDetail
    ├── SqTimeline
    ├── ReassignControl
    ├── CallActions
    └── ResolveNotes
```

---

## 6. Responsive behavior

- Desktop: list | detail split.
- Mobile: list → detail push.

---

## 7. RTL behavior

- Split RTL; actions logical.
- IDs LTR.

---

## 8. Accessibility notes

- Severity text + icon.
- Resolve requires confirm for destructive.
- Keyboard triage (j/k optional later).

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Resolve remove | Fade 180ms |
| Reassign success | Check 280ms |
| New item | Insert 280ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton rows |
| Empty | Calm success empty |
| Action fail | Keep open + error |
| Already resolved race | Refresh notice |
| Bulk select | Progressive; confirm |

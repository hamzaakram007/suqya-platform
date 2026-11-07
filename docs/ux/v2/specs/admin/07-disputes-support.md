# Admin — Disputes & Support

**Surface:** Ops queue for disputes + tickets  
**Platform:** Next.js  
**IA:** Manage / Support ops

---

## 1. UX rationale

Unified queue: customer tickets + payment/delivery disputes. Triage like Exceptions but conversational. Arabic thread; teal reply; link to order/map. Careem support density without clutter.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Nav Disputes/Support | Queue |
| Order drawer “نزاع” | Prefill |
| Customer ticket escalate | Land here |

---

## 3. Wireframe description

```
┌──────────────┬─────────────────────────────┐
│ قائمة التذاكر│ خيط المحادثة                │
│ مفتوح/مغلق   │ سياق الطلب · إجراءات        │
│ أولوية       │ [رد] [تعويض] [إغلاق]        │
└──────────────┴─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Priority | Red/amber/muted |
| Reply CTA | Teal |
| Compensation | Secondary + confirm |
| Type | IBM Plex Sans Arabic |
| Gold | Unused |
| Spacing | Thread 12; pad 16 |

---

## 5. Component hierarchy

```
DisputesSupportPage
├── TicketList
├── ThreadView
├── OrderContextCard
└── ActionBar (reply, compensate, close)
```

---

## 6. Responsive behavior

- Desktop split.
- Mobile list → thread.

---

## 7. RTL behavior

- Thread RTL bubbles; timestamps Caption.
- Attachments logical.

---

## 8. Accessibility notes

- New message live region (throttled).
- Compensation confirm amount spoken.
- Close reason required.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Send | Bubble 180ms |
| Close | Fade list item 180ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeletons |
| Empty queue | Calm empty |
| Send fail | Keep draft |
| Merged tickets | Show link |
| SLA breach | Amber header |

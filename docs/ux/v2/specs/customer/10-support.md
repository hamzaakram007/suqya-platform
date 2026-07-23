# Customer — Support

**Surface:** Help center + tickets  
**Platform:** Flutter  
**IA:** Account → الدعم · Order Detail · out-of-zone CTAs

---

## 1. UX rationale

Support reduces call-center load: searchable Arabic FAQ first, then ticket with order context. Tone is calm and human—never blamey. One primary action per state (browse → create → track ticket).

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Account | الدعم |
| Order Detail | الدعم (orderId attached) |
| Live Track issue | “مشكلة في الطلب” |
| Empty/error CTAs | Deep link FAQ topic |

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ الدعم                       │
│ [بحث في الأسئلة…]           │
│                             │
│ أسئلة شائعة                 │
│ › كيف أطلب وايت؟            │
│ › الدفع والمحفظة            │
│ › الإلغاء والاسترجاع        │
│                             │
│ تذاكري                      │
│ ┌ مفتوح · تأخر التوصيل ┐    │
│                             │
│ [إنشاء تذكرة]               │
└─────────────────────────────┘
```

Create ticket sheet: topic chips, order picker, description, photo optional.

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Search | SqInput; teal cursor |
| FAQ rows | Divider list; Title 3 |
| Ticket status chips | Open teal; closed muted |
| CTA | Teal primary |
| Type | IBM Plex Sans Arabic |
| Spacing | 16/20 |

---

## 5. Component hierarchy

```
SupportScreen
├── SearchField
├── FaqSection
├── TicketsSection
├── SqButton CreateTicket
└── TicketComposerSheet
    ├── TopicChips
    ├── OrderPicker
    ├── Description
    └── Attachments
```

---

## 6. Responsive behavior

- Phone: stacked.
- Tablet: FAQ start; ticket thread end.

---

## 7. RTL behavior

- Full RTL; attachments grid logical.
- Ticket IDs LTR.

---

## 8. Accessibility notes

- FAQ expand/collapse announced.
- Composer fields labeled; image add has alt flow.
- Status not color-only.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| FAQ expand | Height 280ms |
| Ticket sent | Success banner 420ms |
| Sheet | 280ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| FAQ loading | Skeleton rows |
| No tickets | Caption only; CTA still visible |
| Submit fail | Keep draft + retry |
| Attachment too large | Inline error |
| Outside hours | Bot note + SLA time |

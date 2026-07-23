# Customer — Help / Support (Bilingual)

**Surface:** Account → Support  
**Platform:** Flutter  
**IA:** [V3 IA](../../ia.md)  
**V2 reference:** [Support V2](../../v2/specs/customer/10-support.md)  
**Scorecard:** [customer-help](../../scorecards/customer-help.md)

---

## Business impact

Localized FAQ and tickets deflect call-center volume. Bilingual search ensures EN users find answers without filing duplicate tickets. Order-context tickets reduce average handle time for ops.

---

## UX rationale

Search-first FAQ from API (`localizeFaq`). Tickets list shows status in active locale. Create-ticket flow attaches `orderId` when entered from order/track.

---

## Wireframe

```
┌─────────────────────────────┐
│ Support / الدعم             │
│ [Search FAQs…]              │
│ FAQ                         │
│ › How do I order?           │
│ › Payment & wallet          │
│ My tickets                  │
│ ┌ Open · Delayed delivery   │
│ [ Create ticket ]           │
└─────────────────────────────┘
```

---

## Component hierarchy

```
SupportScreen
├── SearchField (bilingual index)
├── FaqSection (localizeFaq)
├── TicketsSection
├── SqButton CreateTicket
└── TicketComposerSheet
```

---

## LTR behavior (EN)

- FAQ questions in English from `questionEn`
- Search scans EN first; AR hit shows badge **Arabic result**
- Ticket IDs LTR; timestamps `en-SA`
- Topic chips: Delivery / Payment / Account / Other
- AI suggest (if enabled): English only per [localization.md](../../localization.md)

---

## RTL behavior (AR)

- FAQ from `questionAr` / `answerAr`
- Search fallback badge **نتيجة بالعربية** when EN match
- Topic chips: التوصيل / الدفع / الحساب / أخرى
- Attachments grid flows **start** → **end**

---

## Search algorithm

1. Query active locale fields (weight 1.0)
2. Query other locale (weight 0.6)
3. Rank by score; max 20 results
4. Mixed hit shows primary locale + badge

---

## Create ticket

| Field | EN | AR |
|-------|----|----|
| Topic | Required chip | Required chip |
| Order | Optional picker | Optional picker |
| Description | Min 20 chars | Min 20 chars |
| Submit | Create ticket | إنشاء تذكرة |

User-generated description: `dir="auto"` display in admin.

---

## Accessibility

- FAQ: expandable; `aria-expanded` / Semantics
- Status: icon + text (not color-only)
- Composer: labeled fields in locale

---

## API

- `GET /faq?locale=`
- `POST /support/tickets` with `Accept-Language`
- Errors bilingual via `api-messages`

---

## Business metrics

FAQ search zero-result rate by locale; ticket volume delta post EN launch.

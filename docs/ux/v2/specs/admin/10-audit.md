# Admin — Audit Log

**Surface:** Immutable audit trail  
**Platform:** Next.js  
**IA:** Manage → التدقيق

---

## 1. UX rationale

Immutable, searchable log of admin/supplier interventions. Trust surface—dense but scannable Arabic summaries, actor, target, timestamp. No edit; export only. Visual quiet; teal links to entities.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Manage → Audit | Default |
| After intervene | “عرض في التدقيق” |
| Compliance export | Filtered range |

---

## 3. Wireframe description

```
┌────────────────────────────────────────────┐
│ سجل التدقيق  بحث · فاعل · نوع · من/إلى     │
│ زمن · فاعل · إجراء · كيان · ملخص           │
│ صف → JSON/تفاصيل للقراءة فقط               │
└────────────────────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Rows | Mono timestamps optional Caption |
| Entity links | Teal text buttons |
| Type | IBM Plex Sans Arabic; micro for ids |
| Gold | Unused |
| Background | Slightly denser; still mist not cream |
| Spacing | Compact 8–12 |

---

## 5. Component hierarchy

```
AuditPage
├── FilterBar
├── AuditTable
├── AuditDetailDrawer (read-only)
└── ExportButton
```

---

## 6. Responsive behavior

- Desktop table.
- Mobile: stacked events cards.

---

## 7. RTL behavior

- RTL summaries; ISO timestamps LTR.
- JSON `dir=ltr`.

---

## 8. Accessibility notes

- Read-only announced.
- Detail drawer focus trap.
- Export progress.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Drawer | 280ms |
| Filter | List replace 180ms |
| No playful motion |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton |
| Empty filters | Broaden query |
| Huge result | Cursor pagination |
| Export timeout | Async email note |
| PII redaction | Masked fields labeled |

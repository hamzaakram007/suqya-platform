# Admin — Orders Monitor

**Surface:** Cross-tenant order monitor + intervene  
**Platform:** Next.js  
**IA:** Manage / Orders

---

## 1. UX rationale

Orders monitor is denser than customer history but still humane: filters, status, tenant, intervene actions. Tables allowed behind Manage. Arabic headers; teal row actions.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Manage → Orders | Default |
| Exceptions “عرض الطلب” | Focus row |
| Search global | Order id |

---

## 3. Wireframe description

```
┌────────────────────────────────────────────┐
│ الطلبات  فلاتر: حالة · مستأجر · مدينة      │
│ جدول: # · العميل · المورد · الحالة · مبلغ  │
│ صف → درج تفاصيل + تدخل                     │
└────────────────────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Table | Row 52; sticky header |
| Status chips | Teal/success/danger |
| Intervene | Teal buttons in drawer |
| Type | IBM Plex Sans Arabic |
| Gold | Unused |
| Spacing | Toolbar 16 |

---

## 5. Component hierarchy

```
AdminOrdersPage
├── FilterBar
├── OrdersTable
└── OrderInterveneDrawer
    ├── SqTimeline
    ├── ForceStatus / Reassign
    └── AuditNote required
```

---

## 6. Responsive behavior

- Desktop: full table.
- Tablet: horizontal scroll.
- Mobile: card list (degraded).

---

## 7. RTL behavior

- Table RTL headers; numeric cols LTR.
- Drawer inline-end.

---

## 8. Accessibility notes

- Sortable columns announced.
- Intervene confirms + reason field required.
- Focus trap in drawer.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Drawer | 280ms |
| Status change | Chip crossfade 180ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Table skeleton |
| Empty filters | Adjust filters CTA |
| Intervene fail | Error + rollback UI |
| Multi-tenant leak guard | Hard filter by ACL |
| Export | Async job toast |

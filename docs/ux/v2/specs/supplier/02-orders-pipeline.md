# Supplier — Orders Pipeline

**Surface:** Order timeline / kanban-style pipeline  
**Platform:** Next.js  
**IA:** Nav الطلبات

---

## 1. UX rationale

Pipeline shows flow New → Accepted → Dispatched → Delivering → Done. Arabic columns, card density for ops speed, map peek on hover/select. One job—move orders forward and spot stuck ones.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Nav Orders | Default pipeline |
| Today accept | Lands focused on Accepted |
| Search order id | Highlight card |
| Exception deep link | Open stuck card |

---

## 3. Wireframe description

```
┌────────────────────────────────────────────┐
│ الطلبات  [بحث] [فلتر]                      │
│ جديد │ مقبول │ موزّع │ توصيل │ مكتمل       │
│ card   card   card   card   card           │
│ card          card                         │
└────────────────────────────────────────────┘
```

Detail drawer: customer, tank, assign driver, timeline.

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Columns | Header Title 3; count chip |
| Cards | Radius md 12; status border-start 3px teal/amber |
| Drawer | Width 400; sheet on mobile |
| Type | IBM Plex Sans Arabic |
| Gold | Unused in pipeline |
| Spacing | Column gap 12; card pad 12 |

---

## 5. Component hierarchy

```
OrdersPipelinePage
├── Toolbar (search, filters)
├── PipelineBoard
│   └── Column[] → OrderCard[]
└── OrderDetailDrawer
    ├── AssignDriver
    ├── SqTimeline
    └── Actions
```

---

## 6. Responsive behavior

- Desktop: horizontal board scroll.
- Tablet: fewer columns + horizontal scroll snap.
- Mobile: vertical status sections or single column with filter chips.

---

## 7. RTL behavior

- Columns order RTL (New at inline-start).
- Drawer from inline-end.
- IDs/numbers LTR.

---

## 8. Accessibility notes

- Board as regions per column.
- Drag-drop has keyboard alternative (status menu).
- Live announce on status change.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Card move | 280ms transform |
| Drawer | 280ms |
| Stuck pulse | Amber border breathe once / 10s |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton columns |
| Empty column | Quiet dash |
| Assign fail | Toast + keep previous |
| Cancelled | Move to Done with cancel tag |
| SLA breach | Amber/red card priority sort |

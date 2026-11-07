# Customer — Orders (History)

**Surface:** Order history list  
**Platform:** Flutter  
**IA:** Account → طلباتي · optional from Track empty

---

## 1. UX rationale

History is card-based (not tables): glance status, tank size, address, amount—then deep-link to detail or reorder. Arabic-first scanning with strong status color + label. Speed: skeletons instantly, pull-to-refresh, “اطلب مرة أخرى” as the primary secondary action.

---

## 2. User journey / entry points

| Entry | Path |
|-------|------|
| Account hub | طلباتي |
| Post-delivery | Banner “عرض الطلب” |
| Support context | “اختر طلباً” picker embeds this list |
| Search from Account | Filter by date/status |

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ طلباتي              [فلتر]  │
│ [الكل] [جاري] [مكتمل]       │
│                             │
│ ┌─────────────────────────┐ │
│ │ مكتمل · أمس             │ │
│ │ ٢٠ م³ · النرجس          │ │
│ │ ١٨٠ ر.س                 │ │
│ │ [اطلب مرة أخرى]         │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ جاري · الآن             │ │
│ │ … [تتبع]                │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Cards | Interaction containers: radius lg 16, border `#E3EEEE`, padding 16 |
| Status chip | Teal active; success green; cancel muted; gold never for status |
| Type | Title 3 status+date; Body address; Caption amount |
| Filters | SqChip row; selected teal |
| Spacing | List gap 12; page padding 16 |

---

## 5. Component hierarchy

```
OrdersScreen
├── FilterChipRow
├── OrdersList
│   └── OrderHistoryCard[]
│       ├── StatusRow
│       ├── MetaRow
│       └── ReorderOrTrackCTA
└── SqEmpty / SqError / SqSkeleton
```

---

## 6. Responsive behavior

- Phone: single column cards.
- Tablet: 2-column card grid; detail can open side pane.

---

## 7. RTL behavior

- Card content RTL; amounts LTR numerals.
- Filter chips scroll logically start→end.
- Swipe actions (if any): archive/support mirrored.

---

## 8. Accessibility notes

- Each card is a single focusable with summary label.
- Status not color-only.
- Reorder button separate focus target.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| List appear | Stagger fade 40ms × index, cap 180ms |
| Pull refresh | Standard; teal indicator |
| Navigate detail | Shared-axis 280ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | 3× SqSkeleton cards |
| Empty | Illustration + “اطلب أول وايت” → Map Home |
| Error | SqError + retry |
| Pagination end | Caption “لا مزيد” |
| Cancelled | Show reason caption; reorder still available |

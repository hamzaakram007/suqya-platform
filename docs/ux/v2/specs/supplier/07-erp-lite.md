# Supplier — ERP Lite

**Surface:** Fuel / inventory / people panels  
**Platform:** Next.js  
**IA:** More → ERP مختصر

---

## 1. UX rationale

Lightweight ops panels—not full ERP. Fuel logs, tank inventory snapshot, staff roster hooks. Progressive disclosure; Arabic forms; teal primary saves. Keeps suppliers inside Suqya for daily ops.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| More → ERP Lite | Tabs Fuel / Inventory / People |
| Low inventory alert | Inventory tab |
| Fuel anomaly | Fuel tab |

---

## 3. Wireframe description

```
┌────────────────────────────────────────────┐
│ ERP مختصر                                  │
│ [الوقود] [المخزون] [الأفراد]               │
│                                             │
│ جدول آخر التعبئات / مستويات الخزانات       │
│ [إضافة سجل]                                 │
└────────────────────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Tabs | Selected teal underline |
| Forms | SqInput; primary teal save |
| Low stock | Amber row |
| Type | IBM Plex Sans Arabic |
| Gold | Unused |
| Spacing | 16 table; 20 form |

---

## 5. Component hierarchy

```
ErpLitePage
├── TabBar
├── FuelPanel
├── InventoryPanel
└── PeoplePanel
```

Optional sync status with external ERP.

---

## 6. Responsive behavior

- Desktop: table + side form.
- Mobile: list → full-screen form.

---

## 7. RTL behavior

- Tabs RTL; numeric fields LTR.
- Tables logical columns.

---

## 8. Accessibility notes

- Tabs arrow-key.
- Low stock announced.
- Forms labeled; errors inline.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Tab switch | Fade 180ms |
| Save | Check 180ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton |
| Empty fuel | CTA add first log |
| Sync fail | Banner “تعذر المزامنة مع ERP” |
| Conflict | Server wins + notify |
| Permission | Read-only mode note |

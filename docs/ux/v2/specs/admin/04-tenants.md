# Admin — Tenants

**Surface:** Tenant / supplier org CRUD  
**Platform:** Next.js  
**IA:** Manage → المستأجرون

---

## 1. UX rationale

Tenants are progressive CRUD: list → detail (mode marketplace/private/franchise, limits, status). Calm admin Linear aesthetic; teal primary; Arabic business names.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Manage → Tenants | List |
| Live Ops tenant filter | Open tenant |
| Onboarding complete | Highlight new |

---

## 3. Wireframe description

```
┌────────────────────────────────────────────┐
│ المستأجرون  [إنشاء] [بحث]                  │
│ بطاقة/صف: الاسم · الوضع · الحالة · الطلبات │
│ تفاصيل: حدود · عمولة · مناطق · مستخدمون    │
└────────────────────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Active | Teal chip |
| Suspended | Danger |
| Create CTA | Teal |
| Type | IBM Plex Sans Arabic |
| Gold | Franchise VIP badge rare |
| Spacing | 16 |

---

## 5. Component hierarchy

```
TenantsPage
├── Toolbar
├── TenantsTableOrCards
└── TenantDetail
    ├── ModeSettings
    ├── Limits
    ├── Zones
    └── SuspendResume
```

---

## 6. Responsive behavior

- Desktop: table + detail route.
- Mobile: cards.

---

## 7. RTL behavior

- Full RTL admin chrome.
- IDs LTR.

---

## 8. Accessibility notes

- Suspend confirm strong wording.
- Forms labeled; errors summarized.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Create success | Navigate + toast 280ms |
| Suspend | Status chip 180ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton |
| Empty | Create first tenant |
| Duplicate CR | Inline validation |
| Suspend with active orders | Warning checklist |
| Mode change mid-day | Confirm impact |

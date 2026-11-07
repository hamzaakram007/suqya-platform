# Admin — Users

**Surface:** Platform & tenant user management  
**Platform:** Next.js  
**IA:** Manage → المستخدمون

---

## 1. UX rationale

Users across roles (admin, supplier staff, support). Progressive invite/role/revoke. Security-clear Arabic copy. Teal invite; danger revoke.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Manage → Users | List |
| Tenant detail “المستخدمون” | Filtered |
| Support impersonation request | Audit-linked |

---

## 3. Wireframe description

```
┌────────────────────────────────────────────┐
│ المستخدمون  [دعوة] فلاتر دور · مستأجر      │
│ اسم · جوال · دور · آخر دخول · حالة         │
│ درج: أدوار · صلاحيات · إيقاف               │
└────────────────────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Role chips | Muted + teal for admin |
| Invite | Teal CTA |
| Disabled user | Muted row |
| Type | IBM Plex Sans Arabic |
| Gold | Unused |
| Spacing | Row 52 |

---

## 5. Component hierarchy

```
UsersPage
├── FilterBar
├── UsersTable
├── InviteModal
└── UserDrawer
    ├── RoleEditor
    └── DisableEnable
```

---

## 6. Responsive behavior

- Desktop table; mobile cards.

---

## 7. RTL behavior

- RTL; phones LTR.
- Role menus logical.

---

## 8. Accessibility notes

- Role changes announced.
- Disable confirm.
- No raw permission GIDs in UI—use names.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Modal | 280ms |
| Role save | Toast 180ms |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton |
| Empty | Invite CTA |
| Invite expired | Resend |
| Last super-admin | Block demote |
| Impersonate | Extra confirm + banner on target session |

# Admin — System Config

**Surface:** Platform configuration & health  
**Platform:** Next.js  
**IA:** Manage → النظام

---

## 1. UX rationale

System is progressive config: feature flags, min app versions, maintenance mode, SMS provider status, map keys health (masked), worker queues. Dangerous actions gated. Arabic labels; teal save; danger maintenance.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Manage → System | Sections |
| Force update needed | Min version section |
| Incident | Maintenance toggle |

---

## 3. Wireframe description

```
┌────────────┬───────────────────────────────┐
│ عام        │ صيانة · إصدارات تطبيقات       │
│ الميزات    │ أعلام الميزات                 │
│ التكاملات  │ حالة SMS · دفع · خرائط        │
│ الطوابير   │ عمق طابور الإرسال             │
└────────────┴───────────────────────────────┘
```

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Healthy | Teal status |
| Degraded | Amber |
| Down | Red |
| Maintenance toggle | Danger confirm |
| Type | IBM Plex Sans Arabic |
| Gold | Unused |
| Secrets | Masked Caption |
| Spacing | 24 sections |

---

## 5. Component hierarchy

```
SystemPage
├── SettingsNav
├── GeneralPanel (maintenance, versions)
├── FeatureFlagsPanel
├── IntegrationsHealthPanel
└── QueuesPanel
```

---

## 6. Responsive behavior

- Desktop side nav.
- Mobile index → panel.

---

## 7. RTL behavior

- Nav RTL; technical keys LTR monospace.
- URLs LTR.

---

## 8. Accessibility notes

- Maintenance confirm typed phrase optional.
- Flag toggles named + state.
- Health not color-only.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Save | Toast 280ms |
| Health refresh | Subtle pulse 180ms |
| Reduced motion | Instant |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Loading | Skeleton panels |
| Save conflict | Reload |
| Integration down | Runbook link |
| Queue backlog | Warn threshold |
| Flag kill-switch | Immediate confirm + audit write |
| Empty flags | Dev seed note (non-prod) |

# Driver — Active Job

**Surface:** Navigation + job stages  
**Platform:** Flutter  
**IA:** Post-accept until POD/cash

---

## 1. UX rationale

Single active job focus: map route, next action only (Navigate → Mark filled → Arrive → POD). Bottom action zone one primary button that morphs by stage. No hamburger. Careem-quality glanceable Arabic stage titles.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Accept offer | Push Active Job |
| App resume mid-job | Restore stage |
| Push “تذكير” | Open Active Job |

Exit: POD → optional Cash Collect → Online Map.

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ المرحلة: التوجه للتعبئة     │
│ MAP route                   │
│                             │
├─────────────────────────────┤
│ العميل · الحجم · الملاحظات  │
│ [اتصال بالعميل]             │
│                             │
│ [ فتح الملاحة ]             │  ← stage CTA 64h
│ أو [ تم التعبئة ] لاحقاً    │
└─────────────────────────────┘
```

Stages: To fill → Filled → To customer → Arrived → POD.

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Stage title | Title 2 teal |
| CTA | Teal 64h full width |
| Secondary | Ghost call button |
| Map chrome | Minimal |
| Type | IBM Plex Sans Arabic |
| Spacing | Sheet 20; bottom safe area |

---

## 5. Component hierarchy

```
ActiveJobScreen
├── SqMap (route, waypoints)
├── StageHeader
├── JobMetaSheet
│   ├── CustomerActions
│   └── StagePrimaryCTA
└── MoreMenu (cancel/support — progressive)
```

---

## 6. Responsive behavior

- Portrait primary; landscape map-dominant with CTA side/bottom.
- External nav handoff returns to same stage.

---

## 7. RTL behavior

- UI RTL; nav apps launched with geo coords (LTR).
- Stage chevrons logical.

---

## 8. Accessibility notes

- Stage changes announced.
- CTA always describes next verb clearly.
- 64dp primary; call 48+.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Stage advance | CTA label crossfade 180ms |
| Arrive | ETA-style badge once |
| Camera | 420ms on route update |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Route fail | Manual address + open maps anyway |
| Customer cancel | Blocking sheet → Online |
| Reassign | Exit with message |
| Offline mid-job | See Offline; queue stage updates |
| Wrong stage tap | Confirm dialog for irreversible marks |

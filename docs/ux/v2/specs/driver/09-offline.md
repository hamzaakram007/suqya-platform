# Driver — Offline Mode

**Surface:** Connectivity / queue resilience  
**Platform:** Flutter  
**IA:** System-triggered overlay or mode on any driver screen

---

## 1. UX rationale

Saudi roads and basements kill signal. Offline mode must keep active job usable: cached map tiles, queued stage updates, clear Arabic banner. Never silent fail. Premium = honest about sync.

---

## 2. User journey / entry points

| Entry | Source |
|-------|--------|
| Network loss | Auto banner + mode |
| Airplane | Same |
| Server unreachable | Degraded offline |
| Manual (rare) | Settings diagnostic |

Exit: reconnect → flush queue → toast “تمت المزامنة”.

---

## 3. Wireframe description

```
┌─────────────────────────────┐
│ ⚠ لا يوجد اتصال · مزامنة لاحقاً │ ← sticky banner
│                             │
│ (Active Job or Map cached)  │
│                             │
│ الإجراءات تُحفظ على الجهاز  │
│ طابور: ٣ تحديثات            │
└─────────────────────────────┘
```

Job offers disabled while offline.

---

## 4. Visual specification

| Element | Spec |
|---------|------|
| Banner | Amber surface `#FFF6E5`; text dark; icon |
| Queue caption | Caption 14 |
| CTA retry | Teal ghost “إعادة المحاولة” |
| Type | IBM Plex Sans Arabic |
| Map | Desaturated slightly to signal cache |

---

## 5. Component hierarchy

```
OfflineBanner (global)
OfflineQueueIndicator
├── QueuedMutationList (debug/settings)
└── SyncOnReconnect service UX toasts
```

Integrates with Active Job / POD / Cash Collect.

---

## 6. Responsive behavior

- Banner full width all sizes; content padding below.

---

## 7. RTL behavior

- Banner RTL; icons logical start.

---

## 8. Accessibility notes

- Announce offline/online transitions once.
- Do not spam live region on every ping.
- Queue count accessible.

---

## 9. Animation specification

| Event | Spec |
|-------|------|
| Banner show | Slide down 180ms |
| Reconnect | Banner exit + success toast 280ms |
| Reduced motion | Instant banner |

---

## 10. Loading / empty / error / edge cases

| State | Treatment |
|-------|-----------|
| Offline empty queue | Banner only |
| Sync conflict | Prefer server; notify driver |
| POD photo queued | Local thumb + pending badge |
| Offer while offline | Suppress; do not show stale offer |
| Long offline >24h | Force re-auth on return |
| Active job critical | Allow stage marks offline with warning |

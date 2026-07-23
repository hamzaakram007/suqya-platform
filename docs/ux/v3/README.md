# UX V3 Index — Phase 16 Bilingual

Sprint B documentation. Same surfaces as [V2](../v2/README.md); adds **equal AR/EN parity**, language switch in Account/Settings, and LTR-native layouts.

## Foundation

| Doc | Purpose |
|-----|---------|
| [ia.md](./ia.md) | Navigation unchanged; language switch placement all apps |
| [journeys.md](./journeys.md) | J1–J4 with AR/EN step notes |
| [localization.md](./localization.md) | RTL/LTR, numbers, documents, search, AI output |
| [design-system.md](./design-system.md) | V2 tokens + bilingual type + logical layout |
| [motion-a11y.md](./motion-a11y.md) | V2 motion/a11y refs + locale transition rules |
| [quality-gate.md](./quality-gate.md) | Sprint G score ≥95, WCAG, performance checklist |

## Scorecards

Baseline composite scores with remediations targeting **≥95**.

| Surface | Scorecard |
|---------|-----------|
| Customer Map Home | [scorecards/customer-home.md](./scorecards/customer-home.md) |
| Customer Settings | [scorecards/customer-settings.md](./scorecards/customer-settings.md) |
| Customer Help | [scorecards/customer-help.md](./scorecards/customer-help.md) |
| Driver Online Map | [scorecards/driver-home.md](./scorecards/driver-home.md) |
| Driver Jobs (Offer→POD) | [scorecards/driver-jobs.md](./scorecards/driver-jobs.md) |
| Driver Earnings | [scorecards/driver-earnings.md](./scorecards/driver-earnings.md) |
| Supplier Today | [scorecards/supplier-today.md](./scorecards/supplier-today.md) |
| Admin Live Ops | [scorecards/admin-live-ops.md](./scorecards/admin-live-ops.md) |
| Admin Settings | [scorecards/admin-settings.md](./scorecards/admin-settings.md) |

## Screen specs (Sprint B scope)

### Customer (Flutter)

| Spec | Description |
|------|-------------|
| [specs/customer/home.md](./specs/customer/home.md) | Map Home 3-tap order |
| [specs/customer/settings.md](./specs/customer/settings.md) | Account + language switch |
| [specs/customer/help.md](./specs/customer/help.md) | FAQ + tickets |

### Driver (Flutter)

| Spec | Description |
|------|-------------|
| [specs/driver/home.md](./specs/driver/home.md) | Online map |
| [specs/driver/jobs.md](./specs/driver/jobs.md) | Offer → Active → POD |
| [specs/driver/settings.md](./specs/driver/settings.md) | Language + prefs |

### Supplier (Next.js)

| Spec | Description |
|------|-------------|
| [specs/supplier/today.md](./specs/supplier/today.md) | Command center |
| [specs/supplier/settings.md](./specs/supplier/settings.md) | Tenant settings + language |

### Admin (Next.js)

| Spec | Description |
|------|-------------|
| [specs/admin/live-ops.md](./specs/admin/live-ops.md) | Live map + critical rail |
| [specs/admin/settings.md](./specs/admin/settings.md) | System config + language |

## V2 reference

Full V2 catalog (39 specs): [../v2/specs/](../v2/specs/)

## Implementation packages

| Package | Role |
|---------|------|
| `@suqya/design-tokens` | Colors, type, CSS variables |
| `@suqya/i18n` | Web strings + locale hook |
| `apps/customer-app/lib/l10n/` | Flutter ARB AR/EN |
| `apps/driver-app/lib/l10n/` | Flutter ARB AR/EN |
| `apps/api/src/common/locale/` | API locale middleware + messages |

## Sprint B exit criteria

- [ ] Language switch in Settings on all four apps
- [ ] J1–J4 completable in EN without layout break
- [ ] All scorecards remediated to projected ≥95
- [ ] CI: ARB / i18n key parity gate green

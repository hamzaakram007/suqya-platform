# Pilot ops pack — Phase 1 Internal Alpha

**Aligned with:** [`launch-plan.md`](./launch-plan.md) Phase 1  
**Seed script:** `apps/api/prisma/seed-pilot.ts`  
**npm:** `npm run db:seed:pilot`

## Goal

Give operators a **repeatable dry-run** of the Riyadh internal alpha without tribal knowledge: 2 suppliers, 10 drivers, a handful of customers/orders, and a checklist that walks admin → supplier → driver → customer against local Compose or staging.

## Prerequisites

| Item | Local | Staging |
|------|-------|---------|
| Postgres + Redis | `docker compose -f infra/docker/docker-compose.yml up -d` (ports **5433** / **6380**) | Railway (or Compose staging) — **blocked until host exists** |
| API env | `cp apps/api/.env.example apps/api/.env` | `.env.staging` + strong `JWT_SECRET` |
| Migrate | `npm run db:migrate` or `db:migrate:deploy` | same against staging `DATABASE_URL` |
| OTP | `OTP_MODE=sandbox`, code `123456` | Prefer `OTP_EXPOSE_IN_RESPONSE=false` for shared audiences |

Do **not** invent a public staging URL. When one exists, set `DATABASE_URL` and run the same seed + checklist.

## How to seed

```bash
npm install
docker compose -f infra/docker/docker-compose.yml up -d
cp apps/api/.env.example apps/api/.env   # DATABASE_URL → localhost:5433
npm run db:migrate
npm run db:seed:pilot                    # idempotent — safe to re-run
npm run dev:api                          # :4000 /v1
```

Optional after seed:

```bash
# Keeps E2E phones — foundation smoke still works
API_BASE=http://localhost:4000/v1 TENANT_ID=default-tenant npm run e2e:foundation
```

`db:seed` (minimal demo) remains available; **`db:seed:pilot` is the Phase 1 operator path** and already includes catalog + tenant + FAQ-compatible demo phones.

### What the pilot seed creates

| Entity | Count | Notes |
|--------|------:|-------|
| Tenant | 1 | `default-tenant` (marketplace) |
| Suppliers | 2 | Al-Nour Water, Najd Pure — CR/VAT + verified sandbox docs |
| Drivers | 10 | 5 per supplier; trucks `PILOT-01`…`PILOT-10`; first 6 online |
| Customers | 5 | Addresses in Riyadh |
| Sample orders | 2 | `PILOT-0001` / `PILOT-0002` in `supplier_review` |

### Pilot phone book (sandbox OTP `123456`)

| Role | Phone | Notes |
|------|-------|-------|
| Admin | `+966501234567` | Platform ops |
| Supplier 1 (Al-Nour) | `+966502345678` | Also used by `e2e:foundation` |
| Supplier 2 (Najd) | `+966511000002` | |
| Driver 01 | `+966503456789` | Al-Nour; E2E driver |
| Drivers 02–10 | `+966511001002` … `+966511001010` | 02–05 Al-Nour; 06–10 Najd |
| Customer (E2E) | `+966504567890` | Owns sample orders |
| Customers 02–05 | `+966511002002` … `+966511002005` | Extra internal testers |

Headers for API calls: `X-Tenant-Id: default-tenant`, `Authorization: Bearer <accessToken>`.

## Admin dry-run checklist (Phase 1)

Walk this once after seeding. Mark each box only when verified on **this** environment (local or staging).

### A. Environment smoke

- [ ] `GET /v1/health` returns healthy (DB reachable)
- [ ] Admin OTP: send + verify `+966501234567` / `123456` → access token
- [ ] Swagger loads at `/v1/docs` (local)

### B. Supplier verification (CR/VAT)

- [ ] List suppliers for tenant — exactly **2** active pilot companies (Al-Nour, Najd)
- [ ] Each has `commercialRegistration` + `vatNumber` populated
- [ ] Documents present (`commercial_registration`, `vat_certificate`, `water_quality`) with `verifiedAt` set
- [ ] Admin UI (when API wired): **Suppliers** → open each → confirm status **active**

### C. Fleet readiness (10 drivers)

- [ ] Count drivers for tenant = **10**
- [ ] ≥ 6 show `isOnline: true` with Riyadh lat/lng
- [ ] Each driver linked to a truck (`PILOT-XX` plate)
- [ ] Split: 5 drivers under Al-Nour, 5 under Najd

### D. Sample order intervention

- [ ] Orders `PILOT-0001` (cash) and `PILOT-0002` (card) visible in `supplier_review`
- [ ] Supplier 1 accepts one order → dispatch offers an online driver
- [ ] Driver accepts → status advances (`accepted` → `filling` → `in_transit`)
- [ ] POD + payment (sandbox) → invoice PDF/QR path (see [`foundation-e2e.md`](./foundation-e2e.md))

### E. Multi-actor login spot-check

- [ ] Supplier 2 portal login (`+966511000002`) sees only Najd fleet
- [ ] Driver 07 (`+966511001007`) goes online and receives offers only when dispatched
- [ ] Customer 02 (`+966511002002`) can create a **new** order (not only seeded samples)

### F. Ops hygiene

- [ ] Re-run `npm run db:seed:pilot` — no duplicate suppliers/drivers/phones; counts unchanged
- [ ] Record environment (local vs staging host), date, and operator name in the run log below

## Dry-run log (copy per session)

| Field | Value |
|-------|-------|
| Date (AST) | |
| Operator | |
| Environment | local Compose / staging URL |
| Seed command | `npm run db:seed:pilot` |
| API tip commit | |
| Result | pass / fail — notes |

## Out of scope for Phase 1 dry-run

- App Store / Play Store publishing
- Live Unifonic SMS / Moyasar production keys
- Google Maps tiles (sandbox canvas is enough)
- Public Railway URL (seed works locally until host exists)

## Related

- Admin manual: [`../manuals/admin.md`](../manuals/admin.md) — Pilot dry-run section
- Launch plan: [`launch-plan.md`](./launch-plan.md)
- Auth: [`../security/auth-hardening.md`](../security/auth-hardening.md)
- Staging: [`../deployment/staging-api.md`](../deployment/staging-api.md)

# Testing Strategy & Riyadh Pilot Launch Plan

## Testing Pyramid

| Layer | Tool | Coverage Target | Scope |
|-------|------|-----------------|-------|
| Unit | Jest (API), Flutter test | 80% business logic | State machine, dispatch scoring, pricing, accounting |
| Integration | Supertest + testcontainers | Critical paths | Auth flow, order lifecycle, payment capture |
| E2E Web | Playwright | Key user flows | Admin dashboard, supplier portal |
| E2E Mobile | Flutter integration tests | Order flow | 3-tap order, tracking |
| Load | k6 | 1000 concurrent orders | API under peak load |
| Security | OWASP ZAP, npm audit | Pre-launch | API endpoints, auth |

## Test Files

- `apps/api/src/modules/dispatch/dispatch.service.spec.ts`
- `apps/api/src/modules/order/order-state-machine.spec.ts`
- `apps/admin-web/tests/e2e/dashboard.spec.ts` (Playwright)

## Riyadh Pilot Launch Plan

### Phase 1: Internal Alpha (Week 1-2)
- 2 suppliers onboarded (CR/VAT verified)
- 10 drivers with test accounts
- 20 internal testers (customer app)
- Staging environment on EKS *(or Railway-first staging — see `docs/deployment/staging-api.md`; live host still optional for local dry-run)*

#### Phase 1 operator dry-run (no tribal knowledge)

Use the **pilot ops pack** so Internal Alpha can be walked on local Compose today and on staging when `DATABASE_URL` exists:

1. Seed: `npm run db:seed:pilot` (idempotent — 2 suppliers, 10 drivers, 5 customers, 2 sample orders).
2. Follow the checklist in [`pilot-ops.md`](./pilot-ops.md) (health → supplier CR/VAT → fleet online → accept/dispatch → POD/pay sandbox).
3. Preserve E2E phones so `npm run e2e:foundation` still validates the Foundation path after pilot seed.
4. Do **not** start store publishing in Phase 1.

Phone book, sample order numbers (`PILOT-0001` / `PILOT-0002`), and the signed dry-run log template live in [`pilot-ops.md`](./pilot-ops.md).

### Phase 2: Closed Beta (Week 3-6)
- 5 suppliers in Riyadh
- 50 drivers
- 500 customers (invitation only)
- Real payments via Moyasar sandbox → production
- ZATCA sandbox invoicing

### Phase 3: Public Launch (Week 7-8)
- App Store + Google Play submission
- Marketing in Riyadh (social, supplier QR codes)
- 24/7 ops support team
- Monitoring via Datadog/Grafana

### Success Criteria

| Metric | Target |
|--------|--------|
| Order completion rate | > 90% |
| Average delivery time | < 4 hours (standard) |
| App crash rate | < 0.1% |
| Payment success rate | > 95% |
| Customer NPS | > 40 |
| Supplier retention | > 80% at 30 days |

### Rollback Plan
- Feature flags per tenant for instant disable
- Database snapshots before each release
- Blue-green deployment on EKS
- RTO: 4 hours, RPO: 1 hour

### Post-Launch Monitoring
- Real-time order funnel dashboard
- Driver availability heatmap
- Credit default rate alerts
- ZATCA submission failure alerts
- API latency p99 < 500ms

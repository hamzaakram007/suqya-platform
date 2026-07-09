# Unit Economics Model

## Key Metrics (Target Year 1)

| Metric | Target | Notes |
|--------|--------|-------|
| AOV (average order value) | SAR 180 | Mix of 6–32 ton deliveries |
| Orders/month (Riyadh pilot) | 5,000 | Month 6 post-launch |
| Active suppliers | 25 | Month 6 |
| Active drivers | 150 | Month 6 |
| Commission rate | 10% | Per completed order |
| SaaS tenants | 5 | White-label by month 12 |

## Revenue per Order (Marketplace)

```
Gross order value:     SAR 180
Platform commission:   SAR 18  (10%)
Payment markup:        SAR 0.90 (0.5% on card)
Net platform revenue:  SAR 18.90
```

## Cost per Order (Estimated)

| Cost item | SAR |
|-----------|-----|
| Maps API (geocode + tracking) | 0.50 |
| SMS/push notification | 0.15 |
| Infrastructure allocation | 0.30 |
| Support allocation | 0.25 |
| **Total variable cost** | **1.20** |

**Contribution margin per order:** SAR 17.70 (~94%)

## CAC / LTV (Customer)

| Metric | Estimate |
|--------|----------|
| CAC (paid + referral) | SAR 25 |
| Orders/year per active customer | 12 |
| Annual revenue per customer | SAR 21.60 (commission only) |
| Customer lifetime (months) | 24 |
| LTV | SAR 43.20 |
| LTV:CAC ratio | 1.7:1 (Year 1) → target 3:1 by Year 2 |

## Commission Breakeven (Platform Ops)

| Monthly fixed cost | SAR |
|--------------------|-----|
| Engineering (allocated) | 200,000 |
| Infrastructure | 18,750 ($5k) |
| Support team (5 FTE) | 75,000 |
| Sales/marketing | 50,000 |
| **Total** | **343,750** |

**Breakeven orders/month:** 343,750 ÷ 17.70 ≈ **19,400 orders**

At 5,000 orders/month (pilot): subsidized by SaaS subscriptions + investment.

## SaaS Unit Economics

| Tier | Price/mo | Target tenants | MRR |
|------|----------|----------------|-----|
| Starter (≤10 trucks) | 499 | 10 | 4,990 |
| Growth (≤50 trucks) | 1,999 | 5 | 9,995 |
| Enterprise (unlimited) | 4,999 | 2 | 9,998 |
| **SaaS MRR target** | | | **24,983** |

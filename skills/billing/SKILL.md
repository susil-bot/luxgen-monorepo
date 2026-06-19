# Skill: Billing, Plans & Stripe

**Domain:** Subscription tiers, Stripe checkout/portal, webhooks, plan gates, usage limits.  
**Docs:** [PHASE_9_BILLING.md](../../docs/PHASE_9_BILLING.md), [PHASE_10_MARKETPLACE.md](../../docs/PHASE_10_MARKETPLACE.md)

---

## Key paths

| Layer | Path |
|-------|------|
| Package | `packages/billing/` — plans, `assertFeature`, limits |
| DB | `packages/db/src/subscription.ts`, `usage.ts` |
| Service | `apps/api/src/services/billingService.ts`, `usageService.ts` |
| GraphQL | `apps/api/src/schema/billing/` |
| REST | `GET /api/billing/plan`, `POST /api/billing/webhook` |
| Web | `apps/web/pages/billing/`, `PlanGate` component |

---

## Business goal

Monetize tiers (Free → Enterprise); enforce capabilities server-side; prepare usage-based overages.

| Tier | Key features |
|------|--------------|
| Free | LMS basics |
| Pro | `automations`, `analytics`, `mobileApp` |
| Business | `webhooks`, `customDomain` |
| Enterprise | `agentStudio`, unlimited usage |

---

## Adding a feature gate

1. Add boolean to plan definition in `packages/billing/src/plans.ts`
2. API: `assertFeature(effectivePlan, 'featureName')` — throws `PLAN_UPGRADE_REQUIRED`
3. Web: `<PlanGate feature="featureName">...</PlanGate>`
4. Document in [BUSINESS_TECH_TRANSLATION.md](../../docs/BUSINESS_TECH_TRANSLATION.md)

---

## Stripe

- Platform subs: `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`
- Listing subs: `STRIPE_PRICE_LISTING` with `metadata.type: listing_subscription`
- Webhook handler: `billingService.handleStripeWebhook`
- Dev: `BILLING_DEV_MODE=true`

---

## Usage metering

- `TenantUsageMonthly` tracks `automationRuns`, `activeLearners`
- Enforced in automation bridge + create/install mutations
- Query: `tenantUsage` GraphQL

---

## Do not

- Gate only on client — always assert on API
- Store card data — Stripe handles PCI

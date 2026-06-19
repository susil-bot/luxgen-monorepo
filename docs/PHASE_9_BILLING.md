# Phase 9 — Billing & Plan Gates

> Stripe subscriptions + feature gates aligned to `docs/BUSINESS_STRATEGY_2026.md`

---

## What shipped

| Component | Location |
|-----------|----------|
| Plan definitions & gates | `packages/billing/` |
| Subscription model | `packages/db/src/subscription.ts` |
| Stripe service | `apps/api/src/services/billingService.ts` |
| GraphQL billing API | `apps/api/src/schema/billing/` |
| Stripe webhook | `POST /api/billing/webhook` |
| Plan REST (for gates) | `GET /api/billing/plan?tenant=demo` |
| Billing UI | `apps/web/pages/billing/` |
| Plan gate component | `apps/web/components/billing/PlanGate.tsx` |

---

## Pricing tiers

| Plan | Price | Key gates |
|------|-------|-----------|
| Free | $0 | Courses, groups, 100 learners |
| Starter | $49 | + API access, 250 learners |
| **Pro** | **$149** | **+ Automations, analytics, mobile** |
| Business | $349 | + Webhooks, custom domain |
| Enterprise | Custom | + Agent Studio |

---

## Feature gates (enforced)

| Feature | Min plan | Where enforced |
|---------|----------|----------------|
| `automations` | Pro | GraphQL mutations, `/automations` UI |
| `agentStudio` | Enterprise | `/api/agent/chat`, `runAgentTask` mutation |
| `analytics` | Pro | *(UI gate — add to `/analytics` in Phase 10)* |
| `webhooks` | Business | Automation `CALL_WEBHOOK` *(future)* |

---

## Local development (no Stripe)

Set in `apps/api/.env`:

```
BILLING_DEV_MODE=true
```

- `createCheckoutSession` simulates upgrade (updates tenant plan in MongoDB)
- `/billing` page shows dev plan override buttons
- Demo tenant seeds as `enterprise` in seed script — automations + agent work out of the box

---

## Production Stripe setup

1. Create products/prices in Stripe Dashboard for Starter, Pro, Business
2. Set env vars in `apps/api/.env`:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`
3. Register webhook endpoint: `https://api.yourdomain.com/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`
4. Set `BILLING_DEV_MODE=false` in production

---

## GraphQL examples

```graphql
query {
  tenantBilling(tenantId: "demo") {
    plan planName featureFlags { automations agentStudio }
  }
  pricingPlans { id name priceMonthly features }
}

mutation {
  createCheckoutSession(
    tenantId: "demo"
    plan: PRO
    successUrl: "http://localhost:3000/billing?tenant=demo"
    cancelUrl: "http://localhost:3000/billing?tenant=demo"
  ) { url sessionId }
}
```

---

## Next (Phase 11+)

See `docs/PHASE_10_MARKETPLACE.md`.

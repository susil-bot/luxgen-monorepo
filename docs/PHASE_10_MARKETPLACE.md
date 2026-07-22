# Phase 10 — Marketplace & Usage Metering

> Expansion revenue: template marketplace + usage limits aligned to plan tiers.

---

## What shipped

| Component | Location |
|-----------|----------|
| Usage model (monthly) | `packages/db/src/usage.ts` |
| Usage limit helpers | `packages/billing/src/usage-limits.ts` |
| Usage service | `apps/api/src/services/usageService.ts` |
| Marketplace catalog | `packages/db/src/automation-template.ts` |
| Marketplace service | `apps/api/src/services/marketplaceService.ts` |
| GraphQL marketplace + usage | `apps/api/src/schema/marketplace/` |
| Bridge usage enforcement | `packages/agent/src/automation/bridge.ts` |
| Marketplace UI | `apps/web/pages/marketplace/` |
| Analytics hub + gates | `apps/web/pages/analytics/`, course/group analytics |
| Usage dashboard | Billing page usage bars |

---

## Marketplace

**Route:** `/marketplace?tenant=demo`

- 6 seeded templates (onboarding, completion, retention, engagement, integrations, agent ops)
- Free and paid templates (`priceCents` — display only for now; install is included in Pro)
- `installAutomationTemplate` mutation → creates paused automation from template
- Sidebar: **Automations → Marketplace**

```graphql
query {
  automationTemplates(featured: true) {
    slug name description priceLabel installCount
  }
}

mutation {
  installAutomationTemplate(tenantId: "demo", slug: "welcome-sequence") {
    id name enabled
  }
}
```

---

## Usage metering

**Tracked per tenant per month (`YYYY-MM`):**

| Metric | Enforced | Limit source |
|--------|----------|--------------|
| Automation runs | Yes (bridge + API) | `maxAutomationRunsPerMonth` |
| Automation count | Yes (create/install) | `maxAutomations` |
| Active learners | Tracked | `maxLearners` |

```graphql
query {
  tenantUsage(tenantId: "demo") {
    period automationRuns activeLearners automationCount
    limits { maxAutomationRunsPerMonth maxLearners maxAutomations }
    percentUsed { automationRuns activeLearners }
    withinLimits { automationRuns activeLearners automations }
  }
}
```

When limits are exceeded, API returns `USAGE_LIMIT_EXCEEDED` with current/limit/plan.

---

## Stripe metered overages (optional)

Set in `apps/api/.env`:

```
STRIPE_METER_AUTOMATION_RUNS_ITEM=si_...
```

When automation runs exceed plan limit, each additional run reports `+1` to Stripe usage records (requires metered subscription item).

---

## Analytics plan gate

- `/analytics` — hub (Pro+)
- `/courses/analytics`, `/groups/analytics` — wrapped in `PlanGate`

---

## Next (Phase 11+)

- Paid template checkout (Stripe one-time for premium templates)
- Learner overage billing
- Mobile app (Phase 8)
- Real analytics data from GraphQL (replace mocks)

# Business ↔ Technology Translation

> Maps **business goals** to **technical capabilities** so product, engineering, and AI agents share one vocabulary.

---

## Product definition

| Business language | Technical implementation |
|-------------------|-------------------------|
| "Branded training platform" | Multi-tenant LMS (`Tenant`, subdomain routing, `@luxgen/ui` theming) |
| "Automate learner journeys" | Automations engine (`Automation`, `AutomationBridge`, `/automations`) |
| "Monetize with tiers" | `@luxgen/billing` + Stripe + `PlanGate` |
| "Sell workflow templates" | Marketplace (`AutomationTemplate`, `/marketplace`) |
| "AI customization for enterprise" | Agent Studio (`@luxgen/agent`, Enterprise gate) |
| "Business directory listings" | `BusinessListing` + listing Stripe subscriptions |
| "Mobile for learners" | GraphQL client contract — [GRAPHQL_PLATFORM.md](./GRAPHQL_PLATFORM.md) (Phase 8) |

---

## Revenue model translation

| Business tier | Price | Technical gates (`@luxgen/billing`) |
|---------------|-------|-------------------------------------|
| Free | $0 | Courses, groups, 100 learners — no automations |
| Starter | $49 | `apiAccess`, 250 learners |
| Pro | $149 | `automations`, `analytics`, `mobileApp`, usage limits |
| Business | $349 | `webhooks`, `customDomain` |
| Enterprise | Custom | `agentStudio`, unlimited usage |

**Stripe env:** `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`  
**Doc:** [PHASE_9_BILLING.md](./PHASE_9_BILLING.md)

---

## KPI → data source

| Business KPI | Where measured |
|--------------|----------------|
| MRR | Stripe + `TenantSubscription` |
| Active learners | `TenantUsageMonthly.activeLearners` / User count |
| Automation runs | `TenantUsageMonthly.automationRuns`, `AutomationRun` |
| Agent engagement | `AgentTask`, `AgentAuditEntry` |
| Listing revenue | Stripe `listing_subscription` + `BusinessListing` |
| Email deliverability | `EmailNotificationLog` |

---

## Persona → routes → APIs

| Persona | Goal | Web routes | Primary API |
|---------|------|------------|-------------|
| **Operator (buyer)** | Run training business | `/dashboard`, `/billing` | `tenantBilling`, dashboard queries |
| **Admin** | Manage users/courses | `/users`, `/courses`, `/groups` | `courses`, `groups`, `users` |
| **Learner** | Take courses | `/customers` (mobile Phase 8) | Course enrollment queries |
| **Creator** | Automate ops | `/automations`, `/marketplace` | `automations`, `automationTemplates` |
| **Developer** | Customize platform | `/agent` | `/api/agent/*`, `runAgentTask` |
| **Applicant** | List business | `/listings/apply`, `/listings/my` | `createListingDraft`, checkout |
| **Editorial** | Review applications | `/admin/listings` | `approveListing`, `rejectListing` |
| **Public** | Find businesses | `/listings` | `publishedListings` |

Persona detail: [PERSONA_PAGES.md](./PERSONA_PAGES.md)

---

## Feature → business outcome

| Feature | Business outcome | Phase |
|---------|------------------|-------|
| Multi-tenant subdomains | White-label SaaS for agencies | Core |
| GraphQL API | One backend for web + mobile | Core |
| Automations | Reduce manual ops; Pro upsell | 7 |
| Agent Studio | Enterprise differentiation | 4–6 |
| Plan gates | Enforce pricing tiers | 9 |
| Usage metering | Overage billing readiness | 10 |
| Template marketplace | Expansion revenue | 10 |
| Listing subscriptions | Directory monetization | Listings |
| Lifecycle emails | Reduce editorial follow-up | Listings |

---

## Application lifecycle (listings) ↔ business rules

| Business rule | Code enforcement |
|---------------|------------------|
| Profile live while subscription active | `publicationStatus: published` when `subscriptionActive` |
| Cancel → hide profile, keep data | `listingService.expireListing()` |
| Renew → republish same data | `listingService.republishListing()` |
| Approved → payment before publish | `awaiting_payment` → Stripe checkout → `publishListing()` |
| Auto emails on status change | `listingNotificationService.send()` |
| Reminder campaigns | `listingReminderService` + cron job |

Full spec: [LISTING_SUBSCRIPTION_LIFECYCLE.md](./LISTING_SUBSCRIPTION_LIFECYCLE.md)

---

## Roadmap ↔ engineering phases

| Business milestone | Engineering phase | Doc |
|--------------------|-------------------|-----|
| Demo-able workflows | Phase 7 automations | [AGENT_STUDIO_ARCHITECTURE.md](./AGENT_STUDIO_ARCHITECTURE.md) |
| Paid beta | Phase 9 billing | [PHASE_9_BILLING.md](./PHASE_9_BILLING.md) |
| Template upsell | Phase 10 marketplace | [PHASE_10_MARKETPLACE.md](./PHASE_10_MARKETPLACE.md) |
| Learner retention | Phase 8 mobile | [GRAPHQL_PLATFORM.md](./GRAPHQL_PLATFORM.md) |
| Directory revenue | Listings module | [LISTING_SUBSCRIPTION_LIFECYCLE.md](./LISTING_SUBSCRIPTION_LIFECYCLE.md) |

Strategy source: [BUSINESS_STRATEGY_2026.md](./BUSINESS_STRATEGY_2026.md)

---

## Agent translation (for AI tools)

When a user asks in business terms, map to code:

| User says | Agent should |
|-----------|--------------|
| "Gate automations on Pro" | Use `@luxgen/billing` `assertFeature(plan, 'automations')` |
| "Add a new automation trigger" | Extend `AutomationTriggerType` in `@luxgen/db`, GraphQL enum, bridge |
| "Send email when X" | Listing: `listingNotificationService`; LMS: automation action `SEND_EMAIL` |
| "Upgrade flow" | `createCheckoutSession` mutation + `/billing` page |
| "Usage limits" | `usageService`, `TenantUsageMonthly`, Phase 10 doc |

Agent playbook: [AI_AGENT_GUIDE.md](./AI_AGENT_GUIDE.md)

# LuxGen Feature Catalog

> **Per-feature reference:** user value, routes, API, packages, and docs — for developers and product. Organized by business domain — see `docs/PRODUCT_ARCHITECTURE.md` for the domain model and `docs/MENU_STRUCTURE.md` for the live nav tree these routes belong to.

---

## Home

### 1. Multi-tenant LMS (core)

|                |                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **User value** | Branded training delivery per organization                                                                                 |
| **Routes**     | `/dashboard`, `/courses`, `/organization/groups`, `/organization/users`                                                     |
| **GraphQL**    | `courses`, `groups`, `users`, `getDashboardData`                                                                           |
| **Models**     | `Tenant`, `User`, `Course`, `Group`                                                                                        |
| **Packages**   | `@luxgen/db`, `@luxgen/ui`                                                                                                 |
| **Docs**       | [technical/architecture/MULTI_TENANT.md](./technical/architecture/MULTI_TENANT.md), [PERSONA_PAGES.md](./PERSONA_PAGES.md) |

---

## Learning

### 2. Learner / customer experience

|                |                                                            |
| -------------- | ---------------------------------------------------------- |
| **User value** | End learners view progress and content                     |
| **Routes**     | `/customers`, `/learn`, `/learn/courses/[id]`, `/learn/certificates`, `/learn/subscriptions` |
| **GraphQL**    | Course/group queries (learner-scoped — expand in Phase 8)  |
| **Skill**      | [persona-pages/SKILL.md](../skills/persona-pages/SKILL.md) |

---

## Intelligence

### 3. Analytics

|                |                                                         |
| -------------- | ------------------------------------------------------- |
| **User value** | Revenue intelligence, engagement metrics                |
| **Routes**     | `/analytics`, `/courses/analytics`, `/groups/analytics` |
| **Plan gate**  | Pro (`analytics` feature)                               |
| **Component**  | `PlanGate` on analytics pages                           |
| **Note**       | Some pages still use mock data — wire to GraphQL next   |

---

## Automation Hub

### 4. Automations (Phase 7)

|                |                                                                          |
| -------------- | ------------------------------------------------------------------------ |
| **User value** | Trigger → action workflows without code                                  |
| **Routes**     | `/automations`, `/automations/tower`, `/automations/tower/runs`          |
| **GraphQL**    | `automations`, `createAutomation`, `toggleAutomation`, `automationRuns`  |
| **Bridge**     | `packages/agent/src/automation/bridge.ts`                                |
| **Plan gate**  | Pro                                                                      |
| **Skill**      | [automation/SKILL.md](../skills/automation/SKILL.md)                     |
| **Docs**       | [AGENT_STUDIO_ARCHITECTURE.md](./AGENT_STUDIO_ARCHITECTURE.md) § Phase 7, [AUTOMATION_HUB_STRATEGY.md](./AUTOMATION_HUB_STRATEGY.md), [AUTOMATION_MARKETPLACE_TAXONOMY.md](./AUTOMATION_MARKETPLACE_TAXONOMY.md) |

**Triggers include:** `USER_ENROLLED`, `COURSE_COMPLETED`, `CODE_CHANGE_MERGED`, `CERTIFICATE_EXPIRING_SOON`, …

### 5. Automation marketplace (Phase 10)

|                |                                                      |
| -------------- | ---------------------------------------------------- |
| **User value** | One-click install of proven workflows                |
| **Routes**     | `/marketplace`                                       |
| **GraphQL**    | `automationTemplates`, `installAutomationTemplate`   |
| **Service**    | `marketplaceService.ts`                              |
| **Docs**       | [PHASE_10_MARKETPLACE.md](./PHASE_10_MARKETPLACE.md), [AUTOMATION_MARKETPLACE_TAXONOMY.md](./AUTOMATION_MARKETPLACE_TAXONOMY.md) |

---

## Administration

### 6. SaaS billing & plan gates (Phase 9)

|                |                                                          |
| -------------- | -------------------------------------------------------- |
| **User value** | Subscription tiers, self-serve upgrade                   |
| **Routes**     | `/organization/billing` (`/billing` is a `@deprecated` redirect to it) |
| **GraphQL**    | `tenantBilling`, `pricingPlans`, `createCheckoutSession` |
| **REST**       | `GET /api/billing/plan`, Stripe webhook                  |
| **Package**    | `@luxgen/billing`                                        |
| **Skill**      | [billing/SKILL.md](../skills/billing/SKILL.md)           |
| **Doc**        | [PHASE_9_BILLING.md](./PHASE_9_BILLING.md)               |

### 7. Usage metering (Phase 10)

|                 |                                             |
| --------------- | ------------------------------------------- |
| **User value**  | Fair usage, overage billing readiness       |
| **GraphQL**     | `tenantUsage`                               |
| **Models**      | `TenantUsageMonthly`                        |
| **Enforcement** | Automation bridge, create/install mutations |
| **UI**          | Usage bars on `/organization/billing`       |

### 8. Agent Studio (Phases 4–6)

|                |                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **User value** | AI-assisted codebase changes with approval                                                                                           |
| **Routes**     | `/agent`                                                                                                                             |
| **API**        | `/api/agent/*` (SSE chat, commit, merge, validate)                                                                                   |
| **Package**    | `@luxgen/agent`                                                                                                                      |
| **Worker**     | `apps/agent-worker`                                                                                                                  |
| **Plan gate**  | Enterprise                                                                                                                           |
| **Skill**      | [ai-studio/SKILL.md](../skills/ai-studio/SKILL.md)                                                                                   |
| **Docs**       | [technical/agent/AGENT_STUDIO.md](./technical/agent/AGENT_STUDIO.md), [AGENT_STUDIO_ARCHITECTURE.md](./AGENT_STUDIO_ARCHITECTURE.md), [AGENT_ORCHESTRATOR.md](./AGENT_ORCHESTRATOR.md) |

---

## Listings

### 9. Business listings & directory

|                |                                                                          |
| -------------- | ------------------------------------------------------------------------ |
| **User value** | Paid business profiles with editorial review                             |
| **Routes**     | `/listings`, `/listings/apply`, `/listings/my`, `/admin/listings`        |
| **GraphQL**    | `publishedListings`, listing mutations, checkout                         |
| **Models**     | `BusinessListing`, `EmailNotificationLog`                                |
| **Jobs**       | `POST /api/jobs/listing-reminders`                                       |
| **Skill**      | [listings/SKILL.md](../skills/listings/SKILL.md)                         |
| **Doc**        | [LISTING_SUBSCRIPTION_LIFECYCLE.md](./LISTING_SUBSCRIPTION_LIFECYCLE.md) |

**Emails:** 5 status notifications + 4 reminder campaigns (automated).

---

## Cross-cutting

### 10. Sidebar & navigation

|                |                                                |
| -------------- | ---------------------------------------------- |
| **User value** | Consistent app navigation                      |
| **Source**     | `packages/ui/src/Layout/DefaultNavigation.tsx` |
| **Skill**      | [sidebar/SKILL.md](../skills/sidebar/SKILL.md) |
| **Docs**       | [SIDEBAR_REDESIGN.md](./SIDEBAR_REDESIGN.md) (planned visual rebuild), [MENU_STRUCTURE.md](./MENU_STRUCTURE.md) (current live tree), [PRODUCT_ARCHITECTURE.md](./PRODUCT_ARCHITECTURE.md) (domain grouping rationale) |

### 11. Design system

|                |                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| **User value** | iOS-native feel, dark mode                                                                               |
| **Source**     | `apps/web/styles/globals.css`                                                                            |
| **Skill**      | [ios-design/SKILL.md](../skills/ios-design/SKILL.md)                                                     |
| **Rules**      | [technical/development/CODING_STANDARDS.md](./technical/development/CODING_STANDARDS.md) § Design System |

---

## Feature dependency graph

```
Multi-tenant ─┬─ LMS (courses/groups)                    [Learning / People]
              ├─ Automations (Pro) ── Marketplace templates [Automation Hub]
              ├─ Billing (Stripe) ─── Plan gates ─── Usage limits [Administration]
              ├─ Agent Studio (Enterprise)                [Administration]
              └─ Listings (separate Stripe product)       [Listings]

GraphQL API ──── web + mobile (Learning + Home domains today)
```

Business mapping: [BUSINESS_TECH_TRANSLATION.md](./BUSINESS_TECH_TRANSLATION.md)
Domain model: [PRODUCT_ARCHITECTURE.md](./PRODUCT_ARCHITECTURE.md)

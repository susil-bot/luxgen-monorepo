# LuxGen Feature Catalog

> **Per-feature reference:** user value, routes, API, packages, and docs — for developers and product.

---

## 1. Multi-tenant LMS (core)

|                |                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **User value** | Branded training delivery per organization                                                                                 |
| **Routes**     | `/dashboard`, `/courses`, `/groups`, `/users`                                                                              |
| **GraphQL**    | `courses`, `groups`, `users`, `getDashboardData`                                                                           |
| **Models**     | `Tenant`, `User`, `Course`, `Group`                                                                                        |
| **Packages**   | `@luxgen/db`, `@luxgen/ui`                                                                                                 |
| **Docs**       | [technical/architecture/MULTI_TENANT.md](./technical/architecture/MULTI_TENANT.md), [PERSONA_PAGES.md](./PERSONA_PAGES.md) |

---

## 2. Learner / customer experience

|                |                                                            |
| -------------- | ---------------------------------------------------------- |
| **User value** | End learners view progress and content                     |
| **Routes**     | `/customers`                                               |
| **GraphQL**    | Course/group queries (learner-scoped — expand in Phase 8)  |
| **Skill**      | [persona-pages/SKILL.md](../skills/persona-pages/SKILL.md) |

---

## 3. Analytics

|                |                                                         |
| -------------- | ------------------------------------------------------- |
| **User value** | Revenue intelligence, engagement metrics                |
| **Routes**     | `/analytics`, `/courses/analytics`, `/groups/analytics` |
| **Plan gate**  | Pro (`analytics` feature)                               |
| **Component**  | `PlanGate` on analytics pages                           |
| **Note**       | Some pages still use mock data — wire to GraphQL next   |

---

## 4. Automations (Phase 7)

|                |                                                                          |
| -------------- | ------------------------------------------------------------------------ |
| **User value** | Trigger → action workflows without code                                  |
| **Routes**     | `/automations`                                                           |
| **GraphQL**    | `automations`, `createAutomation`, `toggleAutomation`, `automationRuns`  |
| **Bridge**     | `packages/agent/src/automation/bridge.ts`                                |
| **Plan gate**  | Pro                                                                      |
| **Skill**      | [automation/SKILL.md](../skills/automation/SKILL.md)                     |
| **Doc**        | [AGENT_STUDIO_ARCHITECTURE.md](./AGENT_STUDIO_ARCHITECTURE.md) § Phase 7 |

**Triggers include:** `USER_ENROLLED`, `COURSE_COMPLETED`, `CODE_CHANGE_MERGED`, …

---

## 5. Automation marketplace (Phase 10)

|                |                                                      |
| -------------- | ---------------------------------------------------- |
| **User value** | One-click install of proven workflows                |
| **Routes**     | `/marketplace`                                       |
| **GraphQL**    | `automationTemplates`, `installAutomationTemplate`   |
| **Service**    | `marketplaceService.ts`                              |
| **Doc**        | [PHASE_10_MARKETPLACE.md](./PHASE_10_MARKETPLACE.md) |

---

## 6. SaaS billing & plan gates (Phase 9)

|                |                                                          |
| -------------- | -------------------------------------------------------- |
| **User value** | Subscription tiers, self-serve upgrade                   |
| **Routes**     | `/billing`                                               |
| **GraphQL**    | `tenantBilling`, `pricingPlans`, `createCheckoutSession` |
| **REST**       | `GET /api/billing/plan`, Stripe webhook                  |
| **Package**    | `@luxgen/billing`                                        |
| **Skill**      | [billing/SKILL.md](../skills/billing/SKILL.md)           |
| **Doc**        | [PHASE_9_BILLING.md](./PHASE_9_BILLING.md)               |

---

## 7. Usage metering (Phase 10)

|                 |                                             |
| --------------- | ------------------------------------------- |
| **User value**  | Fair usage, overage billing readiness       |
| **GraphQL**     | `tenantUsage`                               |
| **Models**      | `TenantUsageMonthly`                        |
| **Enforcement** | Automation bridge, create/install mutations |
| **UI**          | Usage bars on `/billing`                    |

---

## 8. Agent Studio (Phases 4–6)

|                |                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **User value** | AI-assisted codebase changes with approval                                                                                           |
| **Routes**     | `/agent`                                                                                                                             |
| **API**        | `/api/agent/*` (SSE chat, commit, merge, validate)                                                                                   |
| **Package**    | `@luxgen/agent`                                                                                                                      |
| **Worker**     | `apps/agent-worker`                                                                                                                  |
| **Plan gate**  | Enterprise                                                                                                                           |
| **Skill**      | [ai-studio/SKILL.md](../skills/ai-studio/SKILL.md)                                                                                   |
| **Docs**       | [technical/agent/AGENT_STUDIO.md](./technical/agent/AGENT_STUDIO.md), [AGENT_STUDIO_ARCHITECTURE.md](./AGENT_STUDIO_ARCHITECTURE.md) |

---

## 9. Business listings & directory

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

## 10. Sidebar & navigation

|                |                                                |
| -------------- | ---------------------------------------------- |
| **User value** | Consistent app navigation                      |
| **Source**     | `packages/ui/src/Layout/DefaultNavigation.tsx` |
| **Skill**      | [sidebar/SKILL.md](../skills/sidebar/SKILL.md) |
| **Doc**        | [SIDEBAR_REDESIGN.md](./SIDEBAR_REDESIGN.md)   |

---

## 11. Design system

|                |                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| **User value** | iOS-native feel, dark mode                                                                               |
| **Source**     | `apps/web/styles/globals.css`                                                                            |
| **Skill**      | [ios-design/SKILL.md](../skills/ios-design/SKILL.md)                                                     |
| **Rules**      | [technical/development/CODING_STANDARDS.md](./technical/development/CODING_STANDARDS.md) § Design System |

---

## Feature dependency graph

```
Multi-tenant ─┬─ LMS (courses/groups)
              ├─ Automations (Pro) ── Marketplace templates
              ├─ Billing (Stripe) ─── Plan gates ─── Usage limits
              ├─ Agent Studio (Enterprise)
              └─ Listings (separate Stripe product)

GraphQL API ──── web + mobile (planned)
```

Business mapping: [BUSINESS_TECH_TRANSLATION.md](./BUSINESS_TECH_TRANSLATION.md)

# AI Agent Guide — LuxGen

> **Audience:** Cursor, Claude Code, Copilot Workspace, and similar coding agents.  
> **Entrypoint:** [AGENTS.md](../AGENTS.md) → this file → [technical/development/CODEBASE.md](./technical/development/CODEBASE.md) → domain skill.

---

## 1. Session startup (mandatory)

1. Read [technical/development/CODEBASE.md](./technical/development/CODEBASE.md) — repo map, ports, page template, conventions.
2. Read [technical/development/CODING_STANDARDS.md](./technical/development/CODING_STANDARDS.md) — non-negotiable rules (CSS tokens, TypeScript, no raw hex).
3. Read [docs/INDEX.md](./INDEX.md) — find the right doc for the task.
4. Load **one** domain skill from `skills/<domain>/SKILL.md` (see table below).
5. If the task crosses business + code, skim [BUSINESS_TECH_TRANSLATION.md](./BUSINESS_TECH_TRANSLATION.md).

Do **not** explore the repo blindly when a doc or skill already points to the file.

---

## 2. Skill routing

| User intent                   | Skill                           | Key paths                                |
| ----------------------------- | ------------------------------- | ---------------------------------------- |
| New page, layout, colours     | `skills/ios-design/SKILL.md`    | `globals.css`, page template in CODEBASE |
| Sidebar / nav                 | `skills/sidebar/SKILL.md`       | `DefaultNavigation.tsx`                  |
| Learner, admin, analytics UI  | `skills/persona-pages/SKILL.md` | `/customers`, `/analytics`               |
| Agent Studio, git pipeline    | `skills/ai-studio/SKILL.md`     | `@luxgen/agent`, `/api/agent/*`          |
| Automations, triggers, bridge | `skills/automation/SKILL.md`    | `schema/automation/`, `bridge.ts`        |
| Plans, Stripe, PlanGate       | `skills/billing/SKILL.md`       | `@luxgen/billing`, `billingService.ts`   |
| Business listings, emails     | `skills/listings/SKILL.md`      | `schema/listing/`, listing services      |
| New GraphQL domain            | `skills/graphql/SKILL.md`       | `schema/index.ts`, `graphql/queries/`    |

---

## 3. Architecture constraints

| Rule                                   | Why                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------ |
| **GraphQL is the API contract**        | Web and planned mobile share `apps/api` — see [GRAPHQL_PLATFORM.md](./GRAPHQL_PLATFORM.md) |
| **Business logic in services**         | Resolvers stay thin; use `apps/api/src/services/*`                                         |
| **Plan gates before premium features** | `@luxgen/billing` — `assertFeature`, `PlanGate` on web                                     |
| **Tenant scope everything**            | Pass `tenantId` / read `req.tenant`; never leak cross-tenant data                          |
| **Agent writes via staging**           | Never let LLM write directly to disk — `@luxgen/agent` staging pipeline                    |
| **iOS design tokens only**             | No `bg-gray-*`, no raw hex — see ios-design skill                                          |

Full architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 4. Feature → file map (quick lookup)

| Feature      | Web                                        | API                                            | Package                |
| ------------ | ------------------------------------------ | ---------------------------------------------- | ---------------------- |
| Dashboard    | `pages/dashboard.tsx`                      | `schema/dashboard/`                            | —                      |
| Automations  | `pages/automations/`                       | `schema/automation/`, `automationService.ts`   | `@luxgen/agent` bridge |
| Billing      | `pages/billing/`                           | `schema/billing/`, `billingService.ts`         | `@luxgen/billing`      |
| Marketplace  | `pages/marketplace/`                       | `schema/marketplace/`, `marketplaceService.ts` | —                      |
| Listings     | `pages/listings/`, `pages/admin/listings/` | `schema/listing/`, `listing*Service.ts`        | `@luxgen/db`           |
| Agent Studio | `pages/agent.tsx`, `pages/api/agent/`      | — (web SSE)                                    | `@luxgen/agent`        |

Full catalog: [FEATURE_CATALOG.md](./FEATURE_CATALOG.md)

---

## 5. Common tasks (playbook)

### Add a GraphQL query + page

1. `skills/graphql/SKILL.md`
2. Add `typeDefs` + `resolvers` under `apps/api/src/schema/<domain>/`
3. Register in `apps/api/src/schema/index.ts`
4. Add `apps/web/graphql/queries/<domain>.ts`
5. Page uses `useQuery` / `useMutation` with tenant from router
6. Sidebar entry in `DefaultNavigation.tsx` if user-facing

### Add plan gate

1. `skills/billing/SKILL.md`
2. Add feature flag in `packages/billing/src/plans.ts` if new capability
3. API: `assertFeature(plan, 'featureName')` in resolver or service
4. Web: wrap page/section in `PlanGate`

### Add automation trigger

1. `skills/automation/SKILL.md`
2. Extend enum in `@luxgen/db` + GraphQL typeDefs
3. Emit event from source code via `packages/agent/src/automation/events.ts`
4. Bridge handles action execution + usage increment

### Add listing lifecycle email

1. `skills/listings/SKILL.md`
2. Template in `apps/api/src/notifications/listing-templates.ts`
3. Call from `listingNotificationService.ts` on status transition
4. Log to `EmailNotificationLog` for deduplication

---

## 6. API & env reference

- **GraphQL:** `http://localhost:4000/graphql` — [API_REFERENCE.md](./API_REFERENCE.md)
- **Env templates:** `apps/api/.env.example`, `apps/web/.env.local` (not committed)
- **Stripe dev:** `BILLING_DEV_MODE=true` bypasses real checkout in some flows
- **Jobs:** `POST /api/jobs/listing-reminders` with `x-jobs-key: $JOBS_API_KEY`

---

## 7. What not to do

- Do not duplicate skill content under `.agents/` — `skills/` is canonical.
- Do not add REST endpoints when GraphQL suffices (mobile contract).
- Do not skip `EmailNotificationLog` for listing/reminder emails (prevents duplicates).
- Do not commit `.env` files or secrets.
- Do not fix unrelated TypeScript errors in `@luxgen/ui` unless the task requires it.

---

## 8. Documentation you may write

When shipping a feature, update:

| File                           | When                                  |
| ------------------------------ | ------------------------------------- |
| `FEATURE_CATALOG.md`           | New user-facing capability            |
| `API_REFERENCE.md`             | New GraphQL domain or REST route      |
| `BUSINESS_TECH_TRANSLATION.md` | New business ↔ tech mapping           |
| Relevant phase doc             | Billing, marketplace, listings, agent |
| Domain `skills/*/SKILL.md`     | New patterns in that domain           |

Hub: [docs/INDEX.md](./INDEX.md)

---

## 9. Phase roadmap (context)

| Phase          | Status  | Doc                                                                      |
| -------------- | ------- | ------------------------------------------------------------------------ |
| 7 Automations  | Shipped | [AGENT_STUDIO_ARCHITECTURE.md](./AGENT_STUDIO_ARCHITECTURE.md)           |
| 8 Mobile       | Planned | [GRAPHQL_PLATFORM.md](./GRAPHQL_PLATFORM.md)                             |
| 9 Billing      | Shipped | [PHASE_9_BILLING.md](./PHASE_9_BILLING.md)                               |
| 10 Marketplace | Shipped | [PHASE_10_MARKETPLACE.md](./PHASE_10_MARKETPLACE.md)                     |
| Listings       | Shipped | [LISTING_SUBSCRIPTION_LIFECYCLE.md](./LISTING_SUBSCRIPTION_LIFECYCLE.md) |

Business strategy: [BUSINESS_STRATEGY_2026.md](./BUSINESS_STRATEGY_2026.md)

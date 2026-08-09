# LuxGen — Platform Verticalization Strategy (Vocabulary, Funnel Templates, Super-Admin Map)

> **Status:** Proposal for review · Owner: Product/Eng
> **Audience:** Founders, engineers, super-admin operators
> **Builds on:** [BUSINESS_STRATEGY_2026.md](./BUSINESS_STRATEGY_2026.md), [TEMPLATE_CONTROL_CORE.md](./TEMPLATE_CONTROL_CORE.md), [AUTOMATION_HUB_STRATEGY.md](./AUTOMATION_HUB_STRATEGY.md), [PRODUCT_ARCHITECTURE.md](./PRODUCT_ARCHITECTURE.md), [TENANT_LAYER_SUPERADMIN.md](./TENANT_LAYER_SUPERADMIN.md)
> **Companion:** [docs/todo-orchestrator/queue.yaml](./todo-orchestrator/queue.yaml) — epic `E5` (task cards derived from this doc)

---

## 0. The complaint this doc answers

> "The naming — 'Course' — only makes sense to a trainer. Someone selling a digital product would fit the same underlying functionality but has to duplicate it under different names. The codebase has no proper sitemap page — an admin needs a way to see what's actually turned on for a tenant, and only a super admin should get that view. Build a full funnel flow each industry can use, focused on ROI, easy config, scalability, and AI."

This doc proposes three additive systems that answer that complaint without touching a single database collection name, GraphQL type, or URL:

1. **Tenant Vocabulary Layer** — per-tenant display-name overrides (Course → "Program"/"Offering"/"Membership", Student → "Client", Enrollment → "Purchase") that resolve at render time. Internal names never change.
2. **Funnel Templates** — data-only bundles (vocabulary preset + enabled modules + pre-installed automation templates + storefront copy) for **digital products, agency/consulting, and membership/community** — the three verticals prioritized for this pass — installed the same way `AutomationTemplate` is installed today.
3. **Super-Admin Tenant Capability Map** — a read-only page showing which domains/modules/templates are live for a given tenant and why, gated to `SUPER_ADMIN` only.

A fourth piece, the **AI Setup Wizard**, is the glue: a `packages/agent`-powered onboarding flow that asks a new tenant a handful of questions and calls the same three systems' existing mutations to configure them — it recommends and applies, it does not freeform-generate code or schema.

---

## 1. Why not just rename "Course"?

Grep across `apps/web`, `apps/api`, `packages/db`, `packages/ui` for the case-insensitive substring `course` returns **230 files, 2,847 occurrences** — collection name, GraphQL type, service class, field names (`courseId`, `courseTitle`), enums, and route paths all the way down. This repo already has direct, on-the-record precedent for rejecting a rename this size: `PRODUCT_ARCHITECTURE.md` §"Why no URL changes" deferred a *much smaller* `/products` → `/storefront/products` rename because it "touches every internal link, every presenter, mobile deep links... can't be meaningfully tested in this environment." The same reasoning applies here, harder — this is 15× the surface area.

**Decision: internal names (`Course`, `Enrollment`, `Student`) never change. Only the label a human sees changes, per tenant.** This is not a workaround — it is the same "core is fixed, customization is data" rule this codebase already runs its automation platform on (`TEMPLATE_CONTROL_CORE.md` §"The one-sentence model": *"Templates configure the core. They never extend it."*). This doc applies that rule to naming and packaging instead of just automation compounds.

---

## 2. What already exists — don't rebuild this

| Piece | Where | Reusable as-is? |
|---|---|---|
| Product/Order display aliasing over Course/Enrollment | `apps/web/lib/product-display.ts` (`courseToProductRow`), `apps/api/src/services/orderRowsService.ts` | **Yes** — proves presentation-layer aliasing over the same documents is already this codebase's idiom. The vocabulary layer generalizes this exact pattern. |
| `industry: string[]` tagging on automation compounds + templates | `packages/automation-flow/src/types.ts`, `apps/api/src/services/marketplaceService.ts` | Yes, for automation-template filtering — extend, don't duplicate |
| 9-domain sidebar/IA model (Home, Learning, Commerce, People, Automation Hub, Intelligence, Workspace, Listings, Administration, Settings) | `PRODUCT_ARCHITECTURE.md`, `packages/ui/src/Layout/DefaultNavigation.tsx` | Yes — the capability map (§6) reads this model, doesn't invent a new one |
| `SUPER_ADMIN` role, tenant switcher | `packages/db/src/user.ts` (`UserRole`), `SuperAdminTenantSwitchProvider.tsx` | Yes — gate the capability map the same way |
| Tenant branding (colors, logo, fonts) | `packages/db/src/tenant.ts` (`TenantBranding`) | Yes — vocabulary is a sibling field on the same `settings` object, same access pattern |
| Cross-industry automation pain map (8 industries scored, compound gaps identified) | `AUTOMATION_HUB_STRATEGY.md` §3 | Yes — funnel templates below reuse this table's build-status column directly |
| Planned "Phase C — Ops: Health dashboard (tenant count, lastActive, plan, CORS origins)" | `TENANT_LAYER_SUPERADMIN.md` §"Priority roadmap" | This doc's §6 *is* that already-planned item, scoped concretely |

---

## 3. Design — Tenant Vocabulary Layer

### Data model

```ts
// packages/db/src/tenant.ts — new field on ITenant.settings, sibling to `branding`
interface TenantVocabulary {
  course: string;       // default: "Course"
  enrollment: string;   // default: "Enrollment"
  student: string;      // default: "Student"
  instructor: string;   // default: "Instructor"
  certificate: string;  // default: "Certificate"
  group: string;        // default: "Group"
  order: string;        // default: "Order"
  product: string;      // default: "Product"
}
```

Every existing tenant gets the LMS defaults on read (no migration needed — `resolveVocabulary(tenant)` falls back to defaults exactly like `resolveAutomationStatus()` already falls back for legacy `Automation` rows without a `status` field). Zero-downtime, zero-migration, reversible by clearing the field.

### Resolution — one hook, incremental adoption

```ts
// packages/ui/src/hooks/useVocabulary.ts (new)
const { t } = useVocabulary(); // reads from LayoutUser/tenant context, same source as branding
<h1>{t('course', 'plural')}</h1>  // renders "Products" for a digital-products tenant, "Courses" for default
```

Adoption is file-by-file, not a single sweep — each PR swaps a handful of hardcoded strings for `t('course')` calls in one page or component, same discipline as the search/automation task batches already run through `docs/todo-orchestrator/`. No PR needs to touch more than the `AGENT_TASK_CARD.md` ≤400 LOC budget.

### Menu → Screen → Function → API → DB → Story → Acceptance

| Layer | Detail |
|---|---|
| **Menu** | Administration → Settings → **Vocabulary** (new leaf, sibling to existing Branding/Security) |
| **Screen** | `/organization/vocabulary` — one row per term (Course, Student, Enrollment, Instructor, Certificate, Group), text input + live preview pill showing where it appears (nav label, page title, storefront card) |
| **Function** | `updateTenantVocabulary(tenantId, vocabulary)` |
| **API** | `Mutation.updateTenantVocabulary` → `tenantService.updateVocabulary()` (new service method, same shape as existing `updateTenantBranding`) |
| **DB** | `Tenant.settings.vocabulary` (new sub-document, `_id: false`, defaults as above) |
| **User story** | "As a digital-product seller, I want 'Course' to say 'Product' everywhere in my admin and storefront so my team and customers aren't confused by LMS jargon." |
| **Acceptance criteria** | Changing "Course" in Settings → Vocabulary updates: the sidebar nav label, the `/courses` page `<h1>`, and the customer-facing storefront card — with zero URL or route change, verified by grep for remaining hardcoded "Course" JSX in the touched files. |

---

## 4. Design — Funnel Templates (digital products, agency/consulting, membership)

A **Funnel Template** is data, not code — the same idiom as `AutomationTemplate.flowDefinition` (`TEMPLATE_CONTROL_CORE.md` §"Two ways a template controls the core"), extended one level up from "a single automation" to "a whole go-live bundle":

```ts
interface FunnelTemplate {
  slug: string;
  industry: string[];               // reuses the existing tag vocabulary
  vocabularyPreset: TenantVocabulary;
  enabledModules: string[];         // feature flags on TenantConfig.features
  automationTemplateSlugs: string[]; // installs existing AutomationTemplate rows
  funnelStages: FunnelStage[];      // documentation/onboarding copy, rendered in the wizard
}
```

Installing one is three existing operations run in sequence: `updateTenantVocabulary`, toggle `TenantConfig.features`, `installAutomationTemplate` × N. **No new execution engine, no new bridge handlers required for the three verticals below** — confirmed against `AUTOMATION_HUB_STRATEGY.md` §3's existing build-status column.

### 4a. Digital products / info-products

| Funnel stage | LuxGen primitive today | Net-new? |
|---|---|---|
| Storefront listing | `/products` (already a Course alias, `courseToProductRow`) | No |
| Checkout | Existing order/enrollment flow | No |
| Instant delivery | Existing course-content access on enrollment | No |
| Post-purchase follow-up | `core.notification.send_email` action (existing) | No |
| Upsell / cross-sell | Repurpose the existing `abandoned-cart-reminder` graph template pattern into a "post-purchase upsell" template (same `wait` → `condition` → `send_email` shape, different trigger) | Template only — zero engine change |
| Vocabulary preset | `course → "Product"`, `enrollment → "Purchase"`, `certificate → (hidden via enabledModules)` | — |

**Assessment:** fully expressible today via vocabulary + existing automation templates + hiding cohort/certificate UI behind a feature flag. Cheapest of the three to ship.

### 4b. Agency & consulting services

| Funnel stage | LuxGen primitive today | Net-new? |
|---|---|---|
| Lead capture | `core.webhook.received` trigger (existing) | No |
| Client onboarding checklist | `learner.user.enrolled` → `learner.enrollment.add_to_group` (existing) | No |
| Deliverables tracking | Course modules, relabeled "Engagement milestones" | No |
| Recurring client status reports | `core.report.send_client_summary` — **already identified as net-new** in `AUTOMATION_HUB_STRATEGY.md` §3's "Agencies reselling white-label" row | One new action, already scoped there — this doc doesn't duplicate that work, it consumes it |
| Vocabulary preset | `course → "Engagement"`, `student → "Client"`, `instructor → "Consultant"` | — |

**Assessment:** mostly existing; the one gap (client summary report action) is already scoped as engineering work in a sibling doc, not invented here.

### 4c. Membership & community

| Funnel stage | LuxGen primitive today | Net-new? |
|---|---|---|
| Recurring billing | Confirmed by reading `packages/billing/src/` (`plans.ts`, `gates.ts`, `usage-limits.ts`): billing today is **tenant → LuxGen** (subscription plan gates), not **end-customer → tenant** recurring charges. A membership vertical needs the latter and it does not exist. | **Yes — genuine gap, not an assumption** |
| Drip content | `core.schedule.cron` + enrollment triggers (existing) | No |
| Community engagement (feed/discussion) | No equivalent feature exists anywhere in the codebase today | **Yes — genuine new infrastructure** |
| Vocabulary preset | `course → "Membership"`, `enrollment → "Subscription"` | — |

**Assessment — this is the one vertical that fails `TEMPLATE_CONTROL_CORE.md`'s own decision tree at step 3** ("does it need genuinely new infrastructure — new data model, new integration?"). A community/discussion feature is a real new data model (posts, threads, membership tiers), not a template. Per that doc's own rule: *"treat this as a scoped engineering task with its own review, not a template."* **Recommendation: ship the vocabulary preset and drip-content automation template now (cheap, real value); scope community-feed and end-customer recurring billing as a separate initiative, not bundled into this pass.** This is flagged explicitly in the task queue below rather than silently underscoped.

---

## 5. Design — AI Setup Wizard

Reuses `packages/agent` (currently Agent Studio's headless code-change pipeline) in a narrower, safer mode: **conversation → recommendation → apply existing mutations.** It never generates code or touches schema — it is an orchestration layer over the three mutations already defined in §3–4 (`updateTenantVocabulary`, feature-flag toggle, `installAutomationTemplate`).

| Layer | Detail |
|---|---|
| **Menu** | Shown once at tenant creation, and reachable later from Administration → **Setup Wizard** |
| **Screen** | `/onboarding/setup-wizard` — 4 questions ("What do you sell?", "One-time or recurring?", "Who's your customer — learners, clients, or members?", "Do you need certificates?") → a single recommendation card naming the matched Funnel Template, editable before applying |
| **Function** | `recommendFunnelTemplate(answers)` (pure mapping, no LLM call needed for v1 — a decision table over 4 answers is enough to pick one of the 3 templates) → `applyFunnelTemplate(tenantId, slug)` which fans out to the 3 existing mutations |
| **API** | `Query.recommendFunnelTemplate`, `Mutation.applyFunnelTemplate` |
| **DB** | No new writes beyond what §3/§4 already define — `applyFunnelTemplate` is a service-layer composition, not new storage |
| **User story** | "As a new tenant admin selling an online course plus a paid community, I answer 4 questions and get my vocabulary, storefront labels, and starter automations configured in minutes instead of clicking through half a dozen settings screens." |
| **Acceptance criteria** | Recommendation comes from a fixed, reviewable table (not freeform generation); the user sees and can edit the plan before it's applied; applying is idempotent — running it twice does not double-install automations or corrupt vocabulary. |

**Why a decision table instead of an LLM call for v1:** `BUSINESS_STRATEGY_2026.md` §11 already tracks **time-to-value** ("signup → first course published") as a core KPI. A deterministic 4-question table ships in one PR and improves that KPI immediately; an LLM-driven recommendation is a strictly-better v2 that can be layered on later without changing the `applyFunnelTemplate` contract. Ship the cheap version first.

---

## 6. Design — Super-Admin Tenant Capability Map

This is not a new capability from scratch — it is the concrete implementation of `TENANT_LAYER_SUPERADMIN.md`'s own already-documented Phase C item ("Health dashboard: tenant count, lastActive, plan, CORS origins") plus the gap that doc separately flags: *"No central tenant audit trail — hard to answer 'who changed tenant X?'"*

| Layer | Detail |
|---|---|
| **Menu** | Administration → **Tenant Map** (visible only to `SUPER_ADMIN`, same role check as `SuperAdminTenantSwitchProvider`) |
| **Screen** | `/organization/tenant-map?tenant=<subdomain>` — tenant picker, then a tree/table view: Domain (from the existing 9-domain `PRODUCT_ARCHITECTURE.md` model) → enabled/disabled (from `TenantConfig.features` + plan gate) → installed Funnel/Automation templates → current vocabulary preset |
| **Function** | Pure read aggregation — no mutation |
| **API** | `Query.tenantCapabilityMap(tenantId)` — composes `billingService.getEffectivePlan()`, `TenantConfig.features`, `marketplaceService` installed templates, and `Tenant.settings.vocabulary` — all data that already exists in separate queries today, just never joined into one view |
| **DB** | No new schema — read-only join across existing collections |
| **User story** | "As a super admin, I want to see at a glance which modules a tenant has turned on and why, so I can answer 'why can't they see X' without grepping four config files." |
| **Acceptance criteria** | Non-`SUPER_ADMIN` users get a 403/hidden nav item (mirrors existing `SuperAdminTenantSwitchProvider` gating); the page reflects a feature-flag or plan change within one page refresh (no new caching layer to invalidate). |

---

## 7. ROI framing

| Lever | Mechanism | Metric it moves (from `BUSINESS_STRATEGY_2026.md` §11) |
|---|---|---|
| **Lower bounce on first look** | A digital-product seller or agency owner who lands on a demo full of "Course/Student/Enrollment" jargon self-disqualifies before trialing — vocabulary removes that filter at zero engineering cost per new tenant | TAM access (implicitly widens niche #5 "Agency white-label" and adds an unranked digital-products niche) |
| **Faster time-to-value** | Setup Wizard collapses "configure vocabulary + pick modules + install starter automations" from ~30 minutes of settings-hunting to a 4-question flow | Time-to-value (signup → first product/engagement published) |
| **Lower support cost** | Tenant Capability Map answers "why can't they see X" without an engineer grepping config files | Not in the KPI table today — recommend adding "support tickets per 100 tenants" as a new tracked metric once this ships |
| **Expansion revenue path unchanged** | Funnel Templates are Marketplace data, same monetizable surface already planned in `BUSINESS_STRATEGY_2026.md` §6 ("Marketplace — automation templates... $19–$99") | Marketplace revenue stream |

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| Scope creep into a full `Course` → `X` rename | Explicitly rejected in §1 — internal names never change, only this doc's three additive layers ship |
| Membership vertical quietly ships without real community/recurring-billing support | §4c flags this openly; task queue splits it into "vocabulary + drip automation now" vs. "community feature, separate initiative" rather than shipping a half-built vertical silently |
| AI wizard mis-configuring a tenant | v1 uses a deterministic decision table (§5), not freeform generation; user previews and edits before apply; `applyFunnelTemplate` only calls already-reviewed mutations |
| Vocabulary adoption stalls at "just the Settings screen, none of the actual UI updated" | Task queue (§9) sequences nav + `/courses` page + storefront card as their own follow-up tasks with acceptance criteria, not left as "future work" |
| Capability map becomes stale relative to live feature flags | No new cache layer — always queries live, same tradeoff `TENANT_LAYER_SUPERADMIN.md` already accepts for its other read-only admin views |

---

## 9. Rollout phases → task queue (epic `E5`)

Each row below becomes a task card in `docs/todo-orchestrator/queue.yaml`, following the `AGENT_TASK_CARD.md` contract (≤400 LOC, one PR type, explicit touch list).

| Order | Task | Touch | Depends on |
|---|---|---|---|
| 1 | `T-VERT-01` — Tenant vocabulary schema + default resolver | `packages/db` | — |
| 2 | `T-VERT-02` — `updateTenantVocabulary` mutation + service | `apps/api` | T-VERT-01 |
| 3 | `T-VERT-03` — Settings → Vocabulary screen + `useVocabulary()` hook | `apps/web`, `packages/ui` | T-VERT-01, T-VERT-02 |
| 4 | `T-VERT-04` — Apply vocabulary to nav + `/courses` page copy | `apps/web`, `packages/ui` | T-VERT-03 |
| 5 | `T-VERT-05` — Apply vocabulary to storefront/customer-facing cards | `apps/web` | T-VERT-04 |
| 6 | `T-VERT-06` — `FunnelTemplate` model + digital-products seed | `packages/db`, `apps/api` | T-VERT-01 |
| 7 | `T-VERT-07` — Funnel seed: agency & consulting | `apps/api` | T-VERT-06 |
| 8 | `T-VERT-08` — Funnel seed: membership (vocabulary + drip automation **only** — community/billing explicitly out of scope, see §4c) | `apps/api` | T-VERT-06 |
| 9 | `T-VERT-09` — Funnel Templates tab in Marketplace UI | `apps/web` | T-VERT-06 |
| 10 | `T-VERT-10` — Setup Wizard: decision-table recommendation + apply flow (**SPLIT before enqueue** — screen, recommendation logic, and apply-mutations are three task cards, not one) | `apps/web`, `apps/api` | T-VERT-06, T-VERT-03 |
| 11 | `T-VERT-11` — Super-admin Tenant Capability Map page | `apps/web`, `apps/api` | T-VERT-01 |

Community-feed and end-customer recurring billing for the membership vertical are **not** in this table — per §4c and `TEMPLATE_CONTROL_CORE.md`'s own decision tree, they need their own scoped initiative with its own review, not a line item here.

---

*Document owner: Product/Eng. Review after Phase 1 (T-VERT-01 through T-VERT-05) ships.*

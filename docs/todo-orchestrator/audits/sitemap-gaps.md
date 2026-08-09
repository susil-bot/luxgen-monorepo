# Sitemap gaps — `T-E0-05`

> Source window: `docs/TODO-sitemap.md` **L1–L220** (Dashboard + Learning + Commerce; Automation L1 header)  
> Nav source of truth: `packages/ui/src/Layout/DefaultNavigation.tsx` → `DEFAULT_SIDEBAR_SECTIONS` / `getDefaultSidebarSections()`  
> Pages: `apps/web/pages/**`  
> Date: 2026-08-03 · Product code: **none**

Status: `wired` = page + sidebar href · `partial` = page exists but path/label/IA differs from sitemap · `missing` = no matching page (and usually no nav)

**Note:** Automation L2+ and Analytics L1/L2 trees start **after L220**. Those rows below use sitemap L1/L2 **labels** from the tree outline + nav/pages so AC covers Learning / Commerce / Automation / Analytics. Deep route audits → `T-MAP-02` / `T-MAP-03`.

---

## Summary

| L1 area | Sitemap (aspirational) | Nav (`DEFAULT_SIDEBAR_SECTIONS`) | Overall |
| --- | --- | --- | --- |
| Learning | `/learning/*` tree | Section **Learning** — Courses (+ children) only | partial |
| Commerce | `/commerce/*` tree | Section **Commerce** — Products, Orders, Customers | partial |
| Automation | Workflows / Templates / Triggers / Schedules (+ AI sibling L1) | Section **Automation Hub** — Automations, Marketplace; Agent Studio under Administration | partial |
| Analytics | Dashboard / Learning / Commerce / Automation / AI / Custom Reports | Section **Intelligence** — single Analytics item; course/group analytics under Learning/Teams | partial |

**Bottom line:** Shipped IA uses flat routes (`/courses`, `/products`, `/orders`, `/automations`, `/analytics`) — **not** `/learning/*` or `/commerce/*`. Many sitemap L2 modules (quizzes, coupons, invoices, affiliates, …) have **no page and no nav**.

---

## Nav source of truth (sidebar)

| Section id | Title | Top-level hrefs |
| --- | --- | --- |
| `home` | Home | `/dashboard` |
| `learning` | Learning | `/courses` (+ my-courses, create, analytics) |
| `commerce` | Commerce | `/products`, `/orders` (+ drafts/abandoned), `/admin/customers` (+ segmentation/create) |
| `people` | People | `/organization/users`, `/organization/roles`, `/organization/groups` |
| `automation-hub` | Automation Hub | `/automations` (+ tower, runs), `/marketplace` |
| `intelligence` | Intelligence | `/analytics` |
| `workspace` | Workspace | `/project/*` |
| `listings` | Listings | `/listings`, `/listings/my`, `/admin/listings` |
| `administration` | Administration | `/organization/security`, `/organization/billing`, `/agent` |
| `settings` | Settings | `/profile`, `/settings` |

Flat legacy list `getDefaultNavItems()` still exposes `/courses`, `/groups`, `/users`, `/analytics`, `/settings` for simpler layouts — **AppLayout pages use `getDefaultSidebarSections()`**.

---

## Learning (sitemap L12–110)

| Sitemap L2 | TODO path pattern | Nav? | Page(s) | Status |
| --- | --- | --- | --- | --- |
| Courses | `/learning/courses` (+ detail/new/edit) | Yes → `/courses*` | `courses.tsx`, `courses/[id]`, `create`, `[id]/edit`, `analytics`, `my-courses` (nav) | partial — path prefix `/courses` not `/learning/courses` |
| Lessons | `/learning/lessons/:id/edit\|preview` | No | No dedicated lesson routes under `pages/` | missing |
| Quizzes | `/learning/quizzes*` | No | No `pages/quizzes*` | missing |
| Certificates | `/learning/certificates*` | Yes → `/certificates` (+ learner `/learn/certificates`) | Admin issued list `pages/certificates/index.tsx` + `issuedCertificates`; designer still missing | partial — issued wired (T-MAP-01); designer deferred |

| Learning Paths | `/learning/paths*` | No | — | missing |
| Assignments | `/learning/assignments*` | No | — | missing |
| Categories | `/learning/categories` | No | — | missing |
| *(learner)* | — | No dedicated “My Learning” in sidebar | `learn/index.tsx`, `learn/courses/[id]`, `customers/index.tsx` | partial — exists off-nav or alternate IA |

**Enqueue hint:** `T-MAP-01` — pick one vertical (likely Quizzes or Certificates admin, or unify `/learning` redirects).

---

## Commerce (sitemap L111–218)

| Sitemap L2 | TODO path pattern | Nav? | Page(s) | Status |
| --- | --- | --- | --- | --- |
| Products | `/commerce/products*` | Yes → `/products` | `products/index`, `create`, `[id]/edit` | partial — no `/commerce` prefix; detail tabs incomplete vs TODO |
| Orders | `/commerce/orders*` (+ abandoned) | Yes → `/orders*` | `orders/index`, `[id]`, `create`, `drafts`, `abandoned` | partial |
| Coupons | `/commerce/coupons*` | No | — | missing |
| Subscriptions | `/commerce/subscriptions*` | No | Learner `learn/subscriptions`; org billing ≠ commerce subs | missing (admin commerce) |
| Payments | `/commerce/payments*` | No | — | missing (billing ≠ payment list) |
| Invoices | `/commerce/invoices*` | No | — | missing |
| Affiliates | `/commerce/affiliates*` | No | — | missing |
| Customers* | *(Commerce Experience TODO; not named in this L1–220 tree)* | Yes → `/admin/customers*` | Admin CRUD + segmentation | wired (nav) — see `commerce-gaps.md` |
| Bundles* | — | No admin | `store/bundles*` storefront only | partial |

\*Customers/bundles called out because they appear in live Commerce nav / prior E3 audit though not as L2 under this sitemap slice.

**Enqueue hint:** Coupons / subscriptions / payments already map to `T-COM-05` / `T-COM-06`; don’t invent `/commerce/*` URL tree unless product migrates.

---

## Automation (sitemap L219+; L2 outline after window)

| Sitemap L2 (outline) | Nav? | Page(s) | Status |
| --- | --- | --- | --- |
| Workflows | Yes → Automations `/automations` (+ Tower, Run Logs) | `automations/index`, `tower/*`, `tower/runs` | partial — live builder ≠ full Workflows tree |
| Templates | No dedicated nav | Marketplace templates partial | partial / missing admin template browser |
| Triggers | No | Config inside tower editor | partial (embedded) |
| Schedules | No | — | missing |
| AI Agents (sibling L1 “AI”) | Yes → Agent Studio `/agent` (Administration) | `agent.tsx`, `admin/agent-tasks` | partial — not under Automation Hub section |
| Marketplace (sitemap later L1) | Yes → `/marketplace` | `marketplace/index` | partial |

**Enqueue hint:** `T-MAP-02` — add missing Automation/AI nav items or accept hub IA and document.

---

## Analytics (sitemap L389–487; closed by `T-MAP-03`)

> Source window: `docs/TODO-sitemap.md` L389–487. Nav source of truth unchanged
> (`DEFAULT_SIDEBAR_SECTIONS` → single `Analytics` item under `Intelligence`, linking to the hub
> below). This task's touch is `apps/web` only — no new GraphQL fields, so anything needing data
> the client can't already query is deferred, not stubbed with fake numbers.

| Sitemap L2 route (aspirational) | Status | Notes |
| --- | --- | --- |
| Analytics Dashboard (`/analytics`) | wired | `analytics/index.tsx` hub, `PlanGate feature="analytics"`, links out below |
| Learning → Course Analytics (`/analytics/learning/courses`) | wired (alt URL) | `courses/analytics.tsx`, linked from the hub as "Course analytics" |
| Learning → Learner/Instructor/Content Analytics | deferred | No underlying query for per-learner time-spent, instructor revenue attribution, or lesson-level engagement; needs new GraphQL fields (out of apps/web-only scope) |
| Commerce Analytics (all 4 sub-routes) | deferred | No revenue/funnel/LTV/churn queries exist yet; `admin/customers` has record-level data but no aggregate revenue dashboard |
| Automation Analytics → Workflow Performance (`/analytics/automation/workflows`) | tracked separately | See `T-AUTO-08` — same gap, already queued as its own task to avoid duplicate work |
| Automation Analytics → Email Performance | deferred | No email-open/click tracking exists in the automation bridge yet |
| AI Analytics (usage + performance) | deferred | No token/cost/latency metrics are captured anywhere today — this is a new instrumentation project, not a page-wiring gap |
| Custom Reports (builder/list/viewer) | deferred | Full report-builder feature, several epics of scope on its own — not a sitemap-nav fix |
| Exports (`/analytics/exports`) | deferred | No export job history model exists |

**Bottom line:** of 15 aspirational sub-routes, 2 (Course + Group analytics) are already wired
under alternate URLs and cross-linked from the hub; 1 (Workflow analytics) is tracked as its own
task (`T-AUTO-08`) rather than duplicated here; the remaining 12 need new backend data models and
queries before there's anything real to render — building empty/fake pages for those would violate
"no fabricated results." Deferred, not stubbed.

**Enqueue hint (any future work):** pick ONE of Commerce Analytics or AI Analytics as the next
slice once the underlying aggregate query exists; don't build the report builder as a nav task.

---

## Marketplace (sitemap L488–557; closed by `T-MAP-04`)

> Source window: `docs/TODO-sitemap.md` L488–557 (Browse/Item Details/My Items/Publish/Reviews).
> Touch: `apps/web` only — no new GraphQL fields or models.

| Sitemap L2 route | Status | Notes |
| --- | --- | --- |
| Marketplace Home (`/marketplace`) | wired | `marketplace/index.tsx` |
| Browse → Search & Filters / Sort | wired (this task) | Added search box + category select + featured-only toggle over templates already fetched via `GET_AUTOMATION_TEMPLATES` |
| Browse → Category View, Search Results (separate routes) | deferred | Client-side filter above covers the same user need on one page; a separate `/marketplace/category/:id` or `/marketplace/search` route would fragment state for no benefit at this catalog size |
| Item Details (course/workflow/template/agent/integration) | deferred | No per-item detail/reviews/documentation data model exists — templates today are catalog rows, not entities with their own page |
| My Items → Installed | **not applicable — different model** | Installing a template creates a live `Automation` immediately (see `installTemplate` mutation); there's no separate "installed items" list to build because `/automations` already *is* that list. Bridged via the existing "← Back to automations" link |
| My Items → Purchases | deferred | No purchase/payment records exist for marketplace items (templates are free/plan-gated, not individually priced+purchased) |
| Publish (seller dashboard, listings, publish flow) | deferred | Full multi-sided-marketplace seller feature — new `Seller`/`Listing` models, payout settings, a review queue; this is a product decision, not a nav-wiring gap |
| Reviews (leave/manage) | deferred | No review/rating model exists on `AutomationTemplate` |

**Bottom line:** the one real Browse gap (search/filter/sort) is wired against existing data.
Everything else needs new backend models this apps/web-only task can't add, or doesn't apply
because LuxGen's install-is-instant model already fulfills the spec's intent through a different
route. Templates for those, if ever prioritized, are a Marketplace v2 project, not a queue task.

---

## Dashboard (sitemap L5–11; closed by `T-MAP-08`)

> Touch: `apps/web/pages/dashboard.tsx` only. `AdminDashboardLayout` (packages/ui) already has
> slots for all 4 widgets below — the gap was apps/web not always feeding them.

| Sitemap widget | Status | Notes |
| --- | --- | --- |
| Overview landing | wired | Page exists, banner carousel + onboarding slot |
| KPI (stats tiles) | wired | `transformDashboardData` maps `stats` (courses/students/completion/groups) from `GET_DASHBOARD_DATA` |
| Recent Activity | wired | `transformDashboardData` maps `recentActivities` from the same query |
| Quick Actions | **wired (this task)** | Layout slot existed but nothing fed it — added 4 real actions (Create course, Go to automations, Manage users, View analytics) directly in `dashboard.tsx`, merged onto `transformedDashboardData` so `lib/transformer.ts` didn't need touching |
| Shortcuts | deferred | No distinct "Shortcuts" concept in the data model beyond Quick Actions above — spec doesn't distinguish them from Quick Actions in the widget mockup either; treating as covered rather than inventing a second, redundant action list |

---

## Recommended enqueue (from this audit)

| Task | Why |
| --- | --- |
| `T-MAP-01` | Learning L2 missing (quizzes/paths/assignments) or certificates admin |
| `T-MAP-02` | Automation/AI sitemap vs Automation Hub + Agent Studio placement |
| `T-MAP-03` | Analytics L2 beyond single `/analytics` |
| `T-MAP-08` | Dashboard widgets vs live page |
| E3 (`T-COM-05`+) | Commerce L2 missing (coupons, payments, …) — already queued |

Do **not** bulk-rename to `/learning/*` / `/commerce/*` without an explicit migration decision.

---

## Acceptance check (`T-E0-05`)

- [x] Missing/partial routes table for **Learning**, **Commerce**, **Automation**, **Analytics**  
- [x] Uses `DefaultNavigation.tsx` (`DEFAULT_SIDEBAR_SECTIONS`) as nav source of truth  
- [x] No product code changes  

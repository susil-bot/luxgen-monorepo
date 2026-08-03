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

## Analytics (sitemap L389+; outside L1–220)

| Sitemap L2 (outline) | Nav? | Page(s) | Status |
| --- | --- | --- | --- |
| Analytics Dashboard | Yes → `/analytics` | `analytics/index.tsx` | partial — verify live vs widgets |
| Learning Analytics | Via Courses → Course Analytics | `courses/analytics.tsx`; also `groups/analytics.tsx` | partial — not nested under Intelligence |
| Commerce Analytics | No | — | missing |
| Automation Analytics | No | — | missing (`T-AUTO-08`) |
| AI Analytics | No | — | missing |
| Custom Reports | No | — | missing |

**Enqueue hint:** `T-MAP-03` — close Analytics L2 gaps; keep PlanGate on premium analytics.

---

## Dashboard (sitemap L5–11; feeds `T-MAP-08`)

| Sitemap widget | Live `/dashboard` | Status |
| --- | --- | --- |
| Overview landing | Page exists | wired |
| Quick Actions / Recent Activity / KPI / Shortcuts | Deferred detail | unknown → `T-MAP-08` |

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

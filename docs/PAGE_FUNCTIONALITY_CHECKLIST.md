# LuxGen — Page Functionality Checklist

> Every route in `apps/web` and `apps/mobile`, grouped by business domain (see `docs/PRODUCT_ARCHITECTURE.md`), with what each page does and a checkbox to track review/QA status. Source of truth for routes: `packages/ui/src/Layout/DefaultNavigation.tsx` (web sidebar) + a live `find apps/web/pages` scan. Nav-tree view: `docs/MENU_STRUCTURE.md`. Feature-level docs: `docs/FEATURE_CATALOG.md`.
>
> **Checkbox meaning:** unchecked = not yet verified against GraphQL/live data this pass (or known mock/gap, see Known Issues); checked = confirmed wired to real data and behaving as described. Update this file whenever a page is added, renamed, or its data source changes.
>
> **Note on a prior version of this doc:** an earlier pass flagged three "redundant surfaces" (billing, users, groups) as unresolved duplication needing a product decision. That was wrong — it was based on a route inventory without reading file content. All three are already correctly resolved via `@deprecated` server-side redirects (`/billing` → `/organization/billing`, `/users` → `/organization/users`, `/groups` → `/organization/groups`), which is the standard, correct pattern for retiring an old URL. See "Deprecated redirect stubs" below and `docs/PRODUCT_ARCHITECTURE.md` for the verification detail. The one real bug found in the process (`/admin/users` double-redirecting through `/users` instead of going straight to `/organization/users`) has been fixed.

---

## Home

| Route | Functionality |
| --- | --- |
| `/dashboard` | Landing page post-login. Quick Actions, Recent Courses, Recent Groups, Admin Tools — role-scoped panels |

- [ ] `/dashboard` — panels wired to live GraphQL (`getDashboardData`), not just nav shortcuts

---

## Learning

| Route | Functionality |
| --- | --- |
| `/courses` | All Courses — list/search/filter |
| `/courses/create` | Create Course wizard |
| `/courses/[id]` | Course detail (content, enrollment) |
| `/courses/[id]/edit` | Edit course metadata/content |
| `/courses/analytics` | Course Analytics — completion rate, engagement (Pro plan gate) |
| `/certificates` | **Issued certificates** (admin) — tenant completed enrollments + expiry |

- [ ] `/courses` — pagination, tenant scoping
- [ ] `/courses/create` — multi-step validation, draft save
- [ ] `/courses/[id]` — enrollment CTA, progress display
- [ ] `/courses/[id]/edit` — permission check (owner/admin only)
- [ ] `/courses/analytics` — confirm live data (flagged as partially mock in `CODEBASE.md` Known Issues)
- [x] `/certificates` — wired via `issuedCertificates` (T-MAP-01); shows learner, course, issued/expiry, verification code

### Learning sitemap gaps — T-MAP-01 decision

Highest-traffic gap closed: **Certificates → Issued** (`/certificates`, flat route; sitemap `/learning/certificates/issued`).

**Explicitly deferred** (no page/nav this PR — enqueue later):

| Sitemap item | Route (aspirational) | Reason deferred |
| --- | --- | --- |
| Lessons editor / preview | `/learning/lessons/*` | Needs curriculum model beyond course metadata |
| Quizzes list / builder | `/learning/quizzes*` | Greenfield; larger than M SLA |
| Certificate designer | `/learning/certificates/:id/edit` | Design canvas not started |
| Learning paths | `/learning/paths*` | Greenfield |
| Assignments | `/learning/assignments*` | Greenfield |
| Categories | `/learning/categories` | Greenfield |
| Path prefix `/learning/*` | — | Keep flat `/courses` `/certificates` until migration decision |

---

## Commerce

| Route | Functionality |
| --- | --- |
| `/products` | Product catalog list |
| `/products/create` | New product (price, type, inventory) |
| `/products/[id]/edit` | Edit product |
| `/orders` | Order list, status filters |
| `/orders/create` | Manual order creation |
| `/orders/drafts` | Draft (unpaid) orders |
| `/orders/abandoned` | Abandoned checkouts — feeds the `commerce.order.drafted` automation trigger and the abandoned-cart-reminder template |
| `/orders/[id]` | Order detail |
| `/orders/[id]/edit` | Edit order (status, line items) |
| `/admin/customers` | Admin customer list |
| `/admin/customers/create` | Add customer |
| `/admin/customers/segmentation` | Segment customers (for targeted automations/campaigns) |
| `/admin/customers/[id]` | Customer detail |
| `/admin/customers/[id]/edit` | Edit customer |

- [ ] `/products` — filter/search, plan-gated product limits
- [ ] `/products/create` — Stripe price sync
- [ ] `/orders` — real-time status sync with payment provider
- [ ] `/orders/drafts` — drafts correctly exclude completed orders
- [ ] `/orders/abandoned` — matches `paymentStatus != PAID` query used by automation condition
- [ ] `/admin/customers/segmentation` — confirm segments feed into marketing/automation targeting, not display-only

---

## People

| Route | Functionality |
| --- | --- |
| `/organization/users` | Manage org users — canonical; `/users` and `/admin/users` both redirect here (see below) |
| `/organization/roles` | Role/permission management |
| `/organization/groups` | Teams — canonical list page; links into `/groups/create`, `/groups/analytics`, `/groups/[id]`, `/groups/[id]/edit`, `/groups/[id]/members` for CRUD. `/groups` (bare) redirects here. |
| `/groups/create` | Create team |
| `/groups/analytics` | Team analytics |
| `/groups/[id]` | Team detail |
| `/groups/[id]/edit` | Edit team |
| `/groups/[id]/members` | Manage members |
| `/groups/dashboard` | Team-level dashboard (linked from within the groups flow, not the sidebar) |

- [ ] `/organization/roles` — RBAC actually enforced server-side, not just UI-gated
- [ ] `/groups/[id].tsx` — **known mock data** per `CODEBASE.md` Known Issues; wire to GraphQL
- [ ] `/groups/dashboard.tsx` — **known mock data** per `CODEBASE.md` Known Issues; wire to GraphQL
- [ ] `/groups/[id]/members` — invite/remove flows live

---

## Automation Hub

| Route | Functionality |
| --- | --- |
| `/automations` | Automations overview |
| `/automations/tower` | Tower flow-builder canvas (trigger→condition→action→wait graph) |
| `/automations/tower/[id]` | Edit a specific flow |
| `/automations/tower/runs` | Run history/logs |
| `/marketplace` | Template marketplace — one-click install, `industry`-filterable |

- [ ] `/automations/tower` — UI supports the industry-tagged compounds shipped in the automation hub work (recert reminder, abandoned cart) end-to-end
- [ ] `/automations/tower/runs` — run logs reflect live-condition re-evaluation after `wait` nodes
- [ ] `/marketplace` — `industry` filter UI control exists and calls `automationTemplates(industry: ...)`

---

## Intelligence

| Route | Functionality |
| --- | --- |
| `/analytics` | Revenue + engagement dashboard (Pro plan gate via `PlanGate`) |

- [ ] `/analytics` — confirmed live GraphQL, not mock (cross-check `CODEBASE.md` Known Issues)

---

## Workspace (internal)

| Route | Functionality |
| --- | --- |
| `/project/iteration/current` | Ongoing sprint/iteration view |
| `/project/iteration/next` | Next iteration planning |
| `/project/priority` | Priority queue |
| `/project/workflows` | "My workflows" |

- [ ] All four — confirm tenant-facing vs. internal-only scope; not yet covered in `FEATURE_CATALOG.md`

---

## Listings

| Route | Functionality |
| --- | --- |
| `/listings` | Public directory |
| `/listings/apply` | Apply to be listed (paid, editorial review) |
| `/listings/my` | Applicant's own listing(s) |
| `/listings/edit/[id]` | Edit a listing |
| `/admin/listings` | Review queue (approve/reject) |

- [ ] `/listings/apply` — Stripe checkout for listing fee
- [ ] `/admin/listings` — reviewer approve/reject writes back to `BusinessListing` status

---

## Administration

| Route | Functionality |
| --- | --- |
| `/organization/security` | Security overview |
| `/organization/security/activity` | Login/activity audit log |
| `/organization/security/domains` | Verified domains (SSO) |
| `/organization/security/saml` | SAML SSO config |
| `/organization/security/scim` | SCIM provisioning config |
| `/organization/security/store` | Security settings storage/config |
| `/organization/billing` | Billing — canonical; `/billing` redirects here, and the sidebar's former duplicate Settings→Billing entry was removed |
| `/agent` | Agent Studio — AI-assisted codebase changes, chat-driven, with approval gates |
| `/developer` | Developer hub landing (not linked from sidebar — sidebar goes straight to `/agent`) |

- [ ] `/organization/security/saml`, `/scim` — Enterprise plan gate confirmed
- [ ] `/agent` — full stage→commit→PR→merge loop tested end-to-end (see `docs/AGENT_ORCHESTRATOR.md`)

---

## Settings

| Route | Functionality |
| --- | --- |
| `/settings` | Settings landing |
| `/settings/general` | General tenant settings |
| `/settings/branding` | Logo/colors/tenant branding |
| `/settings/storefront` | Storefront config (for `/store/*` pages) |
| `/settings/notifications` | Notification preferences |
| `/settings/security` | Account security (2FA, sessions) |
| `/settings/staff` | Staff accounts |
| `/settings/profile` | Profile settings (duplicate of top-level `/profile`?) |
| `/profile` | User profile |

- [ ] `/settings/profile` vs `/profile` — confirm intended difference or merge (still open — unlike billing/users/groups, this one is not resolved via a redirect stub; genuinely worth a product decision)
- [ ] `/settings/storefront` — changes actually reflect on live `/store/*` pages

---

## Storefront (public-facing commerce, per tenant — not in admin sidebar)

| Route | Functionality |
| --- | --- |
| `/store` | Storefront home |
| `/store/[slug]` | Tenant storefront by slug |
| `/store/product`, `/store/product/[id]` | Product listing / detail |
| `/store/bundles`, `/store/bundles/[id]` | Bundle listing / detail |
| `/store/collections`, `/store/collections/[id]` | Collection listing / detail |
| `/store/mentors`, `/store/mentors/[id]` | Mentor listing / detail |

- [ ] Cart/checkout flow feeds `commerce.order.drafted` → abandoned-cart automation correctly
- [ ] `/store/[slug]` tenant resolution matches subdomain routing convention

---

## Learner experience (`/learn/*` — not in admin sidebar, separate persona)

| Route | Functionality |
| --- | --- |
| `/learn` | Learner home |
| `/learn/courses/[id]` | Course player/content view |
| `/learn/certificates` | Earned certificates |
| `/learn/subscriptions` | Active subscriptions |

- [x] `/learn/certificates` — list + verification code + `certificateExpiresAt` when set (T-MAP-01)
- [ ] `/learn/courses/[id]` — progress persists and drives `COURSE_COMPLETED` trigger

---

## Misc top-level (not in admin sidebar)

| Route | Functionality |
| --- | --- |
| `/mentors` | Mentor directory (admin-side, distinct from `/store/mentors`) |
| `/search` | Global search |
| `/customers` | Learner/customer-facing list, distinct from `/admin/customers` |
| `/admin/agent-tasks` | Agent Studio background task monitor |
| `/404`, `/500` | Error pages |
| `/sitemap.xml` | SEO sitemap |
| `/banner-demo` | Internal component demo — confirm not linked in production nav |

---

## Mobile app (`apps/mobile`, Expo Router)

### Auth group `(auth)`
| Route | Functionality |
| --- | --- |
| `login` | Mobile sign-in |

### Learner group `(learner)`
| Route | Functionality |
| --- | --- |
| `splash`, `onboarding`, `sign-in`, `sign-up`, `sign-up-form`, `forgot-password`, `reset-password`, `reset-success`, `otp`, `questions`, `congratulations`, `home` | Auth + onboarding + learner home flow |

### Tabs group `(tabs)`
| Route | Functionality |
| --- | --- |
| `dashboard`, `courses`, `enrollments`, `chat`, `profile` | Mobile's current domain coverage: Home + Learning only |

### Other
| Route | Functionality |
| --- | --- |
| `courses/[id]` | Course detail |

- [ ] Mobile has no equivalent yet for Automation Hub/Marketplace/Billing/People/Administration —
      confirmed intentional scope per `docs/PRODUCT_ARCHITECTURE.md` (Learning + Home domains
      only, for now), not a gap

---

## Deprecated redirect stubs (correctly resolved duplication, not a bug)

| Old route | Redirects to | File |
| --- | --- | --- |
| `/users` | `/organization/users` | `apps/web/pages/users.tsx` |
| `/billing` | `/organization/billing` | `apps/web/pages/billing/index.tsx` |
| `/groups` | `/organization/groups` | `apps/web/pages/groups/index.tsx` |
| `/admin/users` | `/organization/users` (fixed — previously bounced through `/users` first) | `apps/web/pages/admin/users.tsx` |

All four are intentional `@deprecated` server-side redirects, the standard pattern for retiring an
old URL without breaking bookmarks/links. Not unresolved duplication.

## Known cross-cutting issues (from `docs/technical/development/CODEBASE.md` § Known Issues)

- [ ] 120 pre-existing TS errors in `@luxgen/ui` — tracked, not blocking build (`ignoreBuildErrors: true` in `next.config.js`); should still be paid down opportunistically
- [ ] Mock data in `pages/groups/[id].tsx` and `pages/groups/dashboard.tsx` — wire to GraphQL
- [ ] SVG NaN warning in `UserRetention` chart component

## Still-open naming/consolidation question (genuinely unresolved, unlike billing/users/groups above)

- [ ] `/profile` vs `/settings/profile` — no redirect exists between these two; unlike the
      billing/users/groups cases, this one needs an actual product decision (merge, or clearly
      differentiate what each is for)

---

*Generated as a snapshot checklist — update in place as pages ship, merge, or get removed. Cross-reference `docs/FEATURE_CATALOG.md` for the feature-level (not page-level) view, and `docs/PRODUCT_ARCHITECTURE.md` for why pages are grouped this way.*

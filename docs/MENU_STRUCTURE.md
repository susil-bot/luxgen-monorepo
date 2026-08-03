# LuxGen — Current Live Menu & Submenu Structure

> Extracted directly from `packages/ui/src/Layout/DefaultNavigation.tsx` → `DEFAULT_SIDEBAR_SECTIONS` (exported as `getDefaultSidebarSections()`), which is confirmed wired into `AppLayout`'s `sidebarSections` prop across the app. **This is the real, current menu.**
>
> **2026 domain-model rework:** the sidebar is now grouped by business domain (Home, Learning, Commerce, People, Automation Hub, Intelligence, Workspace, Listings, Administration, Settings) instead of a flat code-shaped list. Rationale for every grouping decision: `docs/PRODUCT_ARCHITECTURE.md`. **No URLs changed** in this rework — every `href` below is identical to before, only the section grouping and a couple of labels moved (see "What changed" below).
>
> For what each page actually *does*, see `docs/PAGE_FUNCTIONALITY_CHECKLIST.md` — this doc is the structural map, that one is the functional detail.

---

## Section: Home

- **Dashboard** → `/dashboard`

## Section: Learning

- **Courses** → `/courses`
  - All Courses → `/courses`
  - My Courses → `/courses/my-courses`
  - Create Course → `/courses/create`
  - Course Analytics → `/courses/analytics`

## Section: Commerce

- **Products** → `/products`
- **Orders** → `/orders` *(badge: live count)*
  - Drafts → `/orders/drafts`
  - Abandoned checkouts → `/orders/abandoned`
- **Customers** → `/admin/customers`
  - All customers → `/admin/customers`
  - Segmentation → `/admin/customers/segmentation`
  - Add customer → `/admin/customers/create`

## Section: People

- **Users** → `/organization/users`
- **Roles** → `/organization/roles`
- **Teams** → `/organization/groups` *(label renamed from "Groups" — same URL. This page links into `/groups/create`, `/groups/analytics`, `/groups/[id]`, `/groups/[id]/edit`, `/groups/[id]/members` for the actual CRUD flows; verified via its `router.push` calls, not assumed.)*

## Section: Automation Hub

*(internal section `id` is `automation-hub`, fixed from a previous `id: 'developer'`/`title: 'Automations'` mismatch)*

- **Automations** → `/automations`
  - Tower → `/automations/tower`
  - Recent Run Logs → `/automations/tower/runs`
- **Marketplace** → `/marketplace`

## Section: Intelligence

- **Analytics** → `/analytics`

## Section: Workspace

- **Project** → `/project/iteration/current`
  - Ongoing iteration → `/project/iteration/current`
  - Next iteration → `/project/iteration/next`
  - Priority → `/project/priority`
  - My workflows → `/project/workflows`

## Section: Listings

- **Directory** → `/listings`
- **My applications** → `/listings/my`
- **Review queue** → `/admin/listings`

## Section: Administration

- **Security** → `/organization/security`
- **Billing** → `/organization/billing`
- **Agent Studio** → `/agent` *(moved here from a standalone "Developer" section — matches the domain model's Administration scope: tenant-wide config + Agent Studio)*

## Section: Settings

- **Profile** → `/profile`
- **Settings** → `/settings`

*(The duplicate "Billing" entry that previously also appeared here, pointing at the same `/organization/billing` URL as Administration, was removed — Settings is personal-only per the domain model; see `docs/PRODUCT_ARCHITECTURE.md`.)*

---

## What changed in this pass (vs. the previous flat grouping)

- Sections regrouped by business domain instead of "Navigation / Organization / Automations /
  Listings / Developer / Settings".
- "Groups" relabeled "Teams" (People section) — same `/organization/groups` URL.
- "Automations" section title changed to "Automation Hub"; its internal `id` fixed from
  `'developer'` to `'automation-hub'` (was a leftover naming mismatch, not a bug affecting
  behavior, but confusing to anyone reading the source).
- Standalone "Developer" section (previously just Agent Studio) folded into "Administration".
- "Organization" section's Users/Roles/Teams moved to the new "People" section; Security/Billing
  stayed, now under "Administration".
- Duplicate Settings → Billing sidebar entry removed (Administration already links there).
- `/admin/users`'s redirect fixed to go straight to `/organization/users` instead of bouncing
  through `/users` first (both are `@deprecated` redirect stubs; this just removes an
  unnecessary extra hop).
- **Zero URL changes.** Every route above was live before this pass; only where it's grouped
  in the sidebar and a couple of labels moved.

## Pages that exist but aren't in this sidebar tree at all

Cross-referenced against the full route scan in `PAGE_FUNCTIONALITY_CHECKLIST.md`. Still true
after this rework — these are reachable by direct URL / deep-link only, not from any sidebar item:

- Learner-facing: `/learn`, `/learn/courses/[id]`, `/learn/certificates`, `/learn/subscriptions`
- Storefront (public, per-tenant): `/store`, `/store/[slug]`, `/store/product*`, `/store/bundles*`, `/store/collections*`, `/store/mentors*`
- `/mentors` (admin-side mentor directory)
- `/customers` (top-level, distinct from `/admin/customers` — learner-facing vs. admin)
- `/settings/general`, `/settings/branding`, `/settings/storefront`, `/settings/notifications`, `/settings/security`, `/settings/staff`, `/settings/profile` — only the `/settings` landing page itself is in the sidebar; its sub-pages are reachable only from inside that page
- `/developer` (developer hub landing — sidebar links straight to `/agent`, skipping this)
- Auth pages (expected, no sidebar needed pre-login): `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`
- `/search`, `/banner-demo`, `/admin/agent-tasks`

## Deprecated redirect stubs (correctly resolved duplication, not a bug)

`/users`, `/billing`, `/groups` are all `@deprecated` server-side redirects to their
`/organization/*` canonical equivalent. This is the established, correct pattern for retiring an
old URL without breaking existing links/bookmarks — **not** unresolved redundancy. An earlier
version of `PAGE_FUNCTIONALITY_CHECKLIST.md` flagged these as a "redundant-surface audit" item
needing a product decision; that was wrong (based on a route inventory, not file content) and has
been corrected there.

## Confirmed-dead code removed in this pass

`getDefaultMenuItems()` (also exported from this file) had zero real component consumers — its
only references were a self-referential barrel export and stale docs — and several of its hrefs
pointed at routes that don't exist (`/reports/generate`, `/users/invite`, `/admin/settings`,
`/admin/audit`, `/courses/react-advanced`, `/groups/1`, `/groups/2`). Removed.

`getDefaultNavItems()` (the *other* function in this file previously also suspected of being dead
scaffolding) is **not** dead — `packages/ui/src/UserDashboardLayout/UserDashboardLayout.tsx` and
`AdminDashboardLayout.tsx` both call it for real, and every one of its hrefs is a live route.
Kept as-is.

## Where this is heading

`docs/SIDEBAR_REDESIGN.md` specifies a full Shopify-Polaris-style visual rebuild (dark sidebar,
accordion sub-items, tenant switcher, inline search, URL-based active state) that **replaces**
`Sidebar.tsx`/`SidebarItem.tsx`/`DefaultNavigation.tsx`'s rendering — status "Ready for phased
implementation," not yet built. This pass only reorganized the *data* (`DEFAULT_SIDEBAR_SECTIONS`)
that any future visual rebuild will render from.

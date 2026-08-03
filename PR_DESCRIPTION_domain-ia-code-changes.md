# fix(ui,web): actually ship the domain-IA nav regroup + redirect fix

## Why

The merged `chore/domain-ia-restructure` PR (#446) was supposed to include
five things: the sidebar regroup, a barrel-export fix, a redirect bugfix, a
`FEATURE_CATALOG.md` rewrite, and four new doc files + a deletion set.
Checking the actual merged diff (`d6ad468..8fd7d8c` on `main`) shows only the
4 *new* doc files and the deletions landed — the four changes to *existing*
files below were dropped somewhere in that PR's staging and never made it
into the commit, despite the PR description claiming they did. This PR ships
exactly those, with no further doc changes (already live) and no behavior
beyond what #446 already described.

## What changed (the part #446 missed)

- **`packages/ui/src/Layout/DefaultNavigation.tsx`** — `DEFAULT_SIDEBAR_SECTIONS`
  regrouped into the 9 business domains (Home, Learning, Commerce, People,
  Automation Hub, Intelligence, Workspace, Listings, Administration,
  Settings) per `docs/PRODUCT_ARCHITECTURE.md` (already merged). "Groups"
  relabeled "Teams"; "Automations" section id fixed from a stray
  `'developer'` to `'automation-hub'`; standalone "Developer" section folded
  into "Administration"; duplicate Settings → Billing entry removed;
  confirmed-dead `getDefaultMenuItems()` removed.
- **`packages/ui/src/Layout/index.ts`** — barrel export updated to match
  (drops `getDefaultMenuItems`, keeps `getDefaultNavItems` — real dependency
  of `UserDashboardLayout.tsx`/`AdminDashboardLayout.tsx`).
- **`apps/web/pages/admin/users.tsx`** — fixes the `/admin/users` → `/users`
  → `/organization/users` double-redirect hop (both stubs are
  `@deprecated`); now redirects straight to `/organization/users`.
- **`docs/FEATURE_CATALOG.md`** — reorganized under the new domain headers
  (Home, Learning, Intelligence, Automation Hub, Administration, Listings,
  Cross-cutting); stale `/billing`/`/groups`/`/users` route references fixed
  to their canonical `/organization/*` form.
- **`docs/AUTOMATION_MARKETPLACE_TAXONOMY.md`** — the certificate-reminder
  compound status refreshed from "in progress, unmerged" to "Shipped," since
  `feat/automation-hub-industry-compounds` (#443/#444) merged in the interim.

## Verification

- Confirmed via `git diff origin/main...HEAD` before opening this PR that
  the diff is exactly these 5 files, nothing else (no doc duplication, since
  the 4 new doc files already merged in #446).
- `oxlint` — 0 new errors on these files (previously verified in #446's own
  review; re-checked here since it's the same content).
- `tsc --noEmit` (`packages/ui`) — no new errors introduced by this specific
  diff; the one error in `DefaultNavigation.tsx`'s untouched `DEFAULT_USER`
  object is pre-existing (part of the ~120 known `@luxgen/ui` TS errors).

## Labels

`help wanted`, `fix`, `ui`, `web`

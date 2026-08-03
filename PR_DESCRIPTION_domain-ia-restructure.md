# chore(docs,ui,web): regroup nav + docs around the new business-domain IA

## Summary

Reorganizes the sidebar and product docs around 9 business domains (Home,
Learning, Commerce, People, Automation Hub, Intelligence, Workspace, Listings,
Administration, Settings) instead of the previous flat/code-shaped grouping.
**No URLs changed** — every route is exactly what's live today; only section
grouping, two labels, and one redundant redirect hop changed. Also removes
~1,600 files of stale personal interview-prep material that had been bulk
committed into `docs/`.

Scope was deliberately capped after discussion: docs + nav regrouping + fixing
the one known redundant route, **not** a full URL rename (considered and
rejected as too large/untestable a blast radius for this environment — see
`docs/PRODUCT_ARCHITECTURE.md` § "Why no URL changes").

## Changes

**Navigation** (`packages/ui/src/Layout/DefaultNavigation.tsx`, `index.ts`)
- `DEFAULT_SIDEBAR_SECTIONS` regrouped into the 9 domains above.
- "Groups" relabeled "Teams" in the People section — same `/organization/groups` URL.
- "Automations" section id fixed from a stray `'developer'` to `'automation-hub'`.
- Standalone "Developer" section folded into "Administration" (Agent Studio).
- Duplicate Settings → Billing sidebar entry removed (Administration already links there).
- Confirmed-dead `getDefaultMenuItems()` removed (zero real consumers, several
  hrefs pointed at routes that don't exist). `getDefaultNavItems()` was
  initially also removed by mistake, then restored after grepping usages —
  it's a real dependency of `UserDashboardLayout.tsx` and `AdminDashboardLayout.tsx`.

**Bug fix** (`apps/web/pages/admin/users.tsx`)
- Was redirecting `/admin/users` → `/users` → `/organization/users` (double
  hop, since `/users` is itself just a `@deprecated` redirect). Now redirects
  straight to `/organization/users`.

**Docs (new/rewritten)**
- `docs/PRODUCT_ARCHITECTURE.md` (new) — the domain model, why each grouping
  decision was made, and an explicit "why no URL changes this pass" section.
- `docs/MENU_STRUCTURE.md` (rewritten) — live nav tree in the new grouping,
  changelog of what moved, and a correction of an earlier doc's incorrect
  "redundant surface" claim about the `/users`/`/billing`/`/groups` redirects.
- `docs/PAGE_FUNCTIONALITY_CHECKLIST.md` (rewritten) — per-page detail
  reorganized under the new domain headers; retracts the same incorrect claim.
- `docs/FEATURE_CATALOG.md` (rewritten) — same 11 features, reorganized under
  domain headers, stale `/billing`/`/groups`/`/users` references fixed to
  their `/organization/*` canonical form.
- `docs/AUTOMATION_MARKETPLACE_TAXONOMY.md` (new) — marketplace taxonomy plus
  a trigger/condition/action table ground-truthed against
  `packages/automation-flow/src/catalog/compounds.ts` (27 real compound IDs
  on `main` today — nothing aspirational), a scoring framework, and an
  honestly-labeled shortlist (1 shipped, 1 in progress/unmerged, 4 proposed).

**Deletions**
- `docs/file-analysis/` + `docs/interview-prep/` (~1,617 files, ~6.8MB) —
  auto-generated personal interview/study-prep material (React/MERN/JS study
  guides, per-source-file docs dated 2026-06-27), unrelated to product docs.
  Confirmed via repo-wide grep: zero real code or doc references it.
- **Not deleted, on purpose:** `banner-demo.tsx` (out of scope per this PR's
  agreed cleanup list) and `packages/ui/src/**/*.spec.ts` (these are the
  deliberate `scripts/scaffold-component-structure.mjs`-generated smoke-test
  convention, not cruft).

## Verification

- `oxlint apps packages` — 0 new errors (4 pre-existing errors in
  `settings.tsx`/`settings/profile.tsx` belong to the separate, still-unmerged
  `chore/page-checklist-and-lint-fixes` branch, unaffected by this PR).
- `tsc --noEmit` in `packages/ui` — confirmed the one error touching a file
  this PR modifies (`DefaultNavigation.tsx(430,3)`, `'tenant' does not exist
  in type 'UserMenu'`) is in the untouched `DEFAULT_USER` object, copied
  verbatim from the pre-existing file (confirmed via `git diff`, unchanged
  content). Pre-existing, part of the ~120 known `@luxgen/ui` TS errors
  documented in `docs/technical/development/CODEBASE.md`'s Known Issues —
  not introduced by this PR.
- No dev server/DB in this sandbox, so no click-through test was possible —
  this is exactly why URL renames were excluded from scope this pass.

## Known risk to flag before merging

`docs/PAGE_FUNCTIONALITY_CHECKLIST.md` is a **new file on this branch**
(it doesn't exist on `main` — it currently only exists, in an earlier form,
on the separate unmerged `chore/page-checklist-and-lint-fixes` branch). If
both PRs merge, expect a same-file-added-twice conflict. Recommended order:
merge whichever of the two PRs lands first, then rebase the other and
manually reconcile that one file (the content here supersedes the other
branch's version — it corrects a claim the other version got wrong).

## Labels

`help wanted`, `chore`, `ui`, `web`

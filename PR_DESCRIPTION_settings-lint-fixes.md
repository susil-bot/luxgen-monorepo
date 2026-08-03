# chore(web): fix 4 oxlint errors in settings pages

## Why

`npm run lint` (oxlint) fails with 4 real errors in `apps/web/pages/settings.tsx`
and `apps/web/pages/settings/profile.tsx` — blocks a clean CI lint gate on any
PR touching those files, unrelated to what those PRs are actually changing.

(Note: an earlier draft of this chore also included a new
`docs/PAGE_FUNCTIONALITY_CHECKLIST.md`. That doc already shipped — in corrected
form — via the merged `chore/domain-ia-restructure` PR (#446), so it's dropped
here to avoid reintroducing its now-superseded first draft, which incorrectly
flagged the `/billing`/`/users`/`/groups` `@deprecated` redirects as
unresolved "redundant surfaces." This PR is lint-fixes only.)

## What changed

- `apps/web/pages/settings/profile.tsx` (2 spots) — `catch (error)` blocks
  where `error` was never read. Renamed to `catch (_error)` per
  `.oxlintrc.json`'s `caughtErrorsIgnorePattern: '^_'` convention. No behavior
  change — the catch bodies already ignored the error object.
- `apps/web/pages/settings.tsx` — `setActiveTab` was destructured but this
  page has no tab-switcher control anywhere in its JSX (tabs render off
  `activeTab`'s static initial value only); changed to
  `const [activeTab] = useState(...)`. The `tabs` array was declared but
  never referenced (no `.map()`, no nav UI consuming it) — removed as dead
  code. Neither change touches the (already non-functional) tab-display
  logic.

**Intentionally not fixed:** building an actual tab-switcher UI for
`/settings` (so `setActiveTab`/`tabs` would have a real purpose) is a feature,
not a lint fix.

## Not changed

No GraphQL, resolver, or DB changes. No new dependencies. `packages/ui`'s 96
pre-existing warnings are untouched (downgraded to `warn` via `.oxlintrc.json`
override, out of scope here).

## Test plan

- [x] `npm run lint` — 4 errors → 0
- [ ] Manually load `/settings` and `/settings/profile` — confirm identical
      rendering (no visual/functional change expected)

## Labels

`help wanted`, `chore`, `web`

# feat(ui,web): extract shared presenter layer into @luxgen/presenters

## Why

`docs/CROSS_PLATFORM_RESTRUCTURE.md` identified the actual gap between web and mobile:
styling/tokens are already shared (`@luxgen/design-tokens`), but the data-fetching +
view-model layer (`apps/web/presenters/*`) lived inside `apps/web` and couldn't be
imported by `apps/mobile`, even though three of its four files have zero DOM dependency.
This PR does step 1 of that doc's sequencing: extract the layer into its own package,
moving the one existing presenter (`search`) as a zero-risk proof of concept, so future
cross-platform features (starting with Automation Hub, per the doc) can be built
presenter-first instead of duplicated per platform.

Also fixes `docs/technical/development/CODEBASE.md`'s repo map, which was missing
`apps/mobile`, `apps/mcp-server`, and about half of `packages/*` (`automation-flow`,
`core`, `design-tokens`, `mcp-core`, `native-ui`, `shared`, `storefront`, `test-harness`,
`types`) — found while placing the new package in that map.

## What changed

- **New package `packages/presenters/`** (`@luxgen/presenters`) — moved from
  `apps/web/presenters/`: `_shared/queries/` (fragments) and `search/` (the one existing
  presenter) verbatim, plus a new `package.json` and root `index.ts`.
- **`packages/presenters/search/fetchers.ts`** — the only file with an actual platform
  dependency: it imported `apps/web/lib/fetcher.ts` directly, which silently made a
  "platform-agnostic" file web-only. Fixed by having it accept a `QueryFn` parameter
  (any function shaped like Apollo's `client.query`) instead of importing a concrete
  client. These functions currently have no callers anywhere in the app — the real path
  is `client.entry.ts`'s `useSearchPresenter()` hook, which was already fully
  platform-agnostic (Apollo's `useQuery` reads its client from React context).
- **`apps/web/pages/search.tsx`** — import changed from `'../presenters/search'` to
  `'@luxgen/presenters/search'`. No other change; the hook's usage is identical.
- **`apps/web/package.json`** — added `"@luxgen/presenters": "*"` dependency.
- **`tsconfig.base.json`** — added the `@luxgen/presenters` path mapping (bare + subpath),
  matching the existing convention for other shared packages.
- **`docs/CROSS_PLATFORM_RESTRUCTURE.md`** — added a status note: step 1 done, steps 2–4
  (Automation Hub built presenter-first, migrating remaining presenters, expanding
  `native-ui`) still open.
- **`docs/technical/development/CODEBASE.md`** — repo map corrected (see above); added
  `@luxgen/presenters` and `@luxgen/native-ui` entries to the Shared Packages section.

## What did NOT change

- No rendering/component changes — `packages/ui` and `packages/native-ui` stay separate,
  per the doc's explicit "what does NOT get shared" section.
- No new mobile screens. Automation Hub mobile support is a separate, deliberate scope
  decision (mobile is currently learner-only) — not a side effect of this move.
- `apps/web/lib/fetcher.ts` is untouched and still used elsewhere in `apps/web` outside
  the presenter layer.

## Verification

- Confirmed via repo-wide grep: no remaining references to the old
  `apps/web/presenters/*` import path.
- `oxlint` on the touched files — 0 warnings, 0 errors.
- `tsc --noEmit` (`apps/web`) — the only new errors are 2 more instances of a
  pre-existing `@apollo/client` type-resolution issue already affecting 200+ unrelated
  files in this environment (`TS7016`, missing `.d.ts` for `@apollo/client`'s `main.cjs`)
  — confirmed pre-existing and unrelated to this move, not a regression.

## Labels

`help wanted`, `feat`, `ui`, `web`

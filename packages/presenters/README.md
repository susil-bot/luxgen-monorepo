# Presenters (`@luxgen/presenters`)

VERSO-style **presenter** folders: GraphQL queries → fetchers → transformers → page/hook.

Moved here from `apps/web/presenters/` (see `docs/CROSS_PLATFORM_RESTRUCTURE.md`) so both
`apps/web` and `apps/mobile` can import the same data-fetching + view-model layer instead of
duplicating it per platform. Only the rendering layer (`packages/ui` vs. `packages/native-ui`)
stays platform-specific — see that doc for the full rationale.

```
packages/presenters/
  _shared/queries/     # Reusable GraphQL fragments
  search/              # First presenter, moved as the proof-of-concept migration
    queries.ts         # Operations + fragment imports
    fetchers.ts        # Imperative/SSR fetch helpers (accept an injected query-fn, see below)
    transformers.ts    # API shape → view model
    helpers/           # Pure filter/map helpers
    client.entry.ts    # useSearchPresenter() for pages/screens
    index.ts           # Public exports
```

## Layer rules

| File               | Responsibility                                                     | Platform-specific?                         |
| ------------------ | -------------------------------------------------------------------- | ------------------------------------------- |
| `queries.ts`       | GraphQL only — fragments from `_shared/queries`                     | No                                          |
| `fetchers.ts`      | Imperative/SSR fetch helpers                                        | No — takes a `QueryFn` param, doesn't import either app's client directly |
| `transformers.ts`  | Shape data for UI (no React, no fetch)                              | No                                          |
| `client.entry.ts`  | `useQuery` (Apollo) + `useMemo` → view model                        | No — `useQuery` reads its client from React context, works identically under React Native |
| `index.ts`         | What pages/screens import                                            | No                                          |

**Note on `fetchers.ts`:** its exported functions currently have no callers anywhere in the app —
the actually-used path is `client.entry.ts`'s hook. They're kept for the imperative/SSR use case
they were originally written for. When this package lived inside `apps/web`, `fetchers.ts`
imported `apps/web/lib/fetcher.ts` directly, which made it silently web-only despite looking
platform-agnostic. Moving it here required removing that coupling — it now takes a `QueryFn`
(any function shaped like Apollo's `client.query`) as a parameter instead, so either platform can
pass in its own client wrapper.

## Query + fragment pattern

```typescript
import { getCourseSearchFieldFragment } from '../_shared/queries';

export const getSearchCourses = /* GraphQL */ `
  ${getCourseSearchFieldFragment()}

  query getSearchCourses($tenantId: ID!) {
    courses(tenantId: $tenantId) {
      ...courseSearchField
    }
  }
`;
```

Wrapped with `gql` in the same file for Apollo.

## How to consume this package

```typescript
// apps/web/pages/search.tsx
import { useSearchPresenter } from '@luxgen/presenters/search';

// apps/mobile/app/(learner)/search.tsx (once/if a mobile search screen exists)
import { useSearchPresenter } from '@luxgen/presenters/search';
```

Both platforms import the exact same hook. Each renders the returned view model with its own
component library (`packages/ui` for web, `packages/native-ui` for mobile) — that split is
intentional, see `docs/CROSS_PLATFORM_RESTRUCTURE.md`'s "What does NOT get shared" section.

## Add a new presenter

1. Copy `search/` folder structure.
2. Add fragments to `_shared/queries/fragments.ts` if shared.
3. Export hook from `client.entry.ts`.
4. Pages/screens import from `@luxgen/presenters/<name>` only — not raw `graphql/queries/*`.
5. If the presenter needs an imperative fetch helper, have it accept a `QueryFn`-shaped
   parameter rather than importing a concrete client — see `search/fetchers.ts` for the pattern.

## Related

- Legacy queries: `apps/web/graphql/queries/` (migrate gradually)
- `@luxgen/core` Presenter plugin: server/workflow use case — different from this client folder layout
- `docs/CROSS_PLATFORM_RESTRUCTURE.md`: why this package exists, sequencing for migrating the rest
  of `apps/web/presenters/*` (this was step 1 of that sequencing — see its "Sequencing" section)

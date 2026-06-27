# Presenters (`apps/web/presenters`)

VERSO-style **presenter** folders: GraphQL queries → fetchers → transformers → page/hook.

```
presenters/
  _shared/queries/     # Reusable GraphQL fragments
  search/              # Example presenter (global search page)
    queries.ts         # Operations + fragment imports
    fetchers.ts        # Server/client data fetch
    transformers.ts    # API shape → view model
    helpers/           # Pure filter/map helpers
    client.entry.ts    # useSearchPresenter() for pages
    index.ts           # Public exports
```

## Layer rules

| File | Responsibility |
|------|----------------|
| `queries.ts` | GraphQL only — fragments from `_shared/queries` |
| `fetchers.ts` | Call Apollo `client.query` / `fetcher()` |
| `transformers.ts` | Shape data for UI (no React, no fetch) |
| `client.entry.ts` | `useQuery` + `useMemo` → view model |
| `index.ts` | What pages import |

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

## Add a new presenter

1. Copy `search/` folder structure.
2. Add fragments to `_shared/queries/fragments.ts` if shared.
3. Export hook from `client.entry.ts`.
4. Page imports from `presenters/<name>` only — not raw `graphql/queries/*`.

## Related

- Legacy queries: `apps/web/graphql/queries/` (migrate gradually)
- `@luxgen/core` Presenter plugin: server/workflow use case — different from this client folder layout

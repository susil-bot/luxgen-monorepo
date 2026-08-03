# Cross-Platform Restructure — Sharing Logic Between `apps/web` (React) and `apps/mobile` (React Native)

> Scope: how to stop duplicating business logic between web and mobile, using foundations that already exist in the repo rather than a rewrite. Written after auditing `apps/web/presenters`, `packages/ui`, `packages/native-ui`, `packages/design-tokens`, and `apps/mobile`.
>
> **Status: Step 1 of the sequencing below is done.** `packages/presenters` now exists;
> `search/` moved there as the proof-of-concept (see its own README.md for the exact layer
> rules and the one fix required — `fetchers.ts` no longer imports a concrete Apollo client,
> it takes one as a parameter, since a shared package can't hardcode either app's client
> singleton). Steps 2–4 (Automation Hub built presenter-first, migrating the rest of
> `apps/web/presenters/*`, expanding `packages/native-ui`) are still open.

## What's already in place (don't rebuild this)

| Layer | Web | Mobile | Shared today? |
|---|---|---|---|
| Design tokens (colors, spacing, typography, radius, shadows) | `packages/design-tokens` via `css.ts` (CSS vars) | `packages/design-tokens` via `lightTheme` object (confirmed: `native-ui/src/{Button,Card,ListRow,Screen}.tsx` all import `lightTheme` from `@luxgen/design-tokens`) | **Yes** — this is the one layer already fully shared |
| GraphQL client | Apollo (`apps/web`) | Apollo (`apps/mobile/lib/apollo.ts`) | Same backend contract (`docs/GRAPHQL_PLATFORM.md`'s "GraphQL-first" rule), but two separate Apollo setups, two separate query files |
| Data-fetching + view-model logic | `apps/web/presenters/*` (queries → fetchers → transformers → `client.entry.ts` hook) | `apps/mobile/graphql/queries.ts` + ad hoc logic inside screens | **No** — this is the actual gap |
| Presentational components | `packages/ui` (~70 component folders, DOM/Tailwind) | `packages/native-ui` (4 primitives: `Card`, `ListRow`, `Screen`, `Button`) | **No**, and shouldn't be — DOM and RN rendering are genuinely different. This is fine as-is. |

**The gap is not styling and not the GraphQL backend — both are already unified or unifiable.** The gap is that `apps/web/presenters` (the queries/fetchers/transformers/hook layer described in `apps/web/presenters/README.md`) lives inside `apps/web` and is written to be platform-agnostic in three of its four files, but mobile can't import it because it's not a package.

## The restructure: promote `presenters/` to a shared package

Look at the existing layer rules from `apps/web/presenters/README.md`:

| File | Responsibility | DOM-specific? |
|---|---|---|
| `queries.ts` | GraphQL operations + fragments | No |
| `fetchers.ts` | Apollo `client.query` / fetch | No |
| `transformers.ts` | API shape → view model (pure functions) | No |
| `client.entry.ts` | `useQuery` + `useMemo` → view model | No — `useQuery` is `@apollo/client`, which runs identically under React Native |
| *(page component, not part of presenters/)* | Renders the view model | **Yes** — this is the only part that has to fork per platform |

Three of four files have zero DOM dependency today. The restructure is mechanical:

1. **Move** `apps/web/presenters/` → `packages/presenters/` (new package, `@luxgen/presenters`), keeping the exact same internal structure (`_shared/queries/`, `<feature>/{queries,fetchers,transformers,client.entry,index}.ts`).
2. **apps/web** imports from `@luxgen/presenters/<feature>` instead of `../presenters/<feature>`; page components are unchanged (they already only imported the exported hook).
3. **apps/mobile** imports the *same* `@luxgen/presenters/<feature>` hook inside its screen components (`apps/mobile/src/screens/*` or `apps/mobile/app/**/*.tsx`), and renders the returned view model with `packages/native-ui` components instead of `packages/ui`.
4. New features (starting with **Automation Hub**, see `docs/AUTOMATION_HUB_STRATEGY.md`) are built presenter-first: write `packages/presenters/automation-hub/{queries,fetchers,transformers,client.entry,index}.ts` once, then build a thin web page and a thin mobile screen against it. This proves the pattern on a feature that doesn't yet have web/mobile duplication to untangle.

```
packages/presenters/
  _shared/queries/                # unchanged, moved as-is
  automation-hub/                 # new feature, built shared from day one
    queries.ts
    fetchers.ts
    transformers.ts
    client.entry.ts               # useAutomationHubPresenter()
    index.ts
  search/                         # existing presenter, moved from apps/web
  ...

apps/web/pages/automations/...    # imports useAutomationHubPresenter(), renders with packages/ui
apps/mobile/app/(admin)/automations/... # imports the SAME hook, renders with packages/native-ui
```

### What does NOT get shared (and shouldn't)

- **Rendering.** `packages/ui` and `packages/native-ui` stay separate — DOM and native rendering are different enough that a shared component layer would fight both platforms. This mirrors why the current split already works for tokens (shared) vs. components (not shared).
- **Routing.** Next.js pages vs. Expo Router screens are structurally different; only the data/logic layer moves.

## Sequencing

1. Extract `packages/presenters` with zero behavior change — move the existing `search/` presenter first as a proof-of-concept migration (lowest risk, already fully built), update `apps/web` imports, confirm nothing regresses.
2. Build the Automation Hub feature directly in `packages/presenters/automation-hub/` — first real cross-platform presenter, consumed by a new `apps/web` page and (if/when mobile gets an admin surface — see note below) a mobile screen.
3. Migrate remaining `apps/web/presenters/*` folders opportunistically, not as a big-bang rewrite — each migration is "cut, paste, change one import path" per the mechanical steps above.
4. Only expand `packages/native-ui` when a screen actually needs a primitive it doesn't have — it's 4 components today because mobile is learner-only scope (per `docs/BUSINESS_STRATEGY_2026.md` §10, "Mobile scope v1: Learner-only (recommended)"). An Automation Hub mobile screen would be the first *admin* surface on mobile — confirm that's actually in scope before building it, since it's a deliberate scope expansion, not a side effect of this restructure.

## Why this is the right amount of restructuring (not less, not more)

- **Not less:** without extracting `presenters/`, every new cross-platform feature (Automation Hub included) gets its data logic written twice and drifts.
- **Not more:** a full rewrite onto a single cross-platform UI library (e.g. forcing `packages/ui` into React Native compatibility via something like Tamagui/NativeWind) would touch ~70 existing web components for a mobile app that's currently learner-only scope — disproportionate to the actual ask right now. Revisit only if mobile scope grows to a full admin app.

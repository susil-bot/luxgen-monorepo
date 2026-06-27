# _app.tsx — Deep Analysis (Hand-enriched)

## File Path

`apps/web/pages/_app.tsx` (83 lines)

## Purpose

Root Next.js Pages Router application shell. Wires **every page** to:

- Apollo GraphQL client
- Theme + tenant design tokens
- Global UI providers from `@luxgen/ui`
- Auth/session guards and cross-tab sync
- Agent Studio sidekick panel slot
- SEO default head tags
- Inter font (`next/font`)

**Why it exists:** Single composition root so individual pages stay thin (no repeated provider boilerplate).

## Imports & Exports

| Import source | Symbols |
|---------------|---------|
| `next/app` | `AppProps` |
| `@apollo/client` | `ApolloProvider` |
| `../graphql/client` | `client` |
| `@luxgen/ui` | `GlobalProvider`, `NavigationProvider`, `AIStudioProvider`, `AIStudioPanelSlot`, `ErrorBoundary` |
| `../lib/theme` | `ThemeProvider` |
| `../lib/layout-user-context` | `LayoutUserProvider` |
| `../lib/layout-user-shared` | `LayoutUser` (type) |
| `../components/auth/*` | `AuthGuard`, `SessionMonitor`, `SessionSync` |

**Exports:** `default function App`

## Design Pattern

**Composite Root Provider** + **Adapter** (`WebNavigationProvider` adapts Next router to UI `NavigationProvider`).

## Function-Level Analysis

### `WebNavigationProvider` — Lines 25–38

| | |
|--|--|
| **Inputs** | `children: React.ReactNode` |
| **Outputs** | JSX wrapping `NavigationProvider` |
| **Side effects** | `router.push(href)` on navigate |
| **Pure?** | Impure (navigation) |
| **Re-renders when** | Parent re-renders; `router.pathname` from `useRouter()` |

**Interview:** Why not put `useRouter` inside `@luxgen/ui`?  
**Answer:** UI package must stay framework-agnostic; adapter lives in `apps/web`.

### `App` — Lines 41–82

| | |
|--|--|
| **Inputs** | `Component` (active page), `pageProps` (incl. `tenant`, `layoutUser` from GSSP) |
| **Outputs** | Full provider tree |
| **Side effects** | None directly (delegated to children) |

**SSR note:** `layoutUser` hydrated from `getTenantPageProps` optional cookie for first paint.

## Rendering / Re-render Triggers

- Any parent state change in providers (theme, auth epoch, Apollo cache)
- Route change → `Component` swap
- `layoutUser` prop change from page transition

## Performance

- Provider depth is deep (~12 levels) — acceptable for admin app; avoid putting heavy state high in tree
- CSS imports pull sidebar/arrow/product-card/kicker styles globally

## Accessibility

- Skip link lines 62–66 → `#main-content` (pages must set `id="main-content"` on `<main>`)

## Possible Improvements

1. Split providers into `AppProviders.tsx` for testability
2. Lazy-load `AIStudioSidekickPanel` with `dynamic(..., { ssr: false })`
3. Move global CSS imports to `_app` only (already done) — avoid duplicate in pages

## Interview Questions

**Easy:** What is `_app.tsx` in Next.js?  
**Medium:** Provider order — what breaks if Apollo is inside AuthGuard?  
**Hard:** Design SSR auth without flashing guest UI on protected routes.  
**System:** How would you micro-frontend this shell?

## Senior Discussion

- **FAANG:** Would require explicit boundary between shell and feature teams
- **Startup:** This monolithic shell is correct for velocity
- **Bug we fixed:** `LayoutUserProvider` circular import — split `layout-user-shared.ts`

## Related files

- [apps-web-components-auth-AuthGuard-tsx.md](./apps-web-components-auth-AuthGuard-tsx.md)
- [apps-web-lib-session-ts.md](./apps-web-lib-session-ts.md)
- [03-react.md](../interview-prep/03-react.md)

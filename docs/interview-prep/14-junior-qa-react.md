# Junior Q&A — React (LuxGen codebase)

> Short answers + **file:line** pointers into this repo. Read the cited lines while studying.

____________________________________________________________________________________________________________________________________________

:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: REACT — LUXGEN ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
____________________________________________________________________________________________________________________________________________

--------------------------------------------------------------------------------------------------------------------------------------------
**[0] What is a JavaScript library vs a framework?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** A **library** is code you call (React, lodash). A **framework** calls your code (Next.js routing, file-based pages).

**In LuxGen:** React is the UI library; Next.js Pages Router in `apps/web/pages/` is the framework shell.

--------------------------------------------------------------------------------------------------------------------------------------------
**[1] What is React?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** React builds UI from **components**. When state/props change, React re-renders and updates the DOM efficiently (virtual DOM diff).

**In LuxGen:** Every page is a component — e.g. `apps/web/pages/dashboard.tsx` exports `Dashboard`.

--------------------------------------------------------------------------------------------------------------------------------------------
**[2] What is JSX?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** JSX looks like HTML inside JavaScript. Babel/Next compiles it to `React.createElement(...)`.

**In LuxGen:** `apps/web/pages/_app.tsx:62-67` — skip-link anchor written as JSX inside the provider tree.

--------------------------------------------------------------------------------------------------------------------------------------------
**[3] What is the difference between State and Props?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.**
- **Props** — passed from parent; read-only for the child.
- **State** — owned inside the component; change with `setState` / `useState` → re-render.

**In LuxGen:**
- Props: `NavBar` receives `user` prop — `packages/ui/src/NavBar/NavBar.tsx:21-22`
- State: `isMobileMenuOpen` — `packages/ui/src/NavBar/NavBar.tsx:72`

--------------------------------------------------------------------------------------------------------------------------------------------
**[4] What is conditional rendering?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Show different UI based on a condition — `if`, ternary `? :`, or `&&`.

**In LuxGen:** Guest vs logged-in NavBar — `packages/ui/src/NavBar/NavBar.tsx:381-396`

```text
user ? (user menu) : (Login + Sign Up links)
```

--------------------------------------------------------------------------------------------------------------------------------------------
**[5] What are React hooks? Name three used in this repo.**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Hooks let function components use state and lifecycle.

| Hook | File:line | Purpose |
|------|-----------|---------|
| `useState` | `AuthGuard.tsx:33-34` | `mounted` flag before reading localStorage |
| `useEffect` | `AuthGuard.tsx:36-45` | Listen for login/logout events |
| `useMemo` | `use-sidebar-sections.ts:99-104` | Cache filtered sidebar sections |

--------------------------------------------------------------------------------------------------------------------------------------------
**[6] What is `useEffect` and what are dependencies?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Runs side effects after render. Second argument `[deps]` — effect re-runs when deps change. `[]` = run once on mount.

**In LuxGen:** `apps/web/lib/app-layout-header.ts:13-18` — refresh `sessionOk` when `luxgen-auth-change` fires; deps `[]` = subscribe once.

--------------------------------------------------------------------------------------------------------------------------------------------
**[7] What is the Virtual DOM?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** A lightweight JS copy of the UI. React diffs old vs new VDOM, then patches only changed parts of the real DOM.

**Why it matters:** Large lists (orders) still need extra help — see virtualization in order table components.

--------------------------------------------------------------------------------------------------------------------------------------------
**[8] How do lists work in React?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Use `.map()` to render an array. Each child needs a stable **`key`** (usually `id`).

**In LuxGen:** `apps/web/pages/organization/users.tsx` — user rows mapped with `key={user.id}` (search file for `.map(`).

--------------------------------------------------------------------------------------------------------------------------------------------
**[9] What are keys and why avoid index as key?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Keys help React match items when the list reorders. Index keys break when items are inserted/deleted at the top.

**Rule:** Use database `id`, not array index, for dynamic lists.

--------------------------------------------------------------------------------------------------------------------------------------------
**[10] What is `useMemo`?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Caches a computed value until dependencies change. Avoids redoing expensive work every render.

**In LuxGen:** `apps/web/lib/use-sidebar-sections.ts:99-104` — re-filter sidebar only when `role`, billing flags, or `guest` change.

--------------------------------------------------------------------------------------------------------------------------------------------
**[11] Difference between `React.memo` and `useMemo`?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.**
- **`React.memo`** — wraps a **component**; skip re-render if props unchanged.
- **`useMemo`** — caches a **value** inside a component.

**In LuxGen:** `OrderListTable` row components use `memo` for long order lists (see `packages/ui` order list).

--------------------------------------------------------------------------------------------------------------------------------------------
**[12] What is `useCallback`?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Memoizes a **function** so child components with `React.memo` do not re-render unnecessarily.

**In LuxGen:** `apps/web/lib/app-layout-header.ts:20-40` — `onSearch` wrapped in `useCallback` with `[]` deps.

--------------------------------------------------------------------------------------------------------------------------------------------
**[13] What is `useRef`?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Holds a value that persists across renders without causing re-render. Often used for DOM nodes or “run once” flags.

**In LuxGen:** `apps/web/components/auth/AuthGuard.tsx:16-20` — `didRedirect` ref prevents double login redirect.

--------------------------------------------------------------------------------------------------------------------------------------------
**[14] What is Context API?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Share data without passing props through every level (avoids prop drilling).

**In LuxGen:**
- `LayoutUserProvider` — `apps/web/lib/layout-user-context.tsx` (session user for layout)
- `GlobalProvider` — `@luxgen/ui` (tenant config)
- Wrapped in `_app.tsx:54-75`

--------------------------------------------------------------------------------------------------------------------------------------------
**[15] How does routing work in this project?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** **Next.js Pages Router** — file path = URL. `pages/dashboard.tsx` → `/dashboard`. Client navigation via `useRouter().push`.

**In LuxGen:** `apps/web/pages/_app.tsx:25-38` — `WebNavigationProvider` connects UI sidebar clicks to `router.push`.

--------------------------------------------------------------------------------------------------------------------------------------------
**[16] What is SSR vs CSR?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.**
- **SSR** — HTML built on server (`getServerSideProps`).
- **CSR** — browser runs JS and fills the page.

**In LuxGen:** `getTenantPageProps` on pages like `dashboard.tsx:150` runs SSR for tenant; Apollo queries run on client after hydration.

--------------------------------------------------------------------------------------------------------------------------------------------
**[17] What is hydration?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** React attaches event listeners to server HTML. Mismatch = hydration error.

**In LuxGen:** `AuthGuard.tsx:52-56` — on first paint, render children (don’t redirect) so SSR HTML matches client before `localStorage` is read.

--------------------------------------------------------------------------------------------------------------------------------------------
**[18] What is Apollo Client / GraphQL in the web app?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Apollo sends GraphQL queries/mutations to the API and caches results.

**In LuxGen:** `apps/web/graphql/client.ts:102-109` — `ApolloClient` with auth link + cache. Wrapped in `_app.tsx:46`.

--------------------------------------------------------------------------------------------------------------------------------------------
**[19] What is `fetchPolicy: 'cache-first'`?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Use cache if present; only hit network if missing.

**In LuxGen:** `apps/web/lib/use-sidebar-sections.ts:91-95` — billing flags; `apps/web/pages/dashboard.tsx:39` — dashboard data.

--------------------------------------------------------------------------------------------------------------------------------------------
**[20] What is an Error Boundary?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Catches render errors in children so the whole app does not white-screen.

**In LuxGen:** `apps/web/pages/_app.tsx:69-71` — `<ErrorBoundary>` wraps each page component.

--------------------------------------------------------------------------------------------------------------------------------------------
**[21] What is `_app.tsx` responsible for?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Root wrapper for **every page** — global CSS, providers (Apollo, theme, auth), and `AuthGuard`.

**Read:** `apps/web/pages/_app.tsx:41-83`

--------------------------------------------------------------------------------------------------------------------------------------------
**[22] How does AuthGuard protect routes?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.**
1. Public route → pass through (`auth-routes.ts` `requiresAuth`)
2. Wait until `mounted` (client only)
3. `validateClientSession()` — token + expiry + tenant match
4. Fail → redirect `/login?reason=...`

**Read:** `apps/web/components/auth/AuthGuard.tsx:47-63`

--------------------------------------------------------------------------------------------------------------------------------------------
**[23] Why must `user={undefined}` show Login on NavBar?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Passing a fake default user hides Login. Guest = omit user or pass `undefined`.

**Read:** `packages/ui/src/NavBar/NavBar.tsx:381-396` — `user` falsy → Login / Sign Up links.

--------------------------------------------------------------------------------------------------------------------------------------------
**[24] What is controlled vs uncontrolled input?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.**
- **Controlled:** `value` + `onChange` in React state.
- **Uncontrolled:** DOM holds value; read via ref or `onChange` event.

**In LuxGen:** Login/register forms in `@luxgen/ui` use controlled inputs with local state.

--------------------------------------------------------------------------------------------------------------------------------------------
**[25] What is prop drilling and how does LuxGen reduce it?**
--------------------------------------------------------------------------------------------------------------------------------------------

**ANS.** Passing props through many layers. Fixed with Context (`LayoutUserProvider`, `useLayoutUser`) and Apollo cache.

**Read:** `apps/web/lib/app-layout-user.ts` — `useLayoutUser()` used on dashboard, orders, org pages.

____________________________________________________________________________________________________________________________________________

**Next:** [15-junior-qa-mern.md](./15-junior-qa-mern.md) (Node, MongoDB, GraphQL, Auth)

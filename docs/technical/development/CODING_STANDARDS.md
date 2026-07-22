# LuxGen — Coding Standards

> **Parent:** [Technical docs](../README.md) · **Related:** [CODEBASE.md](./CODEBASE.md)

Mandatory rules for all code in this repository. No exceptions without explicit discussion.

---

## 1. TypeScript

- **Strict mode** — `tsconfig.base.json` enables `strict: true`. Never use `@ts-ignore` to paper over errors.
- **No `any` at module boundaries** — `any` is acceptable only for dynamic user data from `localStorage`/cookies. All props, state, and API response types must be fully typed.
- **Prefer `interface` over `type`** for object shapes; use `type` for unions and aliases.
- **No unused imports** — linters fail the build. Remove them before staging files.

## 2. React / Next.js

- **Pages Router only** — this project uses Next.js 14 Pages Router (`apps/web/pages/`). Do not create `app/` directory routes.
- **`getServerSideProps` for tenant** — every page that needs the tenant must use `getServerSideProps` to extract it from `ctx.query.tenant`.
- **No hydration mismatches** — anything that differs between SSR and client (Date, Math.random, localStorage, sessionId) must be set inside `useEffect`, never in `useState` lazy initialisers or render body.
- **Component files** — one default export per file. Helper components in the same file are fine when small (under ~60 lines each).

## 3. Design System

- **No raw hex colours in JSX** — always use `var(--color-*)` or `var(--lux-*)` CSS custom properties.
- **No Tailwind colour utilities** — do not use `bg-white`, `text-gray-*`, `border-gray-*`. Use the iOS token classes instead.
- **Allowed Tailwind** — layout utilities (`flex`, `grid`, `gap-*`, `p-*`, `m-*`, `w-*`, `h-*`, `overflow-*`, `z-*`) are fine.
- **CSS class prefix** — LuxGen-specific classes use `lux-*`. iOS utility classes use `ios-*`. Never create classes with a `sp-` prefix (legacy; renamed to `lux-`).

```css
/* ✅ Correct */
color: var(--color-label-primary);
background: var(--color-blue);
border-radius: var(--radius-xl);

/* ❌ Wrong */
color: #000;
background: #007aff;
background-color: white;
```

## 4. Styling Rules

- **Single source of truth** — tokens live in `apps/web/styles/globals.css` (web app) and `packages/ui/src/Sidebar/sidebar.css` (UI package). Never inline token values in component files.
- **Mobile-first** — all grid layouts must collapse to 1 column at `max-width: 640px`.
- **No inline `style` for colours** — acceptable for dynamic values (progress bar width, SVG coordinates). For static colours, use CSS classes.

## 5. Component Rules

- **Reuse `@luxgen/ui`** — before creating a new component, check `packages/ui/src/` for an existing one.
- **`AppLayout` wrapper** — every authenticated page must use `<AppLayout sidebarSections={getDefaultSidebarSections()} ...>`.
- **`SnackbarProvider`** — wrap pages that show toasts with `<SnackbarProvider>`. Use `useSnackbar()` for `showSuccess`, `showError`, `showInfo`.
- **No prop drilling beyond 2 levels** — use React context or co-locate state closer to the consumer.

## 6. Agent / AI Pages

- **Session ID in `useEffect`** — `sessionId` must be set in `useEffect`, never in `useState` initialisers.
- **Streaming via SSE** — AI responses use Server-Sent Events (`text/event-stream`). Parse `data: {...}` lines; skip `[DONE]`.
- **Tool execution on the server** — tool calls (`read_file`, `write_file`, etc.) execute in the API route (`pages/api/agent/chat.ts`), never client-side.
- **Staged files, not direct writes** — `write_file` tool stages changes in `.agent-staging/`. The user applies them via the Transparency panel.

## 7. File & Directory Conventions

| Pattern               | Where                                       |
| --------------------- | ------------------------------------------- |
| Page files            | `apps/web/pages/<route>/index.tsx`          |
| Page-level components | `apps/web/components/<feature>/`            |
| Shared UI components  | `packages/ui/src/<ComponentName>/`          |
| API routes            | `apps/web/pages/api/<resource>/<action>.ts` |
| CSS tokens            | `apps/web/styles/globals.css`               |
| Agent skill docs      | `skills/<skill-name>/SKILL.md`              |
| Design specs          | `docs/<FEATURE_NAME>.md`                    |

- File names: `PascalCase` for components, `camelCase` for hooks and utilities, `kebab-case` for CSS files.
- No `index.ts` barrel files in `pages/` — each page is its own file.

## 8. Linting & formatting (Oxc)

- **Lint:** [oxlint](https://oxc.rs/docs/guide/usage/linter.html) at repo root — `npm run lint` (config: `.oxlintrc.json`)
- **Format:** [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) replaces Prettier — `npm run format:fix` (config: `.oxfmtrc.json`)
- **Pre-commit:** Husky runs `oxlint --fix` + `oxfmt --write` on staged files via `lint-staged.config.js`
- Unused params/vars: prefix with `_` (enforced by `eslint/no-unused-vars` in oxlint)
- Legacy per-package `eslint` scripts exist but root CI uses oxlint only

## 9. Comments

- **Default: no comments.** Well-named variables and functions are self-documenting.
- **Write a comment only when the WHY is non-obvious**: a hidden constraint, a workaround for a specific bug, a subtle invariant.
- **Never write**: task references ("added for issue #123"), caller notes ("used by X"), or what the code does ("loops over users").

## 10. Git

- Commit messages are imperative present tense: `Add analytics page`, not `Added analytics page`.
- One logical change per commit. Do not mix unrelated changes.
- Never force-push to `main`.

## 11. Testing

- Phase 1 acceptance tests for new features live in `/tmp/test-<feature>.ts` and run with `npx tsx`.
- Unit tests for pure logic (hooks, utilities) go in `packages/ui/src/__tests__/`.
- No mocking the database in integration tests.

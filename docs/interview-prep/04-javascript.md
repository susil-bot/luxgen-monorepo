# 04 — JavaScript Deep Dive (As Used in LuxGen)

## Concepts mapped to real files

| Concept | Example in repo |
|---------|-----------------|
| **Closure** | `createHandleUserAction(router)` captures router |
| **Lexical scope** | `AUTH_STORAGE_KEYS` in `session.ts` |
| **Event loop** | `setState` after `await` in login handler |
| **Microtasks** | `Promise` from Apollo `useQuery` |
| **Promises/async** | `persistSession()`, GraphQL mutations |
| **Modules ESM** | `"type": "module"` in scripts; TS imports |
| **Destructuring** | `const { data, loading } = useQuery(...)` |
| **Spread** | `{ ...user, ...updates }` optimistic patches |
| **Optional chaining** | `userData?.user` |
| **Nullish coalescing** | `layoutUser ?? undefined` |
| **Map/Set** | `selectedIds` Set in automations bulk UI |
| **Immutability** | `setAutomations(prev => prev.map(...))` |

## Session module: `apps/web/lib/session.ts`

### Why it matters in interviews

- Single source of truth for client auth persistence
- Dispatches `luxgen-auth-change` for cross-tab sync
- JWT `exp` decoded client-side (no signature verify — server is authoritative)

### `persistSession` flow (conceptual)

1. Write `authToken`, `currentUser`, `authTokenExpiresAt`
2. Bump `authSessionEpoch`
3. `notifyAuthSessionChange()` → listeners in AuthGuard, LayoutUserProvider, NavBar

### Interview: localStorage vs cookies

| | localStorage | httpOnly cookie |
|--|--------------|-----------------|
| XSS risk | Readable by JS | Not readable |
| SSR | Needs separate cookie for layout user | Natural SSR |
| This repo | Primary + SSR cookie mirror for layout |

## Role ranking: `apps/web/lib/user-roles.ts`

```typescript
const ROLE_RANK = { SUPER_ADMIN: 5, ADMIN: 4, INSTRUCTOR: 3, STUDENT: 2, USER: 2 };
```

- **Pure function:** `hasRoleAtLeast(userRole, minimumRole)` — O(1)
- **Why local copy:** Avoid bundling Mongoose via `@luxgen/auth` → `@luxgen/db`

## Debounce / throttle

- Search: `onSearch` in `useAppLayoutHeader` — client-side filter vs navigate to `/search`
- Rate limiting: server-side `tenantRateLimitMiddleware` (not debounce, but related interview topic)

## Deep copy vs shallow

- Apollo cache updates: shallow merge unless `writeFragment`
- `JSON.parse(JSON.stringify)` used sparingly; prefer structured clones for configs

## Common interview traps

1. **`this` in arrow functions** — callbacks in class components (`ErrorBoundary` uses class)
2. **Stale closure in useEffect** — missing deps → old `router` or `tenantId`
3. **== vs ===** — always `===` in this codebase
4. **Mutating state** — always functional updates for arrays/objects

## Coding exercises (see 10-coding-problems.md)

- Implement `debounce(fn, ms)`
- Implement `deepEqual(a, b)`
- Flatten nested sidebar sections array
- Parse JWT payload without verify (like `session.ts`)

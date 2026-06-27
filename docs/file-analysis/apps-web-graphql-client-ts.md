# client.ts — Deep Analysis (Hand-enriched)

## File Path

`apps/web/graphql/client.ts` (110 lines)

## Purpose

**Singleton Apollo Client** for the Next.js web app. Wires:

- HTTP GraphQL to API (`getClientGraphqlUrl()`)
- WebSocket subscriptions (`graphql-ws`)
- Auth headers from `localStorage` + tenant from **host** (not stale storage)
- Global 401 / tenant mismatch / expiry handling

**Mounted in:** `pages/_app.tsx` via `<ApolloProvider client={client}>`.

## Exports

| Export | Line |
|--------|------|
| `client` | 102–109 |

## Design pattern

**Link chain (middleware pipeline)** — Apollo links compose like Express middleware:

```
errorLink → authLink → splitLink( ws | http )
```

---

## Link chain — Lines 102–104

```typescript
export const client = new ApolloClient({
  link: from([errorLink, authLink, splitLink || httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
  },
});
```

| Option | Why |
|--------|-----|
| `errorPolicy: 'all'` | Partial data + errors (e.g. field-level auth) still render |
| `InMemoryCache` | Default normalized cache; no custom type policies here |

---

## HTTP link — Lines 14–16

```typescript
const httpLink = createHttpLink({ uri: getClientGraphqlUrl() });
```

- SSR: URL from env / server-side config
- Browser: typically same-origin or `localhost:4000/graphql`

---

## WebSocket link — Lines 20–36

```typescript
function createWsLink(): GraphQLWsLink | null {
  if (typeof window === 'undefined') return null;
  return new GraphQLWsLink(createClient({
    url: getClientGraphqlWsUrl(),
    connectionParams: () => {
      const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
      return {
        authorization: token ? `Bearer ${token}` : '',
        'x-tenant': resolveRequestTenant(),
      };
    },
  }));
}
```

| Detail | Why it matters |
|--------|----------------|
| `typeof window` guard | SSR must not touch `localStorage` |
| `connectionParams` as **function** | Re-reads token on every reconnect — rotated JWT works |
| `resolveRequestTenant()` | Host-based subdomain — **never** `currentTenant` from storage |

**Interview:** Stale `x-tenant` from localStorage caused cross-tenant bugs; host is source of truth.

---

## Split link — Lines 38–47

```typescript
split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  httpLink,
);
```

- Subscriptions → WebSocket
- Queries/mutations → HTTP
- If no WS (SSR), falls back to `httpLink` only

---

## Auth link — Lines 55–78

Runs **before** each HTTP operation.

```typescript
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);

  if (token && isStoredSessionExpired()) {
    clearStoredSession();
    return { headers };
  }

  if (token && isSessionTenantMismatch(getStoredUser())) {
    clearStoredSession();
    redirectToLogin('tenant_mismatch');
    return { headers };
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-tenant': resolveRequestTenant(),
    },
  };
});
```

### Decision table

| Condition | Action |
|-----------|--------|
| SSR (`window` undefined) | Pass headers through |
| Token + expired | `clearStoredSession()`, no auth header |
| Token + wrong tenant host | Clear + redirect `tenant_mismatch` |
| Valid token | `Bearer` + `x-tenant` |

**Proactive client guard** — catches bad session before network round-trip (complements `AuthGuard`).

---

## Error link — Lines 80–100

```typescript
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors?.some((e) => e.extensions?.code === 'PLAN_UPGRADE_REQUIRED')) return;
  if (opName === 'Login' || opName === 'Register') return;

  const reason = resolveAuthRedirectReason(graphQLErrors, statusCode);
  if (!reason) return;

  clearStoredSession();
  redirectToLogin(reason);
});
```

| Skip case | Reason |
|-----------|--------|
| `PLAN_UPGRADE_REQUIRED` | UI shows upgrade modal, not login |
| `Login` / `Register` | Wrong password ≠ session expired |

**Reactive guard** — server rejected token (401, `UNAUTHENTICATED`, tenant mismatch message).

Uses `resolveAuthRedirectReason` from `session-guard.ts` — shared with `AuthGuard`.

---

## Redirect helper — Lines 49–53

```typescript
function redirectToLogin(reason): void {
  const returnPath = `${window.location.pathname}${window.location.search}`;
  if (isAuthPage(window.location.pathname)) return;
  window.location.href = buildLoginRedirect(returnPath, reason);
}
```

- Preserves deep link via `returnPath`
- No redirect loop on `/login`

---

## Data flow diagram

```mermaid
flowchart TB
  subgraph Browser
    LS[localStorage authToken]
    Host[window.location.host]
    AL[authLink]
    EL[errorLink]
    API[GraphQL API]
  end
  LS --> AL
  Host -->|resolveRequestTenant| AL
  AL --> API
  API -->|401 / UNAUTHENTICATED| EL
  EL -->|clearStoredSession| LS
  EL -->|redirect| Login[/login?reason=...]
```

---

## Interaction with other modules

| Module | Role |
|--------|------|
| `session.ts` | Token keys, expiry, clear |
| `tenant-auth.ts` | Host tenant, mismatch check |
| `session-guard.ts` | Map errors → redirect reason |
| `auth-routes.ts` | Login URL builder |
| `AuthGuard.tsx` | Route-level gate (before render) |
| `useSidebarSections` | `cache-first` billing query |

**Defense in depth:** AuthGuard (route) + authLink (request) + errorLink (response).

---

## Common pitfalls (interview)

| Mistake | Symptom | Fix in this file |
|---------|---------|------------------|
| `x-tenant` from localStorage | Wrong tenant data | `resolveRequestTenant()` |
| Static WS `connectionParams` | Reconnect with old token | Function form |
| Clear session on login error | Can't show "bad password" | Skip Login/Register ops |
| No SSR guard | `localStorage is not defined` | `typeof window` checks |

---

## Cache strategy elsewhere

This file sets global defaults only. Per-query policies live at call sites:

```typescript
// use-sidebar-sections.ts
fetchPolicy: 'cache-first'
```

**Interview:** When to use `cache-first` vs `network-only`? Billing flags = stable; user profile after edit = `network-only` or `refetch`.

---

## Possible improvements

1. `typePolicies` for `Tenant`, `User` entity merge
2. `connectToDevTools` flag for development
3. Retry link for transient network failures
4. Extract links to `graphql/links/` for unit testing

## Interview questions

| Level | Question |
|-------|----------|
| Easy | What does Apollo Client do in this app? |
| Medium | Explain the link chain order — why errorLink first? |
| Hard | How would you refresh JWT without logging user out? |
| System | Design GraphQL client for offline-first mobile |

**Link order answer:** `from([errorLink, authLink, ...])` — errorLink wraps downstream; observes responses from http/ws after auth headers applied.

## Mock interview answer

> "Apollo Client is configured once in `graphql/client.ts`. We compose links: an error link clears session and redirects on 401, an auth link attaches Bearer token and x-tenant from the browser host, and a split link sends subscriptions over WebSocket with connectionParams that re-read storage on reconnect. We use errorPolicy all so partial GraphQL errors don't blank the UI."

## Related

- [apps-web-pages-_app-tsx.md](./apps-web-pages-_app-tsx.md)
- [apps-web-lib-session-ts.md](./apps-web-lib-session-ts.md)
- [apps-web-components-auth-AuthGuard-tsx.md](./apps-web-components-auth-AuthGuard-tsx.md)
- [apps-api-src-context-ts.md](./apps-api-src-context-ts.md)
- [interview-prep/03-react.md](../interview-prep/03-react.md)

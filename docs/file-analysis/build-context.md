# File Analysis: apps/api/src/context/buildContext.ts

## File Path and Purpose

**Path:** `apps/api/src/context/buildContext.ts`

This function assembles the GraphQL context object that Apollo Server passes to every resolver. It bridges the HTTP layer (Express `req`/`res`) with the GraphQL execution layer by collecting the tenant document, authenticated user, and any auth error code into one typed object — `GraphQLContext` — so resolvers have a consistent, strongly-typed API surface rather than reading `req` directly.

---

## Full Annotated Code

```typescript
import type { Request, Response } from 'express';
import { Tenant, type IUser, type ITenant } from '@luxgen/db';
import { resolveAuthenticatedUser } from '../utils/resolveAuthenticatedUser';
import type { GraphQLContext } from '../context';
import type { AuthErrorCode } from '../types/auth';

export async function buildGraphQLContext(req: Partial<Request>, res?: Response): Promise<GraphQLContext> {
  // Takes Partial<Request> rather than full Request to support non-HTTP callers
  // (e.g., schema testing, subscriptions, batch loaders) that may not have a
  // complete Express Request object.

  const headers = req.headers ?? {};
  // Fallback to empty object so all subsequent header reads are safe even
  // if headers is undefined (e.g., in tests with partial request mocks).

  const tenantSubdomain =
    req.subdomain ||                                           // Set by tenantRoutingMiddleware
    req.tenant?.subdomain ||                                  // Populated tenant document
    (headers['x-tenant'] as string | undefined) ||           // API-to-API calls
    'demo';                                                   // Hardcoded fallback
  // ISSUE: The 'demo' fallback is a last resort that silently succeeds.
  // If a request has no tenant context at all and there happens to be a 'demo'
  // tenant in the database, that tenant's data is silently used. This could
  // cause data to be attributed to the wrong tenant in edge cases.
  // A safer fallback: throw an error or return a minimal context without tenantDoc.

  // Resolve tenant document and ID.
  // If tenantRoutingMiddleware already ran, req.tenant is populated — skip DB lookup.
  let tenantDoc: ITenant | undefined = req.tenant as ITenant | undefined;
  let tenantId: string | undefined = req.tenantId;

  if (!tenantDoc && tenantSubdomain) {
    // Fallback DB lookup: handles the /graphql path which bypasses tenantRoutingMiddleware
    // (BYPASS_PATHS in tenantRouting.ts includes '/graphql').
    const found = (await Tenant.findOne({ subdomain: tenantSubdomain, status: 'active' }).lean()) as ITenant | null;
    if (found) {
      tenantDoc = found;
      tenantId = (found._id as any).toString();
    }
    // PERFORMANCE NOTE: This DB lookup runs on EVERY GraphQL request that goes
    // through /graphql without prior tenant middleware resolution. In production
    // at 10k req/s, this is 10,000 MongoDB reads per second — the same bottleneck
    // that tenantRoutingMiddleware's cache was designed to prevent.
    // FIX: Integrate the same Redis + in-memory cache from lookupTenant here.
  }

  // Token resolution — similar to what authMiddleware does, but self-contained.
  const token = (headers.authorization as string | undefined)?.replace('Bearer ', '');
  let user: IUser | undefined;
  let authError: AuthErrorCode | undefined;

  if (token) {
    const resolved = await resolveAuthenticatedUser(token);
    user = resolved.user;
    authError = resolved.authError;
    // resolveAuthenticatedUser is called here even when authMiddleware already ran.
    // If the Express route stacks authMiddleware BEFORE buildGraphQLContext is called,
    // req.user is already set and we could skip this DB call.
    // Currently: req.user from authMiddleware is IGNORED here.
    // This means two DB reads on every authenticated GraphQL request:
    // 1. authMiddleware → resolveAuthenticatedUser (sets req.user)
    // 2. buildGraphQLContext → resolveAuthenticatedUser (does it again)
    // This is a double-query bug. Fix: if (req.user) { user = req.user; } else { resolve... }
  }

  return {
    req: req as Request,
    res: res as Response,
    user,
    tenant: tenantSubdomain,      // string — the subdomain (not the doc)
    tenantDoc,                     // ITenant | undefined — the full document
    tenantId,                      // string | undefined — the Mongo ObjectId as string
    authError,
  };
}
```

---

## Exported Functions

| Name | Inputs | Outputs | Complexity | Side Effects | Pure? |
|---|---|---|---|---|---|
| `buildGraphQLContext` | `req: Partial<Request>, res?: Response` | `Promise<GraphQLContext>` | O(1) + 0–2 DB reads | MongoDB `findOne`, `User.findById` | Impure |

---

## Design Patterns Used

**Context Object Pattern:** Assembles heterogeneous data (tenant, user, auth state, HTTP refs) into a single typed object threaded through the entire resolver call stack. This is the standard Apollo Server pattern — resolvers don't import Express modules directly; they receive everything via context.

**Fail-Open for Missing Tenant:** The `'demo'` fallback means the function always returns a context, even when tenant resolution fails. This is intentional for the GraphQL playground and health checks, but introduces the silent fallback risk noted above.

**Lazy Resolution:** The tenant DB lookup only fires if `req.tenant` wasn't already set by middleware. This is the right pattern — use pre-computed middleware results when available; only fall back to DB when needed.

---

## Security Considerations

1. **Double `resolveAuthenticatedUser` call is redundant but not a security issue** — both calls do the same verification. The result is the same; the cost is doubled.

2. **`'demo'` hardcoded fallback tenant could be a data isolation bug.** If a `demo` tenant exists in production and a request arrives with no tenant identifier (e.g., a misconfigured API client), it would see `demo`'s data rather than getting an error. Fix: return `{ tenant: '', tenantDoc: undefined }` when no tenant can be resolved, and let individual resolvers that need a tenant fail explicitly.

3. **`req.user` from `authMiddleware` is ignored.** This means if `authMiddleware` set an error on `req.authError` (e.g., rate-limiter or upstream set it), that error is not propagated to the GraphQL context — `buildGraphQLContext` starts fresh. This means some auth error paths set by other middleware are bypassed.

4. **`Partial<Request>` parameter typing** means callers can pass incomplete objects. This is intentional for testing, but means callers in production code could accidentally pass a partial request and miss headers.

---

## Performance Considerations

**Critical bug: double `resolveAuthenticatedUser` call:**

When `authMiddleware` is registered as Express middleware AND `buildGraphQLContext` is used as the Apollo context function, every authenticated GraphQL request makes two `User.findById` calls:

1. `authMiddleware` → `resolveAuthenticatedUser` → `User.findById`
2. `buildGraphQLContext` → `resolveAuthenticatedUser` → `User.findById`

At 5,000 authenticated GraphQL requests/second, this is 10,000 MongoDB reads/second that should be 5,000.

**Fix:**
```typescript
// In buildGraphQLContext:
let user: IUser | undefined = req.user as IUser | undefined;
let authError: AuthErrorCode | undefined = req.authError as AuthErrorCode | undefined;

if (!user && !authError && token) {
  const resolved = await resolveAuthenticatedUser(token);
  user = resolved.user;
  authError = resolved.authError;
}
```

**Uncached tenant DB lookup:** The fallback `Tenant.findOne` in `buildGraphQLContext` bypasses the Redis + in-process cache in `tenantRouting.ts::lookupTenant`. This should call `lookupTenant` (or an equivalent) rather than raw `Tenant.findOne`.

---

## 10 Interview Questions

1. Why does `buildGraphQLContext` take `Partial<Request>` instead of `Request`? What does this enable?
2. There are two calls to `resolveAuthenticatedUser` per request — one in `authMiddleware` and one in `buildGraphQLContext`. How would you fix this without breaking the non-Express calling paths?
3. What is the purpose of the `'demo'` fallback in `tenantSubdomain` resolution? What could go wrong in production?
4. Why is `tenantDoc` typed as `ITenant | undefined` rather than `ITenant` in the returned context? What does this require resolver code to do?
5. The context includes both `tenant: string` (subdomain) and `tenantDoc: ITenant | undefined`. Why are both needed? Which do resolvers use more?
6. How does Apollo Server pass the context to resolvers? Where is `buildGraphQLContext` registered in the server setup?
7. If a GraphQL request arrives with a valid JWT for Tenant A but the HTTP host header resolves to Tenant B, what does `buildGraphQLContext` return? Is this caught?
8. What would break if `buildGraphQLContext` were made synchronous (removed `async/await`)? Which parts would fail?
9. How would you add a DataLoader to the context (for batching DB reads within a single request)?
10. What is the difference between the GraphQL context and GraphQL directives for enforcing authentication? When would you use each?

---

## What Would You Change? — 3 Concrete Improvements

**1. Read from `req.user` / `req.authError` set by `authMiddleware` to avoid double DB call:**
```typescript
let user: IUser | undefined = req.user as IUser | undefined;
let authError: AuthErrorCode | undefined = req.authError as AuthErrorCode | undefined;

if (!user && !authError && token) {
  // Only resolve if authMiddleware didn't already run
  const resolved = await resolveAuthenticatedUser(token);
  user = resolved.user;
  authError = resolved.authError;
}
```

**2. Replace raw `Tenant.findOne` with the cached `lookupTenant` from tenantRouting.ts:**
```typescript
import { lookupTenant } from '../middleware/tenantRouting';
// ...
if (!tenantDoc && tenantSubdomain) {
  const result = await lookupTenant(tenantSubdomain);
  if (result) {
    tenantDoc = result.tenant;
    tenantId = result.tenantId;
  }
}
```
This re-uses the two-tier Redis + in-process cache instead of hitting MongoDB on every GraphQL request.

**3. Remove the `'demo'` fallback and make missing-tenant explicit:**
```typescript
const tenantSubdomain =
  req.subdomain ||
  req.tenant?.subdomain ||
  (headers['x-tenant'] as string | undefined) ||
  undefined; // No silent fallback — callers that need a tenant will get undefined

// Return context with explicit no-tenant state:
return {
  req: req as Request,
  res: res as Response,
  user,
  tenant: tenantSubdomain ?? '',
  tenantDoc,
  tenantId,
  authError,
  hasTenant: !!tenantDoc, // explicit boolean resolvers can check
};
```

---

## Related Concepts to Review

- Apollo Server context function — when it runs and what it receives
- Express middleware execution order and how `req` properties accumulate
- DataLoader pattern for N+1 query prevention in GraphQL
- MongoDB `.lean()` performance vs full Mongoose documents
- `Partial<T>` TypeScript utility type — what it enables and what it loses
- Multi-tenant GraphQL API design patterns
- Double-read problems in middleware chains and how to detect them

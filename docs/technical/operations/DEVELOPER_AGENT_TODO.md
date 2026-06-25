# Developer Agent TODO

> **Parent:** [Technical docs](../README.md) · **Related:** [CHECKLIST.md](./CHECKLIST.md), [../../SECURITY_HARDENING.md](../../SECURITY_HARDENING.md)

> **Senior Architect Analysis — LuxGen Monorepo**
> Generated: 2026-06-20
> Scope: Full codebase audit — bugs, security, features, enhancements, architecture, dead code, missing tests, infra
>
> **How to use:** Work top-to-bottom within each severity tier. Mark `[x]` when the fix is committed and verified. Each item includes: file path + line, tags, and specific description.
>
> **Tag legend:**
> `[bug]` · `[security]` · `[feat]` · `[enhancement]` · `[arch]` · `[type]` · `[dead-code]` · `[missing-test]` · `[infra]` · `[style]`

---

## CRITICAL — Fix Before Any Deployment

- [x] **C-01** `[security]` `[bug]`
      **File:** `apps/web/pages/api/agent/apply.ts` lines 4–30
      `/api/agent/apply` endpoint has **zero authentication**. Any unauthenticated caller with a known `sessionId` can apply staged files to the host filesystem. Compare with `commit.ts:19` and `merge.ts:11` which correctly call `requireAgentAuth`. Add `requireAgentAuth` guard immediately.

- [x] **C-02** `[security]` `[bug]`
      **File:** `apps/web/pages/api/agent/pr.ts` lines 4–28
      `/api/agent/pr` (GitHub PR creation) has **zero authentication**. Any caller with a `sessionId` can create PRs in the repository. Add `requireAgentAuth` guard.

- [x] **C-03** `[security]`
      **File:** `packages/auth/src/jwt.ts` lines 11, 19 · `packages/config/src/env.ts` line 23
      `JWT_SECRET` falls back to the literal `'your-secret-key'` in both `generateToken` and `verifyToken`. Any deployment without `JWT_SECRET` set issues trivially forgeable tokens. Remove the fallback entirely; throw at startup if the secret is absent.

- [x] **C-04** `[security]` `[infra]`
      **File:** `k8s/secret.yaml` lines 9–16
      `secret.yaml` is **committed to the repository** with plaintext `stringData` placeholders including `JWT_SECRET` and `MONGODB_URI` with credentials. Even placeholder secrets in source control train developers to commit real values. Replace with an ExternalSecret, Sealed Secret, or SOPS-encrypted file; delete `secret.yaml` from the repo and add it to `.gitignore`.
      _Already resolved: `k8s/secret.yaml` is gitignored; only `k8s/secret.yaml.example` is tracked._

- [x] **C-05** `[security]` `[bug]`
      **File:** `apps/api/src/middleware/roleManagement.ts` line 26
      `requireRole(UserRole.ADMIN)` uses strict equality (`!==`), so `SUPER_ADMIN` is rejected from any `ADMIN`-gated endpoint (e.g., `auth.ts:297` role assignment, `auth.ts:350` activation). Implement a role hierarchy check: `SUPER_ADMIN ≥ ADMIN ≥ USER`.

- [x] **C-06** `[security]`
      **File:** `apps/api/src/routes/auth.ts` lines 248–281
      Invite endpoint generates a temporary password via `Math.random().toString(36)` (non-cryptographic) and **returns it in the JSON response body**. The comment at line 280 acknowledges it should be emailed but it was never implemented. Use `crypto.randomBytes(16).toString('hex')` and deliver via email; never expose in HTTP response.

- [x] **C-07** `[security]`
      **File:** `apps/api/src/routes/billing.ts` lines 8–18
      `GET /api/billing/plan` returns full billing info (including `stripeCustomerId`) for any `?tenant=<id>` with **no authentication or authorization check**. Add auth middleware and validate the requesting user belongs to the queried tenant.

---

## HIGH — Fix Before Staging Release

- [x] **H-01** `[security]`
      **File:** `apps/api/src/utils/jwt.ts` lines 37–54
      `verifyToken` decodes the JWT header without verification to extract `kid`, then uses that `kid` to select the signing key. An attacker can craft a token with an arbitrary `kid` pointing to a weak/known key and bypass tenant-key isolation. Validate `kid` against an allowlist before key selection.

- [ ] **H-02** `[security]`
      **File:** `apps/api/src/routes/admin.ts` lines 43–62
      Generated tenant keys are stored in the in-process `tenantKeyManager` only — never persisted. On any server restart, all tokens signed with generated keys become invalid. Persist keys to the database and implement proper token invalidation for rotated keys.

- [x] **H-03** `[security]` `[bug]`
      **File:** `apps/api/src/services/automationService.ts` lines 96, 128–139
      `updateAutomation`, `toggleAutomation`, `deleteAutomation`, and `getAutomationById` accept only an `id` with no tenant scoping. Any authenticated user can mutate automations belonging to a different tenant by guessing the MongoDB ObjectId. Add `{ _id: id, tenantId: ctx.tenantId }` to all queries.

- [x] **H-04** `[security]` `[bug]`
      **File:** `apps/api/src/services/courseService.ts` lines 59–97
      `updateCourse`, `deleteCourse`, `enrollStudent`, and `unenrollStudent` do not validate the course belongs to the caller's tenant. Scope all queries by `tenantId`.

- [x] **H-05** `[security]`
      **File:** `apps/api/src/services/userService.ts` lines 50–53
      `updateUser(id, input)` calls `findByIdAndUpdate` with no tenant ownership check. Any caller reaching this method can update any user record. Add a tenant-scoped lookup before the update.

- [x] **H-06** `[bug]`
      **File:** `apps/api/src/utils/errorHandler.ts` line 30
      Duplicate-key error detection uses `error.name === 'MongoError'`, but Mongoose 6+ throws `MongoServerError`. The check never matches in production, turning all duplicate-email registrations into unhandled 500s. Fix to `error.name === 'MongoServerError' || error.code === 11000`.

- [x] **H-07** `[bug]`
      **File:** `apps/api/src/routes/jobs.ts` lines 6–9
      If `JOBS_API_KEY` is unset in production, `authorizeJob` falls through to the `NODE_ENV` check. An unset key in prod silently opens all job endpoints. The safe default should be to reject when the key is unset regardless of environment.

- [x] **H-08** `[security]`
      **File:** `apps/web/pages/login.tsx` line 65
      Open redirect: `router.push(redirect)` where `redirect = router.query.redirect`. The guard `startsWith('/')` doesn't block `//evil.com` (protocol-relative) redirects. Validate redirect against a strict pathname-only regex or server-controlled allowlist.

- [x] **H-09** `[security]`
      **File:** `apps/web/pages/register.tsx` lines 26–31
      Tenant is resolved from `window.location.hostname` with hard-coded string checks. There is no server-side authoritative resolution; the tenant value flows unchecked into a GraphQL mutation, allowing cross-tenant account creation. Resolve tenant authoritatively server-side.

- [x] **H-10** `[bug]` `[security]`
      **File:** `apps/web/pages/register.tsx` lines 37–43
      Role mapping inverts business logic: form value `ADMIN` → backend `INSTRUCTOR`, `SUPER_ADMIN` → `ADMIN`. This allows self-assignment of elevated roles. The GraphQL mutation must reject any role above `STUDENT`/`USER` during self-registration without a server-side admin token.

- [x] **H-11** `[bug]`
      **File:** `apps/web/pages/dashboard.tsx` lines 52–57
      `errorPolicy: 'ignore'` on `GET_DASHBOARD_DATA` swallows all GraphQL errors including auth failures. A user with an expired token sees an empty state instead of being redirected to login. Remove `errorPolicy: 'ignore'` and handle errors explicitly.

- [x] **H-12** `[arch]` `[bug]`
      **File:** `apps/web/pages/automations/index.tsx` lines 84–174
      `INITIAL_AUTOMATIONS` and `RUN_HISTORY` are hard-coded mock arrays displayed when `useGraphql` is false. In production, a tenant with zero automations will see fabricated demo data as real data. Remove the mock data path; show an empty state when there are no automations.

- [x] **H-13** `[infra]`
      **File:** `k8s/agent-worker.yaml` lines 48–65
      Agent-worker liveness and readiness probes hit `http://localhost:4000/health` but the worker exposes no HTTP server. Probes will always fail → infinite crash-loop restarts. Either expose a minimal health endpoint in the worker or switch to an `exec` probe checking process state.

- [x] **H-14** `[infra]`
      **File:** `k8s/configmap.yaml` lines 10–11 vs `k8s/ingress.yaml`
      `NEXT_PUBLIC_API_URL` points to `api.luxgen.yourdomain.com` but the Ingress defines no rule for that subdomain — it only routes `luxgen.yourdomain.com/api/...`. The frontend will be unable to reach the API in production. Align the ConfigMap URL with the actual Ingress route.

- [ ] **H-15** `[infra]`
      **File:** `k8s/ingress.yaml` lines 13–17, 42–47
      TLS configuration is entirely commented out and there is no `ssl-redirect`. All production traffic would be served over plaintext HTTP. Uncomment TLS, reference the TLS secret, and add the SSL redirect annotation.

- [ ] **H-16** `[arch]`
      **File:** `packages/auth/src/roles.ts` lines 1–5 vs `packages/db/src/user.ts` lines 3–10 vs `apps/api/src/schema/user/typeDefs.ts` lines 17–21
      Three separate, divergent `UserRole` enum definitions exist across the monorepo. `@luxgen/auth` has `{SUPER_ADMIN, ADMIN, USER}`; `@luxgen/db` has `{SUPER_ADMIN, ADMIN, INSTRUCTOR, STUDENT, USER}`; the GraphQL schema has `{ADMIN, INSTRUCTOR, STUDENT}`. Consolidate to a single canonical definition in `@luxgen/db` or a dedicated `@luxgen/types` package.

- [ ] **H-17** `[arch]`
      **File:** `packages/db/src/tenant.ts` lines 62–64 vs `packages/db/src/subscription.ts` line 5
      Billing plan is stored in two separate places: `ITenant.metadata.plan` and `ITenantSubscription.plan`. These can diverge (e.g., a Stripe webhook that updates the subscription but not the tenant). Pick one authoritative source and remove the other.

- [ ] **H-18** `[arch]`
      **File:** `apps/web/lib/plan-gate.ts` lines 11–28
      `fetchTenantBilling` makes an outbound HTTP call from a Next.js API route back to the backend to check billing. This adds latency, a failure mode (500 → silent default to 'free'), and a circular dependency locally. Read billing status directly from the DB or a shared module.

- [ ] **H-19** `[feat]`
      **File:** `apps/api/src/routes/auth.ts` (missing endpoint)
      No password reset / forgot-password endpoint exists anywhere. `config/tenants/demo/features/index.ts:34` has `passwordReset: true` but the API is completely absent. Implement `POST /api/auth/forgot-password` and `POST /api/auth/reset-password`.

- [ ] **H-20** `[feat]`
      **File:** `apps/api/src/routes/auth.ts` (missing endpoint)
      No token refresh endpoint exists. Tokens expire after 7 days with no silent renewal path. Implement `POST /api/auth/refresh` using a separate long-lived refresh token (httpOnly cookie).

- [ ] **H-21** `[feat]`
      **File:** `apps/api/src/services/automationService.ts` (entire service)
      `AutomationService` provides CRUD but automations are never executed. `runCount` and `lastRunAt` fields are set only in seed data. Implement `executeAutomation` and hook it to the trigger events defined in `getAutomationsByTrigger`.

- [ ] **H-22** `[security]` `[feat]`
      **File:** `apps/api/src/schema/user/resolvers.ts` line 7
      `user(id)` and `users(tenantId)` resolvers have no tenant-scoping authorization. Any authenticated user can query any user from any tenant. Add a tenant ownership check or a role-based restriction.

- [x] **H-23** `[security]`
      **File:** `apps/api/src/schema/listing/resolvers.ts` lines 63–66
      `submitListingApplication` does not verify the listing belongs to the caller's tenant. A user from tenant A can submit applications against listings from tenant B. Add `tenantId` scoping to the listing lookup before accepting the application.

- [x] **H-24** `[bug]`
      **File:** `apps/agent-worker/src/index.ts` lines 5–6
      Agent worker loads `.env` files via hard-coded relative paths from `__dirname`. Inside a Docker container or K8s pod, `__dirname` resolves to the compiled `dist/` directory and the `../../../` traversal won't reach the monorepo root. All env vars silently fail to load. Use explicit `ENV_FILE` env var or inject vars via K8s ConfigMap/Secret.

- [ ] **H-25** `[missing-test]`
      **File:** `apps/api/src/services/` — all five: `listingService.ts`, `billingService.ts`, `courseService.ts`, `automationService.ts`, `groupService.ts`
      Zero test files exist for any of these services. The entire billing, course, listing, automation, and group domains are untested. Create integration test suites for each service.

- [ ] **H-26** `[arch]`
      **File:** `apps/api/src/config/tenants.ts` vs `apps/api/src/config/tenants/index.ts`
      Two files define the same tenant configurations with identical structure and duplicated helper functions. `routes/tenant.ts:3` imports only the legacy flat file; the modular `tenants/index.ts` is entirely dead. Delete one: migrate to `tenants/index.ts` and update the import in `routes/tenant.ts`.

- [x] **H-27** `[bug]`
      **File:** `apps/web/pages/groups/[id].tsx` lines 53–56
      Group deletion shows a confirm dialog then a snackbar saying "not wired yet." The GraphQL `deleteGroup` mutation and resolver are fully implemented (`schema/group/resolvers.ts:68`). Wire the frontend button to the existing mutation.

---

## MEDIUM — Fix in Next Sprint

- [x] **M-01** `[bug]`
      **File:** `apps/api/src/services/groupService.ts` lines 55–56
      Relay-spec `pageInfo` fields are computed incorrectly: `hasPreviousPage` is set to `hasCursor` when paginating forward (should always be `false`), and `hasNextPage` is set to `hasCursor` when paginating backward. This breaks standard Relay infinite-scroll clients.

- [ ] **M-02** `[bug]`
      **File:** `apps/api/src/services/listingService.ts` lines 36–43
      `uniqueSlug` uses a sequential polling loop to find a free slug — a classic TOCTOU race condition. Two concurrent `createDraft` calls with the same name will both see the slug as free. Add a unique index on `{tenantId, slug}` and handle the duplicate-key error to retry.

- [x] **M-03** `[bug]`
      **File:** `apps/web/components/agent/AgentChat.tsx` lines 370, 199, 225
      UI tells the user "Press Escape to stop" but no `keydown` listener exists that calls `abortRef.current?.abort()`. The Escape key does nothing. Wire `window.addEventListener('keydown', handler)` in the message-streaming `useEffect`.

- [x] **M-04** `[bug]`
      **File:** `apps/api/src/services/groupService.ts` lines 253–268
      `deleteGroup` transaction throws a `GraphQLError` inside `withTransaction`. Mongoose transactions expect standard `Error` instances to trigger rollback. Throw a plain `Error` inside the transaction and convert to `GraphQLError` after the `await`.

- [x] **M-05** `[security]` `[bug]`
      **File:** `apps/api/src/app.ts` line 55
      `express.json({ limit: '10mb' })` applies to all routes including `/api/auth/login`. A 10MB body on a login endpoint is never legitimate and allows DoS before the rate limiter fires. Tighten: set `'50kb'` globally and allow larger limits only on specific upload routes.

- [ ] **M-06** `[arch]`
      **File:** `apps/api/src/services/userService.ts` vs `apps/api/src/routes/auth.ts`
      `UserService.login()` and `UserService.register()` duplicate logic from the REST route handlers; neither the REST routes nor the GraphQL resolvers use these service methods. Consolidate: migrate routes to use the service methods, or delete the duplicate service logic.

- [ ] **M-07** `[arch]`
      **File:** `apps/api/src/context/buildContext.ts` lines 30–51 vs `apps/api/src/middleware/auth.ts` lines 8–43
      Token verification logic is duplicated: both files independently call `verifyToken`, load the user from DB, call `isAccountActive`, and check tenant mismatch. Extract to a single `resolveAuthenticatedUser(token)` function in a shared utility.

- [ ] **M-08** `[arch]` `[type]`
      **File:** `apps/api/src/config/tenants/index.ts` line 80 · `apps/api/src/config/tenants.ts` line 78
      `createdBy: null as any` used to satisfy the `ITenant` type, erasing type safety where a valid ObjectId is expected. Define a proper seed-user ObjectId constant or make `createdBy` optional in `ITenant` for system-seeded tenants.

- [x] **M-09** `[bug]`
      **File:** `apps/web/pages/login.tsx` lines 93–96
      `handleForgotPassword` shows `showSuccess('Password reset email sent!')` with no API call behind it. Users receive a fake success notification. Disable the button until H-19 (forgot-password endpoint) is implemented, or display a "coming soon" message instead.

- [ ] **M-10** `[bug]`
      **File:** `apps/web/pages/dashboard.tsx` lines 33–38
      `transformUserData(tenant)` runs in a `useEffect` on every `tenant` change and sets user state, but the initial `useState` (line 18) already calls `transformUserData`. If `GET_DASHBOARD_DATA` returns actual user data it is never applied. Consolidate into a single data source.

- [ ] **M-11** `[bug]`
      **File:** `apps/web/pages/api/agent/chat.ts` lines 120–122
      After cancellation, `res.end()` may already be called by the `close` listener (lines 94–97). A subsequent write to the closed `ServerResponse` from the `done` event path will throw an unhandled error. Guard all writes after cancellation with an `isClosed` flag.

- [x] **M-12** `[bug]`
      **File:** `apps/web/pages/api/users/me.ts` and `apps/web/pages/api/users/current.ts`
      These two files are **byte-for-byte identical** — same handler, same imports, same JWT verification. Two separate routes (`/api/users/me` and `/api/users/current`) serve the exact same response. Delete `current.ts` and update all callers to use `/api/users/me`.

- [ ] **M-13** `[security]`
      **File:** `apps/web/pages/api/schema/index.ts` lines 73–93
      Custom JSON scalar `parseLiteral` calls `JSON.parse(field.value.value)` on raw AST string values inside `ObjectValue` and `ListValue` cases. This throws on non-JSON strings and corrupts data silently. Replace with the battle-tested `GraphQLJSON` from `graphql-scalars`.

- [ ] **M-14** `[enhancement]`
      **File:** `apps/api/src/lib/redis.ts` lines 16–27
      Redis client uses `lazyConnect: true` but `connect()` is never explicitly called. The `.on('error', () => {})` handler swallows all errors with no log message, making Redis misconfiguration invisible. Log the error, and add an explicit startup connectivity check.

- [ ] **M-15** `[enhancement]`
      **File:** `apps/api/src/utils/logger.ts` lines 9–12
      Logger reads `LOG_LEVEL` once at construction time (stale in test environments) and has no structured JSON output mode for production log aggregators. Add a `JSON_LOGS=true` env flag to emit structured output and read `LOG_LEVEL` per-call.

- [ ] **M-16** `[arch]` `[bug]`
      **File:** `apps/web/pages/billing/index.tsx` lines 44, 262–273
      The "Dev plan override" UI is gated on the build-time variable `NEXT_PUBLIC_APP_ENV`. If a dev build artifact is promoted to production, these buttons will be visible and functional in production. Gate this UI server-side using a runtime check, not a baked-in build variable.

- [ ] **M-17** `[infra]`
      **File:** `k8s/api.yaml` lines 27–36
      `MONGODB_URI` is mounted both via `envFrom: secretRef` and via an individual `secretKeyRef`. The duplicate mount is redundant and creates precedence confusion. Use only one approach.

- [ ] **M-18** `[infra]`
      **File:** `k8s/mongodb.yaml` lines 57–72
      MongoDB runs as a single-replica StatefulSet with no replica set configuration, no backup CronJob, and no `PodDisruptionBudget`. Pod eviction causes data unavailability. Add `--replSet rs0` flag, a backup job, and a PDB with `minAvailable: 1`.

- [ ] **M-19** `[infra]`
      **File:** `k8s/deploy.sh` lines 26–53
      Deploy script has interactive `read -p` prompts, making it incompatible with CI/CD pipelines. Add `set -euo pipefail`, validate that all required secret keys are present in `.env.production` before applying, and document the non-interactive invocation pattern.

- [ ] **M-20** `[missing-test]`
      **File:** `apps/api/src/middleware/loginRateLimit.ts` lines 33–40
      The Redis-path of `isRateLimited` (the increment + pexpire flow) has no test coverage. Only the in-memory fallback is exercised by the existing test suite. Add a test with a mocked Redis client.

- [ ] **M-21** `[bug]`
      **File:** `apps/web/pages/index.tsx` lines 17–20
      Redirect to `/dashboard` only fires when `currentTenant !== 'demo'`. An already-authenticated `demo` tenant user visiting `/` sees the public landing page with Sign In / Create Account links rather than being redirected. Apply the redirect for all authenticated users regardless of tenant.

- [ ] **M-22** `[feat]`
      **File:** `apps/web/pages/groups/[id].tsx` — `apps/web/pages/login.tsx:76-91`
      Social login (Google, LinkedIn, GitHub) UI is fully rendered with loading states and redirect messages but is entirely unimplemented (stub `TODO` comments). Either implement OAuth flows or hide the buttons behind a feature flag until implementation is ready.

- [ ] **M-23** `[bug]`
      **File:** `apps/web/components/agent/AIStudioSidekickPanel.tsx` line 14–17, 35
      `sessionId` initialises as `''` and is only set via `useEffect` on mount, causing a `null` render flash and SSR hydration mismatch. Initialise `sessionId` with a stable SSR-safe value (e.g., `useId()` or generate on the server side via `getServerSideProps`).

- [x] **M-24** `[missing-test]`
      **File:** `packages/billing/src/usage-limits.ts` line 52
      `assertWithinLimit` uses `>=` (block at limit, not over limit) — a non-obvious edge case. No test covers the exact-limit boundary. Add unit tests for at-limit, under-limit, and over-limit for each plan tier.

---

## LOW — Tech Debt / Polish

- [x] **L-01** `[dead-code]`
      **File:** `apps/api/src/middleware/tenant.ts`
      File is marked `@deprecated` in its JSDoc, must not be registered in `app.ts`, yet still exists. Delete the file to prevent accidental future registration.

- [x] **L-02** `[dead-code]`
      **File:** `apps/web/components/layout/Sidebar.tsx`
      Legacy sidebar component never imported by any page (pages use the `@luxgen/ui` sidebar). It has its own static nav array with emoji icons and hardcoded routes. Delete the file.

- [x] **L-03** `[dead-code]`
      **File:** `apps/web/pages/api/users/current.ts`
      Duplicate of `me.ts` (see M-12). Once `me.ts` is canonical, delete this file entirely.

- [x] **L-04** `[dead-code]`
      **File:** `packages/auth/src/roles.ts` lines 59–90
      `isSuperAdmin`, `isAdmin`, `canManageUsers`, `canInviteUsers`, etc. are thin wrappers never imported anywhere outside the package's own `index.ts`. The entire module is superseded by `@luxgen/db` role definitions. Delete or consolidate.

- [x] **L-05** `[bug]`
      **File:** `apps/api/src/config/tenants/index.ts` line 79
      `config.integrations.emailProvider` for the demo tenant is set to `demoFeaturesConfig.platform.analytics.provider` (an analytics provider, not an email provider) — this is a copy-paste error. In `tenants.ts:68` it is correctly set to `'sendgrid'`. Fix the modular config.

- [x] **L-06** `[type]`
      **File:** `apps/api/src/utils/jwt.ts` line 25
      `expiresIn` cast with `as any` to satisfy `jwt.sign`. `jsonwebtoken` v9 accepts `string | number` directly. Remove the cast and type the parameter correctly.

- [ ] **L-07** `[type]`
      **File:** `apps/api/src/middleware/roleManagement.ts` lines 69, 188, 217
      `req.user!.role as any` passed to `hasPermission` because `IUser.role` is typed as `string`. Type `IUser.role` as `UserRole` (from the canonical definition after H-16 is fixed) to eliminate these casts.

- [ ] **L-08** `[type]`
      **File:** `apps/api/src/schema/group/resolvers.ts` — throughout
      All resolver arguments typed as `any` (`_: any`, `{ input }: { input: any }`). Add precise input types matching the GraphQL schema for all 12 mutations and queries.

- [ ] **L-09** `[type]`
      **File:** `apps/web/pages/automations/index.tsx` line 864 · `apps/web/pages/dashboard.tsx` line 149
      `getServerSideProps` typed as `async (ctx: any)`. Replace with `GetServerSideProps<PageProps>` for proper Next.js type safety.

- [ ] **L-10** `[type]`
      **File:** `apps/api/src/schema/index.ts` lines 73–93
      Custom JSON scalar `parseLiteral` uses `any` throughout; the `ast` parameter should be typed as `graphql.ValueNode`. (Related to M-13 which replaces this implementation entirely.)

- [x] **L-11** `[type]`
      **File:** `apps/web/pages/agent.tsx` line 19
      `useState<any>(null)` for user state. Reference the `SessionUser` type from `../lib/session`.

- [x] **L-12** `[enhancement]`
      **File:** `apps/api/src/db/connect.ts` lines 5–18
      `connectDB` calls `process.exit(1)` on connection error and does not monitor `disconnected`/`reconnected` events. Silent reconnection failures cause all DB calls to hang. Add `mongoose.connection.on('disconnected', ...)` handler and set `serverSelectionTimeoutMS` / `socketTimeoutMS` in options.

- [ ] **L-13** `[enhancement]`
      **File:** `packages/db/src/connection.ts` lines 1–21
      No Mongoose connection options set: no `serverSelectionTimeoutMS`, `socketTimeoutMS`, or pool size. Production defaults (30s selection timeout, unbounded pool) are inappropriate. Configure sensible production options.

- [x] **L-14** `[enhancement]`
      **File:** `apps/api/src/services/listingService.ts` lines 242–262
      `getPublishedListings`, `getListingBySlug`, `getApplicationsForReview`, and `getApplicantListings` return full Mongoose documents. Add `.lean()` to all read-only queries for performance.

- [x] **L-15** `[arch]`
      **File:** `apps/web/components/billing/PlanGate.tsx` line 27
      `planRank` duplicates the plan ordering from `@luxgen/billing`. If a new plan tier is added to the billing package, `PlanGate` will silently compute wrong rankings. Export `planRank` (or an equivalent comparison function) from `@luxgen/billing` and import it here.

- [x] **L-16** `[style]`
      **File:** `apps/api/src/routes/auth.ts` lines 89, 171, 215, 284, 336, 386
      All six route error handlers use `console.error(...)` directly, bypassing the project's `logger` utility. Replace with `logger.error(...)` for consistency and structured output.

- [x] **L-17** `[style]`
      **File:** `apps/api/src/app.ts` line 89
      Apollo `formatError` uses `console.error('GraphQL Error:', error)` instead of `logger.error(...)`. Inconsistent with the rest of the codebase.

- [x] **L-18** `[style]`
      **File:** `apps/web/pages/dashboard.tsx` lines 33, 35, 37
      Debug `console.log` statements with emoji (`'🔍 Dashboard useEffect running'`, etc.) left in production code. Remove all debug logs from this file.

- [x] **L-19** `[style]` `[security]`
      **File:** `apps/web/pages/login.tsx` line 37
      `console.log('🔐 Attempting login with email:', data.email)` logs PII (email address) to the browser console on every login attempt. Remove.

- [x] **L-20** `[style]` `[security]`
      **File:** `apps/web/pages/register.tsx` lines 33–34
      `console.log('Registration data:', data)` logs full form data including password fields to the browser console. Remove immediately.

- [x] **L-21** `[style]` `[security]`
      **File:** `apps/web/pages/api/users/me.ts` line 122 · `apps/web/pages/api/users/current.ts` line 122
      Server-side `console.log` outputs user name, email, role, and tenant on every authenticated request. PII should not appear in server logs without scrubbing. Remove or redact.

- [ ] **L-22** `[style]`
      **File:** `apps/web/pages/dashboard.tsx` line 100
      Hard-coded `'Welcome to Ideavibes'` in the banner carousel. Banner content must come from tenant configuration. Reference `tenantConfig.brand.name` or equivalent.

- [ ] **L-23** `[enhancement]`
      **File:** `apps/api/src/services/groupService.ts` line 128 vs line 136
      `baseQuery` initialises with `isActive: true` hardcoded, but the total count is calculated from `baseQuery` before the `isActive` override is applied to `cursorFilter`. This causes the total count to always reflect active-only records even when filtering for inactive. Apply the filter to `baseQuery` first, then derive `cursorFilter` from it.

- [ ] **L-24** `[infra]`
      **File:** `k8s/agent-worker.yaml` lines 1–66
      Agent-worker has `replicas: 1` and no job re-enqueue on crash. In-flight jobs are lost on pod restart. Enable BullMQ's stalled-job recovery (`stalledInterval`, `maxStalledCount`) to re-enqueue jobs lost to crashes.

- [ ] **L-25** `[missing-test]` `[infra]`
      No integration tests for the K8s deploy script or multi-service startup sequence. The Ingress/ConfigMap URL mismatch (H-14) would have been caught by a deployment smoke test. Add a basic smoke test that validates the ConfigMap URLs match Ingress hostnames.

---

## Progress Summary

| Tier      | Total  | Done  |
| --------- | ------ | ----- |
| CRITICAL  | 7      | 7 ✅  |
| HIGH      | 27     | 0     |
| MEDIUM    | 24     | 0     |
| LOW       | 25     | 0     |
| **Total** | **83** | **7** |

> Update the Done column as items are completed. When all items in a tier are done, mark the tier header with ✅.

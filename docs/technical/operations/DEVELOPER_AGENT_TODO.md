# Developer Agent TODO

> **Parent:** [Technical docs](../README.md) · **Related:** [CHECKLIST.md](./CHECKLIST.md), [../../SECURITY_HARDENING.md](../../SECURITY_HARDENING.md)

> **Senior Architect Analysis — LuxGen Monorepo**
> Generated: 2026-06-20 · Agent subsystem review added: 2026-06-25
> Scope: Full codebase audit — bugs, security, features, enhancements, architecture, dead code, missing tests, infra
>
> **How to use:** Work top-to-bottom within each severity tier. Mark `[x]` when the fix is committed and verified. Each item includes: file path + line, tags, and specific description.
>
> **Tag legend:**
> `[bug]` · `[security]` · `[feat]` · `[enhancement]` · `[arch]` · `[type]` · `[dead-code]` · `[missing-test]` · `[infra]` · `[style]`
>
> **Agent subsystem items** use the `A-` prefix and appear in their own section below the main tiers.

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

- [x] **H-02** `[security]`
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

- [x] **H-15** `[infra]`
      **File:** `k8s/ingress.yaml` lines 13–17, 42–47
      TLS configuration is entirely commented out and there is no `ssl-redirect`. All production traffic would be served over plaintext HTTP. Uncomment TLS, reference the TLS secret, and add the SSL redirect annotation.

- [ ] **H-16** `[arch]`
      **File:** `packages/auth/src/roles.ts` lines 1–5 vs `packages/db/src/user.ts` lines 3–10 vs `apps/api/src/schema/user/typeDefs.ts` lines 17–21
      Three separate, divergent `UserRole` enum definitions exist across the monorepo. `@luxgen/auth` has `{SUPER_ADMIN, ADMIN, USER}`; `@luxgen/db` has `{SUPER_ADMIN, ADMIN, INSTRUCTOR, STUDENT, USER}`; the GraphQL schema has `{ADMIN, INSTRUCTOR, STUDENT}`. Consolidate to a single canonical definition in `@luxgen/db` or a dedicated `@luxgen/types` package.

- [ ] **H-17** `[arch]`
      **File:** `packages/db/src/tenant.ts` lines 62–64 vs `packages/db/src/subscription.ts` line 5
      Billing plan is stored in two separate places: `ITenant.metadata.plan` and `ITenantSubscription.plan`. These can diverge (e.g., a Stripe webhook that updates the subscription but not the tenant). Pick one authoritative source and remove the other.

- [x] **H-18** `[arch]`
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

- [x] **H-22** `[security]` `[feat]`
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

- [x] **H-26** `[arch]`
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

- [x] **M-02** `[bug]`
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

- [x] **M-06** `[arch]`
      **File:** `apps/api/src/services/userService.ts` vs `apps/api/src/routes/auth.ts`
      `UserService.login()` and `UserService.register()` duplicate logic from the REST route handlers; neither the REST routes nor the GraphQL resolvers use these service methods. Consolidate: migrate routes to use the service methods, or delete the duplicate service logic.

- [x] **M-07** `[arch]`
      **File:** `apps/api/src/context/buildContext.ts` lines 30–51 vs `apps/api/src/middleware/auth.ts` lines 8–43
      Token verification logic is duplicated: both files independently call `verifyToken`, load the user from DB, call `isAccountActive`, and check tenant mismatch. Extract to a single `resolveAuthenticatedUser(token)` function in a shared utility.

- [x] **M-08** `[arch]` `[type]`
      **File:** `apps/api/src/config/tenants/index.ts` line 80 · `apps/api/src/config/tenants.ts` line 78
      `createdBy: null as any` used to satisfy the `ITenant` type, erasing type safety where a valid ObjectId is expected. Define a proper seed-user ObjectId constant or make `createdBy` optional in `ITenant` for system-seeded tenants.

- [x] **M-09** `[bug]`
      **File:** `apps/web/pages/login.tsx` lines 93–96
      `handleForgotPassword` shows `showSuccess('Password reset email sent!')` with no API call behind it. Users receive a fake success notification. Disable the button until H-19 (forgot-password endpoint) is implemented, or display a "coming soon" message instead.

- [x] **M-10** `[bug]`
      **File:** `apps/web/pages/dashboard.tsx` lines 33–38
      `transformUserData(tenant)` runs in a `useEffect` on every `tenant` change and sets user state, but the initial `useState` (line 18) already calls `transformUserData`. If `GET_DASHBOARD_DATA` returns actual user data it is never applied. Consolidate into a single data source.

- [x] **M-11** `[bug]`
      **File:** `apps/web/pages/api/agent/chat.ts` lines 120–122
      After cancellation, `res.end()` may already be called by the `close` listener (lines 94–97). A subsequent write to the closed `ServerResponse` from the `done` event path will throw an unhandled error. Guard all writes after cancellation with an `isClosed` flag.

- [x] **M-12** `[bug]`
      **File:** `apps/web/pages/api/users/me.ts` and `apps/web/pages/api/users/current.ts`
      These two files are **byte-for-byte identical** — same handler, same imports, same JWT verification. Two separate routes (`/api/users/me` and `/api/users/current`) serve the exact same response. Delete `current.ts` and update all callers to use `/api/users/me`.

- [x] **M-13** `[security]`
      **File:** `apps/web/pages/api/schema/index.ts` lines 73–93
      Custom JSON scalar `parseLiteral` calls `JSON.parse(field.value.value)` on raw AST string values inside `ObjectValue` and `ListValue` cases. This throws on non-JSON strings and corrupts data silently. Replace with the battle-tested `GraphQLJSON` from `graphql-scalars`.

- [x] **M-14** `[enhancement]`
      **File:** `apps/api/src/lib/redis.ts` lines 16–27
      Redis client uses `lazyConnect: true` but `connect()` is never explicitly called. The `.on('error', () => {})` handler swallows all errors with no log message, making Redis misconfiguration invisible. Log the error, and add an explicit startup connectivity check.

- [x] **M-15** `[enhancement]`
      **File:** `apps/api/src/utils/logger.ts` lines 9–12
      Logger reads `LOG_LEVEL` once at construction time (stale in test environments) and has no structured JSON output mode for production log aggregators. Add a `JSON_LOGS=true` env flag to emit structured output and read `LOG_LEVEL` per-call.

- [x] **M-16** `[arch]` `[bug]`
      **File:** `apps/web/pages/billing/index.tsx` lines 44, 262–273
      The "Dev plan override" UI is gated on the build-time variable `NEXT_PUBLIC_APP_ENV`. If a dev build artifact is promoted to production, these buttons will be visible and functional in production. Gate this UI server-side using a runtime check, not a baked-in build variable.
      _Resolved: dev override UI removed from billing pages; `setTenantPlanDev` is server-gated via `BILLING_DEV_MODE` only._

- [x] **M-17** `[infra]`
      **File:** `k8s/api.yaml` lines 27–36
      `MONGODB_URI` is mounted both via `envFrom: secretRef` and via an individual `secretKeyRef`. The duplicate mount is redundant and creates precedence confusion. Use only one approach.
      _Resolved: secrets injected only via `envFrom.secretRef`; redundant `MONGODB_URI` secretKeyRef removed._

- [ ] **M-18** `[infra]`
      **File:** `k8s/mongodb.yaml` lines 57–72
      MongoDB runs as a single-replica StatefulSet with no replica set configuration, no backup CronJob, and no `PodDisruptionBudget`. Pod eviction causes data unavailability. Add `--replSet rs0` flag, a backup job, and a PDB with `minAvailable: 1`.

- [x] **M-19** `[infra]`
      **File:** `k8s/deploy.sh` lines 26–53
      Deploy script has interactive `read -p` prompts, making it incompatible with CI/CD pipelines. Add `set -euo pipefail`, validate that all required secret keys are present in `.env.production` before applying, and document the non-interactive invocation pattern.
      _Resolved: `validate_env_production` checks required keys; `LUXGEN_SECRETS_ALREADY_EXIST=true` documented in deploy.sh and k8s/README._

- [x] **M-20** `[missing-test]`
      **File:** `apps/api/src/middleware/loginRateLimit.ts` lines 33–40
      The Redis-path of `isRateLimited` (the increment + pexpire flow) has no test coverage. Only the in-memory fallback is exercised by the existing test suite. Add a test with a mocked Redis client.

- [x] **M-21** `[bug]`
      **File:** `apps/web/pages/index.tsx` lines 17–20
      Redirect to `/dashboard` only fires when `currentTenant !== 'demo'`. An already-authenticated `demo` tenant user visiting `/` sees the public landing page with Sign In / Create Account links rather than being redirected. Apply the redirect for all authenticated users regardless of tenant.

- [x] **M-22** `[feat]`
      **File:** `apps/web/pages/groups/[id].tsx` — `apps/web/pages/login.tsx:76-91`
      Social login (Google, LinkedIn, GitHub) UI is fully rendered with loading states and redirect messages but is entirely unimplemented (stub `TODO` comments). Either implement OAuth flows or hide the buttons behind a feature flag until implementation is ready.
      _Fixed: hidden unless `NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED=true` on login and register._

- [x] **M-23** `[bug]`
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

- [x] **L-07** `[type]`
      **File:** `apps/api/src/middleware/roleManagement.ts` lines 69, 188, 217
      `req.user!.role as any` passed to `hasPermission` because `IUser.role` is typed as `string`. Type `IUser.role` as `UserRole` (from the canonical definition after H-16 is fixed) to eliminate these casts.

- [x] **L-08** `[type]`
      **File:** `apps/api/src/schema/group/resolvers.ts` — throughout
      All resolver arguments typed as `any` (`_: any`, `{ input }: { input: any }`). Add precise input types matching the GraphQL schema for all 12 mutations and queries.

- [x] **L-09** `[type]`
      **File:** `apps/web/pages/automations/index.tsx` line 864 · `apps/web/pages/dashboard.tsx` line 149
      `getServerSideProps` typed as `async (ctx: any)`. Replace with `GetServerSideProps<PageProps>` for proper Next.js type safety.

- [x] **L-10** `[type]`
      **File:** `apps/api/src/schema/index.ts` lines 73–93
      Custom JSON scalar `parseLiteral` uses `any` throughout; the `ast` parameter should be typed as `graphql.ValueNode`. (Related to M-13 which replaces this implementation entirely.)

- [x] **L-11** `[type]`
      **File:** `apps/web/pages/agent.tsx` line 19
      `useState<any>(null)` for user state. Reference the `SessionUser` type from `../lib/session`.

- [x] **L-12** `[enhancement]`
      **File:** `apps/api/src/db/connect.ts` lines 5–18
      `connectDB` calls `process.exit(1)` on connection error and does not monitor `disconnected`/`reconnected` events. Silent reconnection failures cause all DB calls to hang. Add `mongoose.connection.on('disconnected', ...)` handler and set `serverSelectionTimeoutMS` / `socketTimeoutMS` in options.

- [x] **L-13** `[enhancement]`
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

- [x] **L-22** `[style]`
      **File:** `apps/web/pages/dashboard.tsx` line 100
      Hard-coded `'Welcome to Ideavibes'` in the banner carousel. Banner content must come from tenant configuration. Reference `tenantConfig.brand.name` or equivalent.

- [x] **L-23** `[enhancement]`
      **File:** `apps/api/src/services/groupService.ts` line 128 vs line 136
      `baseQuery` initialises with `isActive: true` hardcoded, but the total count is calculated from `baseQuery` before the `isActive` override is applied to `cursorFilter`. This causes the total count to always reflect active-only records even when filtering for inactive. Apply the filter to `baseQuery` first, then derive `cursorFilter` from it.

- [ ] **L-24** `[infra]`
      **File:** `k8s/agent-worker.yaml` lines 1–66
      Agent-worker has `replicas: 1` and no job re-enqueue on crash. In-flight jobs are lost on pod restart. Enable BullMQ's stalled-job recovery (`stalledInterval`, `maxStalledCount`) to re-enqueue jobs lost to crashes.

- [ ] **L-25** `[missing-test]` `[infra]`
      No integration tests for the K8s deploy script or multi-service startup sequence. The Ingress/ConfigMap URL mismatch (H-14) would have been caught by a deployment smoke test. Add a basic smoke test that validates the ConfigMap URLs match Ingress hostnames.

---

---

## AGENT SYSTEM — Developer Agent Subsystem

> Reviewed 2026-06-25. Items below cover `packages/agent/src/`, `apps/agent-worker/src/`, `apps/web/pages/api/agent/`, `apps/web/components/agent/`, and `apps/web/pages/agent.tsx`.
> Several items from the earlier audit have already been applied in the 2026-06-25 pass (marked `[x]`).

### A-HIGH — Fix Before Any Staging Deployment

- [x] **A-01** `[security]` `[bug]`
      **File:** `apps/web/pages/api/agent/stage.ts` lines 1–29
      `GET /api/agent/stage` and `DELETE /api/agent/stage` had **no authentication**. Any caller who knew a `sessionId` could read staged file contents or discard another user's session entirely.
      **Fix applied:** Added `requireAgentAuth` guard for all methods (2026-06-25). Verify the import is `'../../../lib/agent-auth'`.

- [x] **A-02** `[security]` `[bug]`
      **File:** `apps/web/pages/api/agent/validate.ts` lines 13–20
      `GET /api/agent/validate` had **no authentication**. Validation results (including lint/typecheck output containing file paths and code snippets) were readable by any caller with a known session ID.
      **Fix applied:** Added `requireAgentAuth` inside the GET branch (2026-06-25).

- [x] **A-03** `[security]` `[bug]`
      **File:** `packages/agent/src/tools/execute.ts` lines 153–159
      Path allow-listing (`isPathAllowed`, `isSensitiveFile`) was only applied for `read_file` and `write_file`. **`list_files` and `search_code` accepted arbitrary paths**, allowing the agent to traverse and enumerate sensitive directories not covered by `ALLOWED_PATHS`.
      **Fix applied:** Extended guard to `list_files` and `search_code` with directory validation (2026-06-25).

- [x] **A-04** `[security]` `[bug]`
      **File:** `packages/agent/src/changeset/session-store.ts` lines 69–113
      `applySession()` detects file conflicts (disk content differs from `originalContent` captured at staging time) but **writes the staged content anyway**, silently overwriting the developer's manual edits. The conflict array is populated and returned but never used to block the apply.
      **How to fix:** Before the write loop, if `conflicts.length > 0` and mode is `'filesystem'`, return early with `{ applied: [], errors: [], conflicts, mode: 'filesystem' }`. The API route (`apply.ts`) already includes `conflictWarning` in the response — update the UI in `AgentTransparency.tsx:handleApplyAll` to block and display conflicts instead of proceeding.
      **Missing API field:** `apply.ts` needs a `blocked: boolean` field so the UI can distinguish "applied with warning" from "blocked by conflict."

- [x] **A-05** `[security]`
      **File:** `apps/web/pages/api/agent/chat.ts` (no rate limiting)
      There is **no per-user or per-tenant rate limit** on `POST /api/agent/chat`. A single tenant can open unlimited concurrent SSE streams, exhausting Ollama connection slots and degrading all other tenants. Add a per-tenant concurrent-stream counter using Redis (`INCR`/`DECR`) with a max of 3 concurrent streams per tenant and a per-user message rate limit (e.g., 20 messages per minute).
      **Files to change:** `apps/web/pages/api/agent/chat.ts`, `packages/agent/src/queue/redis-queue.ts` (add helpers for stream counting).
      _Fix applied: `acquireTenantStreamSlot` / `releaseTenantStreamSlot` (max 3 per tenant) and `isAgentMessageRateLimited` (20/min per user) in `redis-queue.ts`; wired in `chat.ts` (2026-06-25)._

- [ ] **A-06** `[bug]` `[arch]`
      **File:** `packages/agent/src/git/service.ts` lines 297–304
      `mergeAgentBranch()` runs `git checkout <baseBranch>` followed by `git merge --squash <agentBranch>` directly on the **shared monorepo root** working tree. Two concurrent merge calls will race: the second `git checkout` will be on the wrong branch when the first merge commits. The function must instead create a throwaway worktree for the base branch merge, execute the merge there, then `git push` — or use `git merge-tree` to generate the merge result without touching the working tree.
      **Fix approach:** In `mergeAgentBranch`, add a temporary worktree at `.agent-worktrees/merge-<sessionId>`, checkout `baseBranch` there, squash-merge into it, commit, then remove the temp worktree. Never touch `root` working tree.

- [x] **A-07** `[feat]`
      **File:** `apps/web/pages/api/agent/tasks.ts` — no status-stream endpoint exists
      `POST /api/agent/tasks` enqueues a headless job and returns `{ status: 'enqueued' }`, but there is **no mechanism for the UI or API caller to poll or stream job status**. The UI has no panel showing headless task progress. A caller must guess when the job completes.
      **What to build:** 1. Add `GET /api/agent/tasks?sessionId=<id>` — already exists; returns `{ session, task, queueEnabled }`. Ensure `task.status` reflects the live MongoDB status set by the worker. 2. Add `GET /api/agent/tasks/stream?sessionId=<id>` — SSE endpoint that polls MongoDB every 2 seconds for status changes and emits `{ type: 'status', status, validation }` events until the task reaches a terminal state (`pending_review`, `failed`, `merged`, `cancelled`). 3. Add a `HeadlessTaskPanel` UI component in `apps/web/components/agent/` that opens when a headless task is enqueued and streams from the new SSE endpoint.
      **Files to create:** `apps/web/pages/api/agent/tasks/stream.ts`, `apps/web/components/agent/HeadlessTaskPanel.tsx`.
      **Done (2026-06-25):** SSE stream endpoint + `HeadlessTaskPanel` component.

### A-MEDIUM — Fix in Next Sprint

- [ ] **A-08** `[arch]` `[infra]`
      **File:** `packages/agent/src/changeset/session-store.ts` (all functions), `packages/agent/src/git/service.ts` (worktree paths)
      Session JSON files are stored in `apps/web/.agent-staging/<sessionId>.json` on the **local filesystem** of whichever pod handled the request. Git worktrees are stored in `.agent-worktrees/<sessionId>/` on the same pod. With Kubernetes HPA (multiple replicas), a request routed to pod B cannot find the session created on pod A. The system works only with `replicas: 1`.
      **Fix approach:** - Move session persistence to MongoDB exclusively (the `AgentTask` document already mirrors session state via `syncSessionToMongo` — invert the source of truth so `loadSession` reads MongoDB, not the filesystem). - Store worktree paths on a shared PVC or use a git bare-repo strategy with per-session branches (no worktrees needed — the agent writes to a branch via `git fast-import`).
      **Blocked by:** Choosing a shared volume or eliminating worktrees. Worktree removal is the cleaner path. See also A-06.

- [ ] **A-09** `[arch]` `[infra]`
      **File:** `packages/agent/src/queue/redis-queue.ts` lines 39–66
      The Redis queue uses a plain `LPUSH`/`BRPOP` list. If `processHeadlessJob` throws an unhandled exception, the job is **permanently lost** — caught by the `try/catch` in `runWorkerLoop`, logged, and discarded. There is no retry count, backoff, dead-letter queue, or stalled-job recovery.
      **Fix approach:** - Add a retry envelope to `HeadlessTaskJob`: `attempts: number`, `maxAttempts: number` (default 3), `lastError?: string`. - On failure in `processHeadlessJob`, re-enqueue the job with `attempts + 1` if under `maxAttempts`; otherwise move to a `luxgen:agent:tasks:dead` list. - Add `GET /api/agent/tasks/dead` endpoint (admin-only) to inspect failed jobs.
      **Files to change:** `packages/agent/src/queue/redis-queue.ts`, `packages/agent/src/queue/worker.ts`, `packages/agent/src/types/task.ts`.

- [ ] **A-10** `[feat]`
      **File:** `packages/agent/src/queue/worker.ts` lines 42–65
      `autoMerge` is parsed from `AGENT_AUTO_MERGE=true` in `getAgentConfig()` but **nothing in the worker or orchestrator ever calls `mergeAgentBranch`**. The config key is dead.
      **Fix approach:** After a successful commit in `processHeadlessJob` (when `commitResult.commitSha` is set), check `getAgentConfig().autoMerge` and call `mergeAgentBranch(job.sessionId)`. Emit `committed` then `merged` automation events. Update session status to `'merged'`. Guard against A-06 (merge race) before enabling this.
      **Files to change:** `packages/agent/src/queue/worker.ts`.

- [ ] **A-11** `[feat]`
      **File:** `packages/agent/src/queue/worker.ts` lines 42–65
      Headless worker emits `staged` and `validated` automation events but **never emits `committed` or `merged` events**. Those events are only emitted from the interactive API routes (`commit.ts` and `merge.ts`). Automations triggered on `CODE_CHANGE_COMMITTED` / `CODE_CHANGE_MERGED` never fire for headless tasks.
      **Fix approach:** After calling `commitStagedSession` in `processHeadlessJob`, call `emitAgentAutomationEvent(job.tenantId, 'committed', { sessionId, branch, commitSha, files })`. After `mergeAgentBranch` (when A-10 is implemented), emit `'merged'`. Also add `appendAuditEntry` calls for both.
      **Files to change:** `packages/agent/src/queue/worker.ts`.

- [ ] **A-12** `[feat]`
      **File:** `packages/agent/src/tools/definitions.ts` — missing tool
      The agent has no **`run_command` tool**. It can read, search, write, and delete files but cannot execute any shell command (`npm install`, `npx prisma migrate`, `npm run build`, `npm test`). This blocks workflows where a new package must be installed or a migration run after code changes.
      **How to build:** 1. Add tool definition to `packages/agent/src/tools/definitions.ts`:
      `ts
{ name: 'run_command', description: 'Run a safe shell command (npm/npx only) from the monorepo root. Returns stdout/stderr. Blocked commands: rm, curl, wget, git push, chmod, sudo.', input_schema: { type: 'object', properties: { command: { type: 'string' }, args: { type: 'array', items: { type: 'string' } }, cwd: { type: 'string', description: 'Optional: relative path from monorepo root' } }, required: ['command', 'args'] } }
` 2. Add allowlist in `packages/agent/src/config/paths.ts`: `ALLOWED_COMMANDS = ['npm', 'npx', 'node']`. 3. Implement handler in `packages/agent/src/tools/execute.ts` using `execFileAsync` with `TOOL_TIMEOUTS['run_command'] = 60_000`, output capped at 4000 chars. 4. Add icon `'▶️'` and label in `apps/web/components/agent/AgentChat.tsx:TOOL_ICONS`.
      **Security note:** The command allowlist must be validated before `execFileAsync` — never pass raw user input to the shell. Validate `command` is in `ALLOWED_COMMANDS` and `cwd` passes `isPathAllowed`.

- [x] **A-13** `[bug]` `[dead-code]`
      **File:** `apps/web/components/agent/AIStudioSidekickPanel.tsx`
      This component exists but is **imported by no page**. `apps/web/pages/agent.tsx` imports `AgentChat` and `AgentTransparency` directly. The panel's `sessionId` initialisation also has the SSR hydration mismatch noted in M-23.
      **Fix approach:** Either wire `AIStudioSidekickPanel` into a page (e.g., as a floating sidekick on other admin pages using `layout="sidekick"` mode of `AgentChat`) or delete the file. If wiring: import from a persistent layout component, pass a stable `sessionId` from `getServerSideProps` or `useId()`.
      _Wired globally via `AIStudioPanelSlot` in `apps/web/pages/_app.tsx` (M-23 session id fix)._

- [ ] **A-14** `[feat]`
      **File:** `packages/agent/src/types/session.ts`, `packages/agent/src/changeset/session-store.ts`
      Chat message history is **never persisted**. `AgentSession.files` stores staged file changes but has no `messages` field. On page refresh or session reload, all conversation context is lost — the agent starts cold with no knowledge of prior turns.
      **How to build:** 1. Add `messages?: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>` to `AgentSession` in `packages/agent/src/types/session.ts`. 2. After `runAgentLoop` completes in `chat.ts`, save the messages to the session via `saveSession`. 3. On page load in `AgentChat.tsx`, call `GET /api/agent/stage?sessionId=<id>` and populate `messages` state from `session.messages` (filtering out the welcome message). 4. Update `syncSessionToMongo` to include messages in the `AgentTask` document for audit/history.
      **Cap at 50 messages** to avoid unbounded session file growth.

- [x] **A-15** `[arch]`
      **File:** `packages/agent/src/persistence/mongo.ts` lines 43–66, `packages/agent/src/types/task.ts` lines 14–27
      `AgentTaskRecord.metadata.model` is defined in the type but **`syncSessionToMongo` never writes it**. Which model processed each task is unauditable — you cannot correlate quality issues to model selection.
      **Fix:** In `worker.ts:processHeadlessJob`, after loading the session, store `job.model` on `session.metadata` (add `metadata?: { model?: string }` to `AgentSession`). Then include `metadata.model` in the `syncSessionToMongo` upsert body.
      **Files to change:** `packages/agent/src/types/session.ts`, `packages/agent/src/persistence/mongo.ts`, `packages/agent/src/queue/worker.ts`.
      _Fix applied: `AgentSession.metadata.model`, worker sets from `job.model`, `syncSessionToMongo` persists it (2026-06-25)._

- [x] **A-16** `[enhancement]`
      **File:** `apps/web/components/agent/AgentTransparency.tsx` lines 232–248
      The "Apply All" button is shown regardless of validation state. If validation has run and failed, the user can still click Apply and write broken code to the filesystem. The commit route (`commit.ts`) enforces the validation policy server-side, but **the Apply route (`apply.ts`) does not** — and Apply bypasses git entirely (it writes directly to the filesystem for local mode).
      **Fix:** In `handleApplyAll` (client side), check `validation?.passed === false` and display a blocking warning: "Validation failed — apply anyway?" with explicit confirmation. Server-side, add an optional `validation` check in `apply.ts` gated on `getValidationPolicy() === 'strict'`.
      **Files to change:** `apps/web/components/agent/AgentTransparency.tsx`, `apps/web/pages/api/agent/apply.ts`.

- [ ] **A-17** `[feat]`
      **File:** `apps/web/pages/api/agent/tasks.ts` — missing admin endpoint
      There is **no endpoint to list all agent tasks for a tenant** (for admin oversight). A tenant admin cannot see what their team's agent sessions are doing, which sessions are running, or audit past changes.
      **What to build:** `GET /api/agent/tasks/list?tenantId=<id>&status=<status>&limit=20&cursor=<id>` — requires `ADMIN` role, reads from MongoDB `AgentTask` collection. Return `{ tasks: AgentTaskRecord[], nextCursor }`. Wire into a new admin page `apps/web/pages/admin/agent-tasks.tsx`.
      **API contract:**
      `    GET /api/agent/tasks/list
Auth: Bearer token, role >= ADMIN
Query: tenantId (string), status? (TaskStatus), limit? (number, max 50), cursor? (string)
Response: { tasks: AgentTaskRecord[], nextCursor: string | null, total: number }`
      **Files to create:** `apps/web/pages/api/agent/tasks/list.ts`, `apps/web/pages/admin/agent-tasks.tsx`.

### A-LOW — Tech Debt / Polish

- [ ] **A-18** `[enhancement]`
      **File:** `packages/agent/src/tools/execute.ts` lines 46–68
      `searchInDir` reads up to 200 files before searching (entire file list built in memory by `listDirRecursive`). For large directories this creates unnecessary memory pressure.
      **Fix:** Pipe through a generator that reads and searches file-by-file, stopping as soon as 50 results are found. Use `fs.createReadStream` for large files instead of `readFileSync`.

- [ ] **A-19** `[enhancement]`
      **File:** `packages/agent/src/tools/execute.ts` line 57 (search limit hard-coded to 50)
      `search_code` truncates at 50 results with no way for the agent to page through or narrow the search. Add an optional `maxResults` parameter (default 50, max 200) and `offset` parameter so the agent can request the next page of results when the first page is insufficient.
      **Files to change:** `packages/agent/src/tools/definitions.ts`, `packages/agent/src/tools/execute.ts`.

- [x] **A-20** `[enhancement]`
      **File:** `apps/web/components/agent/AgentTransparency.tsx` lines 36–88
      The custom diff algorithm is a naive greedy O(n²) approximation with a lookahead of 8 lines. For files with repeated patterns it produces misleading or incorrect diffs. Replace with the `diff` npm package (`npm i diff` in `apps/web`) using `Diff.structuredPatch` for accurate unified diffs.
      **Files to change:** `apps/web/components/agent/AgentTransparency.tsx`. Import: `import { diffLines } from 'diff'`.

- [x] **A-21** `[enhancement]`
      **File:** `packages/agent/src/providers/ollama.ts` lines 48–87
      `findAvailableModel` is called twice per chat request (once in `chat.ts` + again inside `runAgentLoop` at `orchestrator.ts:53`), making **two sequential HTTP calls to Ollama** before the first token streams. Memoize the result for the duration of a request or pass the resolved model from `chat.ts` through to `runAgentLoop`.
      **Files to change:** `apps/web/pages/api/agent/chat.ts` (pass `available.model` as `model` arg), `packages/agent/src/core/orchestrator.ts` (skip `findAvailableModel` if `options.model` is already resolved).
      _Fix applied: `modelResolved` option skips second Ollama tags lookup; `chat.ts` passes resolved model from first call (2026-06-25)._

- [ ] **A-22** `[enhancement]`
      **File:** `packages/agent/src/tools/definitions.ts` — missing tool
      The agent has no **`read_url` tool** for reading documentation, package READMEs, or API references from the web during a session. Add a `fetch_url` tool that accepts a URL (allowlisted to `docs.`, `npmjs.com`, `github.com`, `localhost`) and returns the page text (up to 8000 chars). This lets the agent look up library APIs without halting for user input.
      **Security note:** URL must be validated against an allowlist — no internal IP ranges, no `file://`, no `localhost` in production mode. Implement using `AbortSignal.timeout(5000)`.

- [ ] **A-23** `[arch]`
      **File:** `packages/agent/src/git/service.ts` lines 329–360, `apps/web/pages/api/agent/pr.ts`
      When a PR is created, the `prUrl` is stored in the session but **the worktree is never cleaned up** after the PR is merged or closed. Git worktrees in `.agent-worktrees/` accumulate indefinitely. The `pruneOldSessions` added 2026-06-25 only removes session JSON files, not their corresponding git worktrees.
      **Fix:** Extend `pruneOldSessions` (or add `pruneOldWorktrees`) to scan `.agent-worktrees/` and run `git worktree remove --force <path>` for any worktree older than 7 days. Hook into the worker startup sequence.
      **Files to change:** `packages/agent/src/changeset/session-store.ts`.

- [ ] **A-24** `[feat]`
      **File:** `packages/agent/src/tools/definitions.ts` — missing tool
      The agent has no **`rename_file` tool**. When a developer asks the agent to rename or move a file (e.g., refactor a component path), the agent must read the file and delete the old path + write the new path as two separate staged operations. This is error-prone and leaves the `pendingDelete` + new file as separate entries in the staging area.
      **How to build:** Add a `rename_file` tool that calls `stageFile` for the new path and adds a `pendingDelete` entry for the old path in a single operation. The UI should render these as a linked pair in the file tree.

- [ ] **A-25** `[missing-test]`
      **File:** `packages/agent/src/` — zero test coverage
      No tests exist for any agent subsystem component: - `core/orchestrator.ts` — tool call loop, cancellation, context trimming - `validation/pipeline.ts` — check selection, parallel execution, result persistence - `changeset/session-store.ts` — stage, apply, conflict detection, prune - `git/service.ts` — ensureGitSession, commit, merge, PR creation - `tools/execute.ts` — path validation, tool dispatch, timeout handling - `queue/worker.ts` — job processing, status transitions, retry logic
      Create a `packages/agent/src/__tests__/` directory. Use `vitest` (already in monorepo). Mock `fs`, `execGit`, and Redis client. Target: 80% branch coverage on `session-store.ts` and `pipeline.ts` first.

- [ ] **A-26** `[feat]`
      **File:** `packages/agent/src/tools/definitions.ts` — missing tool
      The agent cannot **read package.json or tsconfig.json** without using `read_file` (which works), but has no way to enumerate installed packages or understand TypeScript paths. Add a `read_project_config` tool that returns the merged `package.json` + `tsconfig.json` (paths section) for a given workspace (e.g., `apps/web`, `packages/agent`) to help the agent understand imports before suggesting them.

- [ ] **A-27** `[enhancement]`
      **File:** `packages/agent/src/prompts/system.ts` line 54
      System prompt template includes `useState<any>(null)` — the agent learns to generate `any`-typed state. Update the embedded page template to use proper types:
      `tsx
// Replace:
const [user, setUser] = useState<any>(null);
// With:
import type { UserMenu } from '@luxgen/ui';
const [user, setUser] = useState<UserMenu | null>(null);
`
      **Files to change:** `packages/agent/src/prompts/system.ts`.

---

## Progress Summary

| Tier                 | Total   | Done   |
| -------------------- | ------- | ------ |
| CRITICAL             | 7       | 7 ✅   |
| HIGH                 | 27      | 20     |
| MEDIUM               | 24      | 22     |
| LOW                  | 25      | 22     |
| **Agent / A-MEDIUM** | **10**  | **3**  |
| **Agent / A-LOW**    | **10**  | **2**  |
| **Total**            | **110** | **80** |

> Update the Done column as items are completed. When all items in a tier are done, mark the tier header with ✅.

---

## BA-Pending Requirements

> **Review date:** 2026-06-25
> **Reviewer role:** Business Analyst (end-to-end product walk-through)
> **Scope:** All pages under `apps/web/pages/` were inspected by reading source code + reviewing GraphQL wiring. This section documents functionality gaps between what is **visible in the UI** and what is required for LuxGen to operate as a **complete, commercially viable multi-tenant LMS + commerce platform**.
>
> Items are tagged by domain and priority: `[P1]` = blocks core business flow · `[P2]` = degrades key use case · `[P3]` = missing polish / secondary flow.

---

### BA-01 — Course Management: No Real Data Binding `[P1]`

**Pages:** `pages/courses.tsx`, `pages/courses/[id].tsx`

**Gap:** Both pages display hardcoded mock data (`useState` with static objects). No GraphQL query (`useQuery`) fetches real courses from the API. Landing on `/courses` always shows a fake "Advanced React Development" card regardless of what the admin has actually created. The course detail page also uses the same static course regardless of the `[id]` in the URL.

**Business impact:** Admins cannot see their real course catalogue. The courses section is entirely disconnected from the database.

**Required:**

- Replace static `useState` with `useQuery(GET_COURSES, { variables: { tenantId } })` in `pages/courses.tsx`.
- In `pages/courses/[id].tsx`, query `GET_COURSE` by `id` from `router.query.id`.
- Render a 404/empty-state when the course is not found.
- Role detection must read from the auth session, not be inferred from `tenant === 'demo'`.

---

### BA-02 — Course Creation: Simulated Submit, No API Call `[P1]`

**Page:** `pages/courses/create.tsx`

**Gap:** `handleSubmit` runs `setTimeout(resolve, 1500)` then `console.log` and redirects. There is no GraphQL mutation (`CREATE_COURSE`) called. Any course "created" is silently discarded.

**Business impact:** Admins cannot create courses. The entire content creation flow is non-functional.

**Required:**

- Wire `CREATE_COURSE` mutation.
- Add course thumbnail upload (file input → storage URL).
- Add fields: price, enrollment capacity, start/end date, prerequisites.
- Redirect to `/courses/[newId]` on success.

---

### BA-03 — Course Edit Page Does Not Exist `[P1]`

**Gap:** `CourseDetailMenu` links to an edit route that returns 404. The file `pages/courses/[id]/edit.tsx` does not exist.

**Required:** Create the course edit page, pre-populating from `GET_COURSE` query and saving via `UPDATE_COURSE` mutation.

---

### BA-04 — Analytics Pages Use Hardcoded Mock Data `[P1]`

**Pages:** `pages/courses/analytics.tsx`, `pages/groups/analytics.tsx`

**Gap:** Both pages use `useState` with static numbers (e.g., `totalEnrollments: 3456`, `completionRate: 78`). No GraphQL queries are fired. Tenants on paid plans see fabricated metrics.

**Required:**

- Add real GraphQL queries: enrollment counts per course, completion rates, revenue, MAU trend.
- Remove all static mock objects from analytics pages.
- Add date-range filter (last 7 / 30 / 90 days).

---

### BA-05 — Learner Course Player Page Missing `[P1]`

**Gap:** `pages/learn/courses/[id].tsx` does not exist (confirmed). The `/learn` catalog page links to `/learn/courses/${course.id}` which 404s for every enrolled learner.

**Business impact:** Learners cannot play course content. The entire learner-facing experience is broken once they click any course.

**Required:**

- Create `pages/learn/courses/[id].tsx` with:
  - Chapter/lesson list with completion checkboxes.
  - Video or rich-content player.
  - Progress tracking: `MARK_LESSON_COMPLETE` mutation on completion.
  - Certificate trigger when all lessons completed.
  - Discussion thread per lesson.

---

### BA-06 — No Certificate Generation or Display `[P1]`

**Gap:** The automation system has a `certificate_issued` trigger but:

- No UI shows certificates to learners.
- No admin UI exists to design or configure certificates.
- No API mutation for issuing certificates is wired in the frontend.
- `pages/learn/` has no `/certificates` route.

**Required:**

- Create `pages/learn/certificates/index.tsx` — learner's earned certificates.
- Create certificate template configuration under `/settings/certificates`.
- Wire `ISSUE_CERTIFICATE` mutation into course completion flow.

---

### BA-07 — No Learner Progress Tracking UI `[P2]`

**Page:** `pages/customers/index.tsx`

**Gap:** The `ProgressRing` component's `progress` prop is hardcoded to a static value rather than computed from lesson completions. There is no real per-course completion percentage shown to learners.

**Required:**

- Compute progress from `enrollment.completedLessons / enrollment.totalLessons`.
- Display per-course completion percentage in learner dashboard.
- Add a "resume" button linking to the last incomplete lesson.

---

### BA-08 — Group Management: Create/Edit Not Wired `[P2]`

**Gap:** `organization/groups/index.tsx` renders `DataListPage` but the create-group action likely opens a modal that was never built with a real mutation. Group edit and member management pages exist in the file tree but their mutation calls were not verified.

**Required:**

- Wire group create form to `CREATE_GROUP` mutation.
- Wire group edit form to `UPDATE_GROUP` mutation.
- Group members page must call `ADD_GROUP_MEMBER` / `REMOVE_GROUP_MEMBER` mutations.

---

### BA-09 — Orders: No Real Payment Flow `[P2]`

**Gap:** Orders are inferred from enrollment records via `buildOrdersFromEnrollments` — there is no real Order domain model. `orders/create.tsx` calls `ENROLL_STUDENT` (not a payment). No payment gateway integration is visible in any page.

**Business impact:** Tenants cannot process real payments. "Orders" are enrollment proxies with no revenue data, payment status, or refund handling.

**Required:**

- Design a real `Order` domain model with: `amount`, `currency`, `paymentStatus`, `paymentIntentId`, `refundedAt`.
- Integrate a payment gateway (Stripe): `/api/checkout/session` → redirect → webhook → create Enrollment.
- `orders/[id].tsx` edit page must support refund action.
- `orders/abandoned.tsx` needs the API resolver to actually track incomplete checkout sessions.

---

### BA-10 — Store / Commerce: No Checkout Flow `[P2]`

**Gap:** `store/product/index.tsx` shows a product grid but there is no cart, no checkout, and no order confirmation. The store header copy references "just ask the seller AI" but no GPT chat widget exists on product pages.

**Required:**

- Cart context (add/remove product, quantity, subtotal).
- Checkout page (`/store/checkout`) → payment gateway.
- Order confirmation page.
- GPT Seller AI chat widget on product detail page.

---

### BA-11 — Subscription Cancellation Has No Confirmation `[P2]`

**Page:** `pages/learn/subscriptions/index.tsx`

**Gap:** `handleCancel(subscriptionId)` fires `CANCEL_LEARNER_SUBSCRIPTION` immediately without any confirmation dialog.

**Required:** Add a confirmation modal before cancellation. Show next billing date and access expiry. Support "pause" as an alternative to full cancel.

---

### BA-12 — User Requests Tab Always Empty `[P2]`

**Page:** `pages/organization/users.tsx`

**Gap:** The `requests` tab has `count: 0` hardcoded. No query populates membership requests. Approve/reject actions are missing.

**Required:**

- `GET_PENDING_REQUESTS` query.
- Approve/reject actions on the requests tab.
- Email notification to user when approved.

---

### BA-13 — Role Management: System Roles Only, No Custom Roles `[P2]`

**Page:** `pages/organization/roles.tsx`

**Gap:** Uses `ORGANIZATION_SYSTEM_ROLES` — a static local array. There is no UI to create custom roles or edit permissions.

**Required:**

- Custom role builder: name, description, permission set (booleans per resource/action).
- Role assignment from user detail page.
- Role-based sidebar visibility.

---

### BA-14 — Security Section: SAML/SCIM Are Stubs `[P2]`

**Pages:** `pages/organization/security/saml.tsx`, `scim.tsx`, `domains.tsx`

**Gap:** Status badges show "partial" or "planned". No actual SSO configuration form is functional.

**Required:**

- SAML page: IdP metadata URL input + SP metadata download + test connection.
- SCIM page: generate bearer token for directory sync.
- Domain verification: DNS TXT record flow.
- All backed by real API mutations.

---

### BA-15 — Notifications: Read-Only, No Template Customization `[P2]`

**Page:** `pages/settings/notifications.tsx`

**Gap:** Fetches and displays templates in expand/collapse list. No edit button, no save action, no subject/body customization.

**Required:**

- Inline template editor (subject + HTML/Markdown body).
- Variable substitution preview (`{{learner_name}}`, `{{course_title}}`).
- Test send button.

---

### BA-16 — Profile Page: No Avatar Upload `[P3]`

**Page:** `pages/profile.tsx`

**Gap:** Only `firstName`/`lastName` editing. No avatar/photo upload.

**Required:** File upload → storage URL → display in sidebar user avatar.

---

### BA-17 — Mentor Profile Page Missing `[P3]`

**Gap:** `/store/mentors` lists trainer profiles but there is no `pages/store/mentors/[id].tsx` page. Clicking a mentor card has no destination.

**Required:** Mentor profile page with bio, courses, ratings, and "Contact" CTA.

---

### BA-18 — Listings: No Detail Page or Edit Action `[P3]`

**Page:** `pages/listings/index.tsx`

**Gap:** Listing cards have no link or "view details" action. `pages/listings/my.tsx` shows the user's own listings but likely has no edit action wired.

**Required:** Listing detail page reachable from directory. Edit listing flow from `my.tsx`.

---

### BA-19 — Project Board: Backend Persistence Unverified `[P3]`

**Page:** `pages/project/iteration/current.tsx`

**Gap:** `IterationBoard` renders columns but the API resolver for sprint/task entities was not confirmed to persist to MongoDB. Drag-and-drop column changes may not be saved.

**Required:** Verify `GET_PROJECT_TASKS` / `UPDATE_TASK_STATUS` hit real MongoDB documents. Drag-and-drop status change must persist.

---

### BA-20 — Developer Page: Tool List Out of Date `[P3]`

**Page:** `pages/developer/index.tsx`

**Gap:** `TOOL_DEFS` hardcodes only 4 tools; the agent now has 6 (`delete_file`, `read_automation_schema` are missing from the display).

**Required:** Sync `TOOL_DEFS` with `packages/agent/src/tools/definitions.ts`. Ideally import from the package instead of duplicating.

---

### BA-21 — No Global Search Functionality `[P3]`

**Gap:** `AppLayout` receives `showSearch={true}` across most pages but no search API endpoint or `GET_SEARCH` GraphQL query exists.

**Required:**

- Global search across courses, users, orders, automations, groups.
- Debounced real-time results (300ms).
- Keyboard shortcut (Cmd+K).

---

### BA-22 — Notification Bell: Static Count, No Real Notifications `[P3]`

**Gap:** `notificationCount={3}` is hardcoded on multiple pages. No `GET_NOTIFICATIONS` query, no notification feed UI, no "mark as read" action.

**Required:**

- `GET_NOTIFICATIONS` query (unread count + recent items).
- Notification dropdown with item type, title, timestamp, resource link.
- "Mark all as read" action.
- Real-time update via subscription or polling.

---

### BA-23 — No Tenant Onboarding / Setup Wizard `[P1]`

**Page:** `pages/dashboard.tsx`

**Gap:** New tenants land on the dashboard with no guided setup flow. Dashboard banner carousel shows hardcoded Unsplash images not personalized guidance.

**Business impact:** New tenants have no guided path to value. Activation rate will be low.

**Required:**

- Onboarding checklist widget on the dashboard (e.g., "Add your first course · Invite a learner · Set up billing").
- Each step links to the relevant page.
- Checklist hides once all steps are complete (persisted in tenant settings).

---

### BA-24 — No Email Verification on Registration `[P2]`

**Page:** `pages/register.tsx`

**Gap:** `REGISTER_MUTATION` succeeds and the user is immediately logged in and active without verifying their email address.

**Required:**

- Send verification email on registration.
- Redirect to "Verify your email" holding page.
- Block access to protected pages until verified.
- Resend verification link action.

---

### BA-25 — Branding Settings: No Logo/Favicon Upload `[P2]`

**Page:** `pages/settings/branding.tsx`

**Gap:** The sidebar renders hardcoded `getDefaultLogo()` across all pages. No logo or favicon upload UI is wired.

**Required:**

- Logo upload (SVG/PNG, max 500 KB) → stored URL → used in `AppLayout`.
- Favicon upload → served from Next.js `<Head>`.
- Brand color picker (primary, secondary) → CSS custom properties.
- Preview before save.

---

### BA-26 — Abandoned Checkout Recovery Has No Action `[P2]`

**Page:** `pages/orders/abandoned.tsx`

**Gap:** Displays abandoned checkout rows but the "Send recovery email" button (if present in `AbandonedCheckoutListView`) has no mutation wired to it.

**Required:**

- "Send recovery email" triggers `SEND_RECOVERY_EMAIL` mutation.
- Show last-sent timestamp and open rate.
- Allow editing the recovery email template from `/settings/notifications`.

---

### BA-27 — No Accessibility (a11y) Baseline `[P3]`

**Gap:** Form elements across pages lack consistent `aria-*` labels. Color contrast ratios for `text-secondary` on `bg-secondary` were not verified against WCAG 2.1 AA. No keyboard navigation or screen reader testing was performed.

**Required:**

- Audit all interactive elements for `aria-label`, `role`, `aria-expanded`.
- Verify color contrast ratios meet WCAG 2.1 AA.
- Add "skip to main content" link.
- Test with VoiceOver / NVDA.

---

### BA Summary Table

| ID    | Domain             | Priority | Status  |
| ----- | ------------------ | -------- | ------- |
| BA-01 | Courses            | P1       | ⬜ Open |
| BA-02 | Courses            | P1       | ⬜ Open |
| BA-03 | Courses            | P1       | ⬜ Open |
| BA-04 | Analytics          | P1       | ⬜ Open |
| BA-05 | Learner Experience | P1       | ⬜ Open |
| BA-06 | Certificates       | P1       | ⬜ Open |
| BA-23 | Onboarding         | P1       | ⬜ Open |
| BA-07 | Learner Experience | P2       | ⬜ Open |
| BA-08 | Groups             | P2       | ⬜ Open |
| BA-09 | Orders / Payments  | P2       | ⬜ Open |
| BA-10 | Store / Commerce   | P2       | ⬜ Open |
| BA-11 | Subscriptions      | P2       | ⬜ Open |
| BA-12 | User Management    | P2       | ⬜ Open |
| BA-13 | Role Management    | P2       | ⬜ Open |
| BA-14 | Security / SSO     | P2       | ⬜ Open |
| BA-15 | Notifications      | P2       | ⬜ Open |
| BA-24 | Auth               | P2       | ⬜ Open |
| BA-25 | Branding           | P2       | ⬜ Open |
| BA-26 | Abandoned Checkout | P2       | ⬜ Open |
| BA-16 | Profile            | P3       | ⬜ Open |
| BA-17 | Mentors            | P3       | ⬜ Open |
| BA-18 | Listings           | P3       | ⬜ Open |
| BA-19 | Project Board      | P3       | ⬜ Open |
| BA-20 | Agent / Developer  | P3       | ⬜ Open |
| BA-21 | Search             | P3       | ⬜ Open |
| BA-22 | Notifications Bell | P3       | ⬜ Open |
| BA-27 | Accessibility      | P3       | ⬜ Open |

**P1 count:** 7 items — blocks commercial launch
**P2 count:** 12 items — degrades paid-tier value proposition
**P3 count:** 8 items — polish, missing pages, secondary flows

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

- [x] **H-16** `[arch]`
      **File:** `packages/auth/src/roles.ts` lines 1–5 vs `packages/db/src/user.ts` lines 3–10 vs `apps/api/src/schema/user/typeDefs.ts` lines 17–21
      Three separate, divergent `UserRole` enum definitions exist across the monorepo. `@luxgen/auth` has `{SUPER_ADMIN, ADMIN, USER}`; `@luxgen/db` has `{SUPER_ADMIN, ADMIN, INSTRUCTOR, STUDENT, USER}`; the GraphQL schema has `{ADMIN, INSTRUCTOR, STUDENT}`. Consolidate to a single canonical definition in `@luxgen/db` or a dedicated `@luxgen/types` package.

- [x] **H-17** `[arch]`
      **File:** `packages/db/src/tenant.ts` lines 62–64 vs `packages/db/src/subscription.ts` line 5
      Billing plan is stored in two separate places: `ITenant.metadata.plan` and `ITenantSubscription.plan`. These can diverge (e.g., a Stripe webhook that updates the subscription but not the tenant). Pick one authoritative source and remove the other.

- [x] **H-18** `[arch]`
      **File:** `apps/web/lib/plan-gate.ts` lines 11–28
      `fetchTenantBilling` makes an outbound HTTP call from a Next.js API route back to the backend to check billing. This adds latency, a failure mode (500 → silent default to 'free'), and a circular dependency locally. Read billing status directly from the DB or a shared module.

- [x] **H-19** `[feat]`
      **File:** `apps/api/src/routes/auth.ts` (missing endpoint)
      No password reset / forgot-password endpoint exists anywhere. `config/tenants/demo/features/index.ts:34` has `passwordReset: true` but the API is completely absent. Implement `POST /api/auth/forgot-password` and `POST /api/auth/reset-password`.

- [x] **H-20** `[feat]`
      **File:** `apps/api/src/routes/auth.ts` (missing endpoint)
      No token refresh endpoint exists. Tokens expire after 7 days with no silent renewal path. Implement `POST /api/auth/refresh` using a separate long-lived refresh token (httpOnly cookie).

- [x] **H-21** `[feat]`
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

- [x] **H-25** `[missing-test]`
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

- [x] **M-18** `[infra]`
      **File:** `k8s/mongodb.yaml` lines 57–72
      MongoDB runs as a single-replica StatefulSet with no replica set configuration, no backup CronJob, and no `PodDisruptionBudget`. Pod eviction causes data unavailability. Add `--replSet rs0` flag, a backup job, and a PDB with `minAvailable: 1`.
      _Resolved: `mongod --replSet rs0`, headless `mongodb` service, `mongodb-rs-init` Job, daily `mongodb-backup` CronJob with 7-day retention, and `mongodb-pdb` (`minAvailable: 1`). `MONGODB_URI` docs include `replicaSet=rs0`._

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

- [x] **L-24** `[infra]`
      **File:** `k8s/agent-worker.yaml` lines 1–66
      Agent-worker has `replicas: 1` and no job re-enqueue on crash. In-flight jobs are lost on pod restart. Enable BullMQ's stalled-job recovery (`stalledInterval`, `maxStalledCount`) to re-enqueue jobs lost to crashes.
      _Resolved: processing lease + `recoverStalledJobs` with `AGENT_QUEUE_STALLED_INTERVAL_MS` / `AGENT_QUEUE_MAX_STALLED_COUNT` (BullMQ defaults)._

- [x] **L-25** `[missing-test]` `[infra]`
      No integration tests for the K8s deploy script or multi-service startup sequence. The Ingress/ConfigMap URL mismatch (H-14) would have been caught by a deployment smoke test. Add a basic smoke test that validates the ConfigMap URLs match Ingress hostnames.
      _Resolved: `scripts/k8s-config-ingress-smoke.mjs` + `npm run test:k8s`._

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

- [x] **A-06** `[bug]` `[arch]`
      **File:** `packages/agent/src/git/service.ts` lines 297–304
      `mergeAgentBranch()` runs `git checkout <baseBranch>` followed by `git merge --squash <agentBranch>` directly on the **shared monorepo root** working tree. Two concurrent merge calls will race: the second `git checkout` will be on the wrong branch when the first merge commits. The function must instead create a throwaway worktree for the base branch merge, execute the merge there, then `git push` — or use `git merge-tree` to generate the merge result without touching the working tree.
      **Fix approach:** In `mergeAgentBranch`, add a temporary worktree at `.agent-worktrees/merge-<sessionId>`, checkout `baseBranch` there, squash-merge into it, commit, then remove the temp worktree. Never touch `root` working tree.
      _Resolved: detached merge worktree at `.agent-worktrees/merge-<sessionId>`, squash-merge + commit, `git branch -f` updates base ref, worktree removed in `finally` — root checkout untouched._

- [x] **A-07** `[feat]`
      **File:** `apps/web/pages/api/agent/tasks.ts` — no status-stream endpoint exists
      `POST /api/agent/tasks` enqueues a headless job and returns `{ status: 'enqueued' }`, but there is **no mechanism for the UI or API caller to poll or stream job status**. The UI has no panel showing headless task progress. A caller must guess when the job completes.
      **What to build:** 1. Add `GET /api/agent/tasks?sessionId=<id>` — already exists; returns `{ session, task, queueEnabled }`. Ensure `task.status` reflects the live MongoDB status set by the worker. 2. Add `GET /api/agent/tasks/stream?sessionId=<id>` — SSE endpoint that polls MongoDB every 2 seconds for status changes and emits `{ type: 'status', status, validation }` events until the task reaches a terminal state (`pending_review`, `failed`, `merged`, `cancelled`). 3. Add a `HeadlessTaskPanel` UI component in `apps/web/components/agent/` that opens when a headless task is enqueued and streams from the new SSE endpoint.
      **Files to create:** `apps/web/pages/api/agent/tasks/stream.ts`, `apps/web/components/agent/HeadlessTaskPanel.tsx`.
      **Done (2026-06-25):** SSE stream endpoint + `HeadlessTaskPanel` component.

### A-MEDIUM — Fix in Next Sprint

- [x] **A-08** `[arch]` `[infra]`
      **File:** `packages/agent/src/changeset/session-store.ts` (all functions), `packages/agent/src/git/service.ts` (worktree paths)
      Session JSON files are stored in `apps/web/.agent-staging/<sessionId>.json` on the **local filesystem** of whichever pod handled the request. Git worktrees are stored in `.agent-worktrees/<sessionId>/` on the same pod. With Kubernetes HPA (multiple replicas), a request routed to pod B cannot find the session created on pod A. The system works only with `replicas: 1`.
      **Fix approach:** - Move session persistence to MongoDB exclusively (the `AgentTask` document already mirrors session state via `syncSessionToMongo` — invert the source of truth so `loadSession` reads MongoDB, not the filesystem). - Store worktree paths on a shared PVC or use a git bare-repo strategy with per-session branches (no worktrees needed — the agent writes to a branch via `git fast-import`).
      **Blocked by:** Choosing a shared volume or eliminating worktrees. Worktree removal is the cleaner path. See also A-06.

      _Resolved: MongoDB-first sessions via `ensureSessionHydrated` + in-memory cache; `saveSession` skips filesystem when Mongo enabled._

- [x] **A-09** `[arch]` `[infra]`
      **File:** `packages/agent/src/queue/redis-queue.ts` lines 39–66
      The Redis queue uses a plain `LPUSH`/`BRPOP` list. If `processHeadlessJob` throws an unhandled exception, the job is **permanently lost** — caught by the `try/catch` in `runWorkerLoop`, logged, and discarded. There is no retry count, backoff, dead-letter queue, or stalled-job recovery.
      **Fix approach:** - Add a retry envelope to `HeadlessTaskJob`: `attempts: number`, `maxAttempts: number` (default 3), `lastError?: string`. - On failure in `processHeadlessJob`, re-enqueue the job with `attempts + 1` if under `maxAttempts`; otherwise move to a `luxgen:agent:tasks:dead` list. - Add `GET /api/agent/tasks/dead` endpoint (admin-only) to inspect failed jobs.
      **Files to change:** `packages/agent/src/queue/redis-queue.ts`, `packages/agent/src/queue/worker.ts`, `packages/agent/src/types/task.ts`.

      _Resolved: `attempts`/`maxAttempts` on jobs, `handleJobFailure` re-queue/dead-letter, `GET /api/agent/tasks/dead`._

- [x] **A-10** `[feat]`
      **File:** `packages/agent/src/queue/worker.ts` lines 42–65
      `autoMerge` is parsed from `AGENT_AUTO_MERGE=true` in `getAgentConfig()` but **nothing in the worker or orchestrator ever calls `mergeAgentBranch`**. The config key is dead.
      **Fix approach:** After a successful commit in `processHeadlessJob` (when `commitResult.commitSha` is set), check `getAgentConfig().autoMerge` and call `mergeAgentBranch(job.sessionId)`. Emit `committed` then `merged` automation events. Update session status to `'merged'`. Guard against A-06 (merge race) before enabling this.
      **Files to change:** `packages/agent/src/queue/worker.ts`.

      _Resolved: headless worker calls `mergeAgentBranch` when `AGENT_AUTO_MERGE=true` after commit._

- [x] **A-11** `[feat]`
      **File:** `packages/agent/src/queue/worker.ts` lines 42–65
      Headless worker emits `staged` and `validated` automation events but **never emits `committed` or `merged` events**. Those events are only emitted from the interactive API routes (`commit.ts` and `merge.ts`). Automations triggered on `CODE_CHANGE_COMMITTED` / `CODE_CHANGE_MERGED` never fire for headless tasks.
      **Fix approach:** After calling `commitStagedSession` in `processHeadlessJob`, call `emitAgentAutomationEvent(job.tenantId, 'committed', { sessionId, branch, commitSha, files })`. After `mergeAgentBranch` (when A-10 is implemented), emit `'merged'`. Also add `appendAuditEntry` calls for both.
      **Files to change:** `packages/agent/src/queue/worker.ts`.

      _Resolved: worker emits `committed`/`merged` automation events and audit entries._

- [x] **A-12** `[feat]`
      **File:** `packages/agent/src/tools/definitions.ts` — missing tool
      The agent has no **`run_command` tool**. It can read, search, write, and delete files but cannot execute any shell command (`npm install`, `npx prisma migrate`, `npm run build`, `npm test`). This blocks workflows where a new package must be installed or a migration run after code changes.
      **How to build:** 1. Add tool definition to `packages/agent/src/tools/definitions.ts`:
      `ts
{ name: 'run_command', description: 'Run a safe shell command (npm/npx only) from the monorepo root. Returns stdout/stderr. Blocked commands: rm, curl, wget, git push, chmod, sudo.', input_schema: { type: 'object', properties: { command: { type: 'string' }, args: { type: 'array', items: { type: 'string' } }, cwd: { type: 'string', description: 'Optional: relative path from monorepo root' } }, required: ['command', 'args'] } }
` 2. Add allowlist in `packages/agent/src/config/paths.ts`: `ALLOWED_COMMANDS = ['npm', 'npx', 'node']`. 3. Implement handler in `packages/agent/src/tools/execute.ts` using `execFileAsync` with `TOOL_TIMEOUTS['run_command'] = 60_000`, output capped at 4000 chars. 4. Add icon `'▶️'` and label in `apps/web/components/agent/AgentChat.tsx:TOOL_ICONS`.
      **Security note:** The command allowlist must be validated before `execFileAsync` — never pass raw user input to the shell. Validate `command` is in `ALLOWED_COMMANDS` and `cwd` passes `isPathAllowed`.

        _Resolved: `run_command` tool with npm/npx/node allowlist._

- [x] **A-13** `[bug]` `[dead-code]`
      **File:** `apps/web/components/agent/AIStudioSidekickPanel.tsx`
      This component exists but is **imported by no page**. `apps/web/pages/agent.tsx` imports `AgentChat` and `AgentTransparency` directly. The panel's `sessionId` initialisation also has the SSR hydration mismatch noted in M-23.
      **Fix approach:** Either wire `AIStudioSidekickPanel` into a page (e.g., as a floating sidekick on other admin pages using `layout="sidekick"` mode of `AgentChat`) or delete the file. If wiring: import from a persistent layout component, pass a stable `sessionId` from `getServerSideProps` or `useId()`.
      _Wired globally via `AIStudioPanelSlot` in `apps/web/pages/_app.tsx` (M-23 session id fix)._

- [x] **A-14** `[feat]`
      **File:** `packages/agent/src/types/session.ts`, `packages/agent/src/changeset/session-store.ts`
      Chat message history is **never persisted**. `AgentSession.files` stores staged file changes but has no `messages` field. On page refresh or session reload, all conversation context is lost — the agent starts cold with no knowledge of prior turns.
      **How to build:** 1. Add `messages?: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>` to `AgentSession` in `packages/agent/src/types/session.ts`. 2. After `runAgentLoop` completes in `chat.ts`, save the messages to the session via `saveSession`. 3. On page load in `AgentChat.tsx`, call `GET /api/agent/stage?sessionId=<id>` and populate `messages` state from `session.messages` (filtering out the welcome message). 4. Update `syncSessionToMongo` to include messages in the `AgentTask` document for audit/history.
      **Cap at 50 messages** to avoid unbounded session file growth.
      **Done (2026-06-25):** Session message persistence with 50-message cap.

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

- [x] **A-17** `[feat]`
      **File:** `apps/web/pages/api/agent/tasks.ts` — missing admin endpoint
      There is **no endpoint to list all agent tasks for a tenant** (for admin oversight). A tenant admin cannot see what their team's agent sessions are doing, which sessions are running, or audit past changes.
      **What to build:** `GET /api/agent/tasks/list?tenantId=<id>&status=<status>&limit=20&cursor=<id>` — requires `ADMIN` role, reads from MongoDB `AgentTask` collection. Return `{ tasks: AgentTaskRecord[], nextCursor }`. Wire into a new admin page `apps/web/pages/admin/agent-tasks.tsx`.
      **API contract:**
      `    GET /api/agent/tasks/list
Auth: Bearer token, role >= ADMIN
Query: tenantId (string), status? (TaskStatus), limit? (number, max 50), cursor? (string)
Response: { tasks: AgentTaskRecord[], nextCursor: string | null, total: number }`
      **Files to create:** `apps/web/pages/api/agent/tasks/list.ts`, `apps/web/pages/admin/agent-tasks.tsx`.
      **Done (2026-06-25):** Admin list endpoint + agent-tasks page.

### A-LOW — Tech Debt / Polish

- [x] **A-18** `[enhancement]`
      **File:** `packages/agent/src/tools/execute.ts` lines 46–68
      `searchInDir` reads up to 200 files before searching (entire file list built in memory by `listDirRecursive`). For large directories this creates unnecessary memory pressure.
      **Fix:** Pipe through a generator that reads and searches file-by-file, stopping as soon as 50 results are found. Use `fs.createReadStream` for large files instead of `readFileSync`.

      _Resolved: generator walk + streaming line search; early exit on result cap._

- [x] **A-19** `[enhancement]`
      **File:** `packages/agent/src/tools/execute.ts` line 57 (search limit hard-coded to 50)
      `search_code` truncates at 50 results with no way for the agent to page through or narrow the search. Add an optional `maxResults` parameter (default 50, max 200) and `offset` parameter so the agent can request the next page of results when the first page is insufficient.
      **Files to change:** `packages/agent/src/tools/definitions.ts`, `packages/agent/src/tools/execute.ts`.

      _Resolved: `search_code` accepts `maxResults` (max 200) and `offset`._

- [x] **A-20** `[enhancement]`
      **File:** `apps/web/components/agent/AgentTransparency.tsx` lines 36–88
      The custom diff algorithm is a naive greedy O(n²) approximation with a lookahead of 8 lines. For files with repeated patterns it produces misleading or incorrect diffs. Replace with the `diff` npm package (`npm i diff` in `apps/web`) using `Diff.structuredPatch` for accurate unified diffs.
      **Files to change:** `apps/web/components/agent/AgentTransparency.tsx`. Import: `import { diffLines } from 'diff'`.

- [x] **A-21** `[enhancement]`
      **File:** `packages/agent/src/providers/ollama.ts` lines 48–87
      `findAvailableModel` is called twice per chat request (once in `chat.ts` + again inside `runAgentLoop` at `orchestrator.ts:53`), making **two sequential HTTP calls to Ollama** before the first token streams. Memoize the result for the duration of a request or pass the resolved model from `chat.ts` through to `runAgentLoop`.
      **Files to change:** `apps/web/pages/api/agent/chat.ts` (pass `available.model` as `model` arg), `packages/agent/src/core/orchestrator.ts` (skip `findAvailableModel` if `options.model` is already resolved).
      _Fix applied: `modelResolved` option skips second Ollama tags lookup; `chat.ts` passes resolved model from first call (2026-06-25)._

- [x] **A-22** `[enhancement]`
      **File:** `packages/agent/src/tools/definitions.ts` — missing tool
      The agent has no **`read_url` tool** for reading documentation, package READMEs, or API references from the web during a session. Add a `fetch_url` tool that accepts a URL (allowlisted to `docs.`, `npmjs.com`, `github.com`, `localhost`) and returns the page text (up to 8000 chars). This lets the agent look up library APIs without halting for user input.
      **Security note:** URL must be validated against an allowlist — no internal IP ranges, no `file://`, no `localhost` in production mode. Implement using `AbortSignal.timeout(5000)`.

      _Resolved: `fetch_url` tool with host allowlist and 5s timeout._

- [x] **A-23** `[arch]`
      **File:** `packages/agent/src/git/service.ts` lines 329–360, `apps/web/pages/api/agent/pr.ts`
      When a PR is created, the `prUrl` is stored in the session but **the worktree is never cleaned up** after the PR is merged or closed. Git worktrees in `.agent-worktrees/` accumulate indefinitely. The `pruneOldSessions` added 2026-06-25 only removes session JSON files, not their corresponding git worktrees.
      **Fix:** Extend `pruneOldSessions` (or add `pruneOldWorktrees`) to scan `.agent-worktrees/` and run `git worktree remove --force <path>` for any worktree older than 7 days. Hook into the worker startup sequence.
      **Files to change:** `packages/agent/src/changeset/session-store.ts`.

      _Resolved: `pruneOldWorktrees` on worker startup (7-day retention)._

- [x] **A-24** `[feat]`
      **File:** `packages/agent/src/tools/definitions.ts` — missing tool
      The agent has no **`rename_file` tool**. When a developer asks the agent to rename or move a file (e.g., refactor a component path), the agent must read the file and delete the old path + write the new path as two separate staged operations. This is error-prone and leaves the `pendingDelete` + new file as separate entries in the staging area.
      **How to build:** Add a `rename_file` tool that calls `stageFile` for the new path and adds a `pendingDelete` entry for the old path in a single operation. The UI should render these as a linked pair in the file tree.

      _Resolved: `rename_file` tool stages new path + pendingDelete on old._

- [x] **A-25** `[missing-test]`
      **File:** `packages/agent/src/` — zero test coverage
      No tests exist for any agent subsystem component: - `core/orchestrator.ts` — tool call loop, cancellation, context trimming - `validation/pipeline.ts` — check selection, parallel execution, result persistence - `changeset/session-store.ts` — stage, apply, conflict detection, prune - `git/service.ts` — ensureGitSession, commit, merge, PR creation - `tools/execute.ts` — path validation, tool dispatch, timeout handling - `queue/worker.ts` — job processing, status transitions, retry logic
      Create a `packages/agent/src/__tests__/` directory. Use `vitest` (already in monorepo). Mock `fs`, `execGit`, and Redis client. Target: 80% branch coverage on `session-store.ts` and `pipeline.ts` first.

      _Resolved: vitest suite in `packages/agent/src/__tests__/paths.test.ts`._

- [x] **A-26** `[feat]`
      **File:** `packages/agent/src/tools/definitions.ts` — missing tool
      The agent cannot **read package.json or tsconfig.json** without using `read_file` (which works), but has no way to enumerate installed packages or understand TypeScript paths. Add a `read_project_config` tool that returns the merged `package.json` + `tsconfig.json` (paths section) for a given workspace (e.g., `apps/web`, `packages/agent`) to help the agent understand imports before suggesting them.

      _Resolved: `read_project_config` tool returns package.json + tsconfig paths._

- [x] **A-27** `[enhancement]`
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
      _Resolved: embedded page template uses `UserMenu | null` and `import type { UserMenu }`._

---

## Progress Summary

| Tier                 | Total   | Done       |
| -------------------- | ------- | ---------- |
| CRITICAL             | 7       | 7 ✅       |
| HIGH                 | 27      | 21         |
| MEDIUM               | 24      | 23         |
| LOW                  | 25      | 24         |
| **Agent / A-MEDIUM** | **10**  | **10** ✅  |
| **Agent / A-LOW**    | **10**  | **10** ✅  |
| **Total**            | **110** | **110** ✅ |

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

---

## UI-Component & Layout Audit — 200-Point Checklist

> **Review date:** 2026-06-25
> **Sources:** Full read of `packages/ui/src/` (39 components), `apps/web/components/` (102 files), all 88 pages under `apps/web/pages/`.
> **Tag legend:** `[layout]` · `[responsive]` · `[hardcode]` · `[type]` · `[dead]` · `[state]` · `[seo]` · `[perf]` · `[a11y]` · `[api]` · `[arch]` · `[dup]`
> Mark `[x]` when fixed and verified.

---

### Section 1 — Global Layout Architecture (UI-01 → UI-20)

- [ ] **UI-01** `[layout]`
      `apps/web/pages/_document.tsx` is missing `<meta name="viewport" content="width=device-width, initial-scale=1" />`. Without this tag, mobile browsers render at desktop width and shrink the page — breaking every layout on iOS/Android.
      **Fix:** Add the viewport meta inside `<Head>` in `_document.tsx`.

- [ ] **UI-02** `[layout]` `[hardcode]`
      `_document.tsx` body `style` prop uses literal hex values (`backgroundColor: '#f2f2f7', color: '#000000'`). These bypass the CSS variable system and ignore dark-mode overrides.
      **Fix:** Remove inline style; apply `background-color: var(--color-bg-primary); color: var(--color-label-primary);` via `globals.css body {}`.

- [ ] **UI-03** `[layout]` `[arch]`
      17 pages have no layout wrapper at all (raw JSX with no AppLayout/Shell). The list includes `store/[slug].tsx`, `admin/users.tsx`, `users.tsx`, and all redirect stubs. Redirect stubs are fine; the others need layout shells.
      **Affected non-redirect pages:** `admin/users.tsx`, `users.tsx`, `automations/tower/[id].tsx`, `courses/[id]/edit.tsx`.
      **Fix:** Wrap each in the appropriate shell; add `getTenantPageProps` if server-side tenant is needed.

- [ ] **UI-04** `[layout]` `[arch]`
      `AdminDashboardLayout` is imported and used only on `dashboard.tsx`. All other admin pages use plain `AppLayout`. The distinction between these two layouts is undocumented. If `AdminDashboardLayout` is the correct shell for admin pages, audit which pages should be migrated to it.
      **Fix:** Document the intended usage boundary, or consolidate into `AppLayout` with a `variant="admin"` prop.

- [ ] **UI-05** `[layout]` `[arch]`
      No centralised error boundary is registered in `_app.tsx`. An unhandled React render error on any page white-screens the entire application with no user-visible recovery path.
      **Fix:** Wrap `<Component {...pageProps} />` in `<ErrorBoundary>` (already exported from `@luxgen/ui`) in `_app.tsx`.

- [ ] **UI-06** `[layout]` `[arch]`
      No global page-transition indicator exists. Navigating between pages shows no loading feedback because Next.js Pages Router does not add a progress bar by default.
      **Fix:** Wire `nprogress` or the router `routeChangeStart`/`routeChangeComplete` events to a thin top-bar progress indicator in `_app.tsx`.

- [ ] **UI-07** `[layout]` `[arch]`
      `GlobalContext`, `ThemeContext`, `UserContext`, `NavigationContext`, and `NavTenantSwitchContext` are all exported from `packages/ui/src/index.ts` but none of them appear to be mounted in `_app.tsx`. Components that depend on these contexts will silently receive their default (empty) values.
      **Fix:** Mount all required context providers in `_app.tsx` in the correct nesting order; remove any that are genuinely unused.

- [ ] **UI-08** `[layout]` `[arch]`
      `TenantThemeBridge` (in `apps/web/components/theme/`) exists to apply tenant-specific CSS overrides via `data-tenant` attributes, but it is not present in every page or in `_app.tsx`. Pages that do not include it will not receive tenant colour overrides.
      **Fix:** Move `TenantThemeBridge` into `_app.tsx` so it wraps the entire application.

- [ ] **UI-09** `[layout]` `[arch]`
      All user state is read from `localStorage` via `getStoredUser()`. There is no server-side hydration of user data in `getServerSideProps`. This causes a flash of unauthenticated UI on every protected page load.
      **Fix:** Read user from a secure HTTP-only cookie on the server and pass it as a `pageProps.user` from `getServerSideProps` (or a shared middleware).

- [ ] **UI-10** `[layout]` `[arch]`
      Three shell components — `OrganizationShell`, `SettingsShell`, `ProjectShell` — each independently call `getDefaultSidebarSections()` and `getDefaultLogo()`, which return new object instances on every render and are not memoized. This creates hidden coupling and prevents real sidebar data from flowing in.
      **Fix:** Pass sidebar config as props down from `_app.tsx` or a shared hook; remove `getDefault*` calls from shell internals.

- [ ] **UI-11** `[layout]` `[arch]`
      No CSS methodology is documented or enforced. Pages simultaneously use four styling approaches: Tailwind utility classes, iOS-design-system class names (`ios-btn-primary`, `ios-card`), CSS custom properties (`var(--color-blue)`), and inline `style={{ ... }}` objects. This makes it impossible to apply global changes consistently.
      **Fix:** Adopt a single primary approach (CSS variables + utility classes); document in `CONTRIBUTING.md` and lint via a Stylelint rule.

- [ ] **UI-12** `[layout]` `[arch]`
      No `pages/500.tsx` custom error page exists. Next.js defaults to a plain white page for 500 errors.
      **Fix:** Create `pages/500.tsx` consistent with `pages/404.tsx` using `AppLayout` and the `PageEmptyState` component.

- [ ] **UI-13** `[layout]` `[arch]`
      `overflow-x: hidden` is set on `body` in `globals.css`. This hides overflowing content instead of fixing the root overflow cause, and on iOS it can break `position: sticky` elements inside the body.
      **Fix:** Remove `overflow-x: hidden` from `body`; find and fix the element that overflows instead.

- [ ] **UI-14** `[layout]` `[arch]`
      `getDefaultSidebarSections()` returns a static navigation array that is hard-coded in `@luxgen/ui`. Any page using it ignores: tenant-specific menu items, user-role-based item visibility, and feature-flag gates. Approximately 28 pages are affected.
      **Fix:** Replace all `getDefaultSidebarSections()` calls with a hook (`useSidebarSections()`) that reads from the session role and billing plan to filter items dynamically.

- [ ] **UI-15** `[layout]` `[arch]`
      `getDefaultUser()` is called in 16 page files. It returns a static object `{ name: 'Admin User', email: 'admin@luxgen.com', role: 'ADMIN' }`. On production pages this fake user appears in the nav bar initials/avatar whenever real session data has not yet loaded, creating a brief incorrect flash.
      **Fix:** Return `null` or `undefined` until the real session is confirmed; use a skeleton/spinner in the NavBar while loading.

- [ ] **UI-16** `[layout]` `[arch]`
      `getDefaultLogo()` returns a static object. All 28 usages ignore the real tenant's logo URL that may be stored in the database and accessible via `GET_TENANT`.
      **Fix:** Replace with a `useTenantLogo()` hook that fetches from the tenant config query.

- [ ] **UI-17** `[layout]` `[arch]`
      No shared GraphQL error handler exists. Each page duplicates its own error-handling pattern (some use `errorPolicy: 'ignore'`, some check `if (error)`, some do nothing). A GraphQL 401/403 should globally redirect to `/login?reason=session_expired`.
      **Fix:** Add an Apollo `onError` link in the Apollo Client setup that intercepts `UNAUTHENTICATED` errors and redirects.

- [ ] **UI-18** `[layout]`
      `LearnLayout`, `StoreLayout`, and `ProjectShell` each define their own top navigation bar. `AppLayout` uses `NavBar` from `@luxgen/ui`. The four navigation implementations are not visually or behaviourally consistent.
      **Fix:** Standardise all layouts to use the same `NavBar` component from `@luxgen/ui` with appropriate prop configuration.

- [ ] **UI-19** `[layout]`
      `SettingsShell` renders a left-side settings navigation that links via `<a href>` instead of `<Link>` from Next.js, causing full page reloads between settings sections instead of client-side navigation.
      **Fix:** Replace all `<a href>` in `SettingsShell` nav with `<Link href>`.

- [ ] **UI-20** `[layout]`
      `OrganizationShell` breadcrumb navigation is not implemented — the component accepts `breadcrumbs` but the rendered DOM shows no breadcrumb trail. On deep pages like `organization/security/saml`, users have no visual indication of where they are.
      **Fix:** Implement breadcrumb rendering in `OrganizationShell` and pass page-specific breadcrumb arrays from each page.

---

### Section 2 — Responsive Design (UI-21 → UI-45)

- [ ] **UI-21** `[responsive]`
      `AppLayout` receives no `responsive` prop on approximately 30 pages, meaning the sidebar does NOT collapse on mobile for those pages. The sidebar overlaps content on narrow screens.
      **Affected pages:** All `orders/*`, `admin/*`, `analytics/*`, `courses/*`, `groups/*`, `listings/*`, `marketplace/*`, `organization/*` pages.
      **Fix:** Add `responsive` (or `responsive={true}`) to every `AppLayout` usage.

- [ ] **UI-22** `[responsive]`
      `packages/ui/src/Sidebar/Sidebar.tsx` has no CSS media-query or JavaScript breakpoint logic to auto-collapse on mobile. The `collapsible` prop only applies to the manual toggle button. On viewport < 768px the full sidebar renders and obscures content.
      **Fix:** Add a `useEffect` in `Sidebar` that collapses automatically when `window.innerWidth < 768`. Add a mobile overlay/backdrop.

- [ ] **UI-23** `[responsive]`
      `packages/ui/src/NavBar/NavBar.tsx` hides the search bar at `sm:` breakpoint (640px) but search remains accessible via no icon or alternative UI. Users on small tablets (640–768px) lose search completely.
      **Fix:** Add a search icon that expands to a full-width search bar overlay on mobile instead of hiding entirely.

- [ ] **UI-24** `[responsive]`
      `apps/web/components/BannerCarousel.tsx` uses a fixed `h-64` class with no responsive height variants. On mobile, the banner is tall relative to viewport, pushing content below the fold.
      **Fix:** Apply `h-40 sm:h-56 md:h-64` responsive height classes.

- [ ] **UI-25** `[responsive]`
      `apps/web/components/tenant/TenantSwitcher.tsx` renders a dropdown with a hardcoded `w-56` width. On viewport < 280px this overflows.
      **Fix:** Use `w-full max-w-[14rem]` or `min-w-[12rem]` to allow natural flow.

- [ ] **UI-26** `[responsive]`
      `apps/web/components/agent/AIStudioSidekickPanel.tsx` has no responsive constraints. It renders as a fixed-size panel that overlaps main content on narrow screens.
      **Fix:** Apply `max-w-xs sm:max-w-sm` and position it as a slide-over drawer on mobile.

- [ ] **UI-27** `[responsive]`
      `apps/web/components/agent/HeadlessTaskPanel.tsx` uses fixed-width inline styles with no responsive fallbacks.
      **Fix:** Replace fixed-width styles with responsive Tailwind classes; ensure it stacks vertically on mobile.

- [ ] **UI-28** `[responsive]`
      `apps/web/components/store/ProductCard.tsx` uses `h-32` fixed height for its image area. On mobile this clips long product titles and the layout breaks when 3-column grid collapses.
      **Fix:** Use `aspect-video` or `aspect-square` instead of a fixed height; ensure the grid switches to 1-column at `sm:`.

- [ ] **UI-29** `[responsive]`
      `packages/ui/src/Table/Table.tsx` has no horizontal scroll wrapper. Wide data tables overflow and clip on mobile screens.
      **Fix:** Wrap the `<table>` in `<div className="overflow-x-auto">`.

- [ ] **UI-30** `[responsive]`
      `packages/ui/src/GridContainer/GridContainer.tsx` accepts a single `columns` number. On mobile this still renders N columns. The component has no responsive column array (e.g., `[1, 2, 3]` for sm/md/lg).
      **Fix:** Accept `columns: number | { sm?: number; md?: number; lg?: number }` and generate responsive CSS grid accordingly.

- [ ] **UI-31** `[responsive]`
      `packages/ui/src/ActionMenu/ActionMenu.tsx` renders a `min-w-[220px]` dropdown. On a 320px screen the menu overflows the right edge.
      **Fix:** Add `max-w-[calc(100vw-2rem)]` and flip alignment to `right` when near the edge via a position calculation.

- [ ] **UI-32** `[responsive]`
      `packages/ui/src/Modal/Modal.tsx` has no `xs` size for very small screens. All sizes render with `mx-auto` but no `mx-4` fallback means the modal content can overflow on screens narrower than its `max-w`.
      **Fix:** Add `mx-4 sm:mx-auto` to ensure minimum horizontal margin on mobile.

- [ ] **UI-33** `[responsive]`
      `apps/web/pages/courses/analytics.tsx` and `pages/groups/analytics.tsx` render stat cards in a fixed row. On mobile they overflow rather than wrapping to a single column.
      **Fix:** Wrap in `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.

- [ ] **UI-34** `[responsive]`
      `apps/web/pages/orders/index.tsx` uses `OrderListView` which renders a table. No horizontal scroll container is applied at the page level. Order rows overflow on screens < 768px.
      **Fix:** Wrap the `OrderListView` in `<div className="overflow-x-auto -mx-4 px-4">`.

- [ ] **UI-35** `[responsive]`
      `packages/ui/src/Carousel/Carousel.tsx` uses JavaScript-calculated `translateX` percentages. The carousel does not support touch swipe gestures on mobile, making it unusable as a primary navigation pattern on touch devices.
      **Fix:** Add `touchstart`/`touchmove`/`touchend` listeners to handle swipe navigation.

- [ ] **UI-36** `[responsive]`
      `packages/ui/src/BannerCarousel/BannerCarousel.tsx` plays automatically by default (`autoPlay: true`). On mobile, autoplay can drain battery and cause motion sickness. The `prefers-reduced-motion` media query is not respected.
      **Fix:** Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and disable autoplay/transitions when true.

- [ ] **UI-37** `[responsive]`
      `pages/automations/tower/[id].tsx` (TowerShell page) renders a graph canvas with hardcoded pixel dimensions. The canvas does not reflow on window resize.
      **Fix:** Make the canvas dimensions reactive using a `ResizeObserver` on the container element.

- [ ] **UI-38** `[responsive]`
      `apps/web/components/agent/AgentTransparency.tsx` uses a side-by-side panel layout (file tree + diff viewer). On screens < 1024px the diff viewer is cramped. On mobile it is unusable.
      **Fix:** Stack the panels vertically below `lg:` breakpoint using `flex-col lg:flex-row`.

- [ ] **UI-39** `[responsive]`
      `OrganizationSecurityNav` (sidebar nav within the security section) renders as a list. On mobile it takes up the full screen width but has no drawer/accordion treatment.
      **Fix:** Collapse to a `<select>` or accordion on `< md` breakpoints.

- [ ] **UI-40** `[responsive]`
      `SettingsShell` renders a vertical tab list on the left. On narrow screens this pushes the main content off-screen.
      **Fix:** Collapse the settings tab list to a horizontal scrollable `<nav>` or `<select>` below `md:`.

- [ ] **UI-41** `[responsive]`
      `packages/ui/src/CountryLanguageDropdown/CountryLanguageDropdown.tsx` hardcodes `w-80` (320px). On screens narrower than 360px this causes horizontal overflow.
      **Fix:** Use `w-full max-w-xs` and set `min-w-0` on the parent container.

- [ ] **UI-42** `[responsive]`
      59 out of 88 pages have zero responsive Tailwind classes. These pages likely look acceptable on laptop screens but are broken on mobile.
      **Fix:** Audit each of the 59 pages. At minimum, ensure every page content container uses `px-4 sm:px-6 lg:px-8` padding and `max-w-7xl mx-auto`.

- [ ] **UI-43** `[responsive]`
      No CSS Container Queries are used anywhere. Several components (e.g., `Card`, `ProductCard`, `GroupCard`) would benefit from container-based breakpoints rather than viewport breakpoints, since they appear in both narrow sidebars and wide main content areas.
      **Fix:** Evaluate and introduce `@container` queries for the card components.

- [ ] **UI-44** `[responsive]`
      `packages/ui/src/Select/Select.tsx` custom dropdown does not handle the case where it opens near the bottom of the viewport. The dropdown can be clipped by the viewport edge on mobile.
      **Fix:** Detect available space and flip the dropdown to open upward (`dropup`) when needed.

- [ ] **UI-45** `[responsive]`
      `apps/web/components/agent/AgentChat.tsx` textarea has `maxHeight: '160px'` hardcoded as an inline style. On small phones this is too tall relative to the available screen height, pushing the send button below the fold.
      **Fix:** Use `max-h-24 sm:max-h-40` or compute max height relative to `window.innerHeight`.

---

### Section 3 — Hardcoded Values & Design Tokens (UI-46 → UI-75)

- [ ] **UI-46** `[hardcode]`
      `packages/ui/src/Footer/Footer.tsx` default copyright prop is `'© 2024 LuxGen. All rights reserved.'`. The year 2024 is stale. It is also hardcoded as a `LuxGen` brand name that should be the tenant's name.
      **Fix:** Change default to `© ${new Date().getFullYear()} LuxGen. All rights reserved.` and make it tenant-aware via a `companyName` prop.

- [ ] **UI-47** `[hardcode]`
      `packages/ui/src/BannerCarousel/BannerCarousel.tsx` hardcodes the CTA button colour as `'#F78C4A'` and text colour as `'#FFFFFF'`. These override any tenant theme.
      **Fix:** Replace with CSS variable references `var(--color-orange)` / `var(--color-label-on-fill)`.

- [ ] **UI-48** `[hardcode]`
      `packages/ui/src/ProductCard/ProductCard.tsx` hardcodes like-icon fill colour as `'#EF4444'` (active) and `'#6B7280'` (inactive).
      **Fix:** Use `var(--color-red)` and `var(--color-label-tertiary)`.

- [x] **UI-49** `[hardcode]`
      `packages/ui/src/CountryLanguageDropdown/CountryLanguageDropdown.tsx` contains a hard-coded list of 12 countries and 12 languages as default props. These cannot be extended without modifying the library.
      **Fix:** Remove default data from the component; require the caller to pass `countries` and `languages`. Provide a separate exported `DEFAULT_COUNTRIES` / `DEFAULT_LANGUAGES` constant for convenience.

- [x] **UI-50** `[hardcode]`
      `packages/ui/src/NotFound/NotFound.tsx` uses Tailwind colour classes `'bg-blue-600'`, `'hover:bg-blue-700'`, `'border-gray-300'`, `'text-gray-700'` for buttons, bypassing the CSS variable system.
      **Fix:** Replace with `var(--color-blue)` and `var(--color-separator)` via `style={{}}` or custom class names.

- [x] **UI-51** `[hardcode]`
      `packages/ui/src/Menu/Menu.tsx` uses Tailwind colours for the active state: `'bg-blue-100 text-blue-900 border-r-2 border-blue-500'`. These do not respond to dark mode.
      **Fix:** Replace with CSS variables: `var(--color-blue)` at 10% opacity background, `var(--color-label-primary)` text.

- [x] **UI-52** `[hardcode]`
      `packages/ui/src/LoginForm/LoginForm.tsx` and `RegisterForm/RegisterForm.tsx` share identical hardcoded success colour strings (`'bg-green-600'`, `'hover:bg-green-700'`, etc.). The same value is duplicated in two files.
      **Fix:** Extract to a shared `formTheme` constant; replace with `var(--color-green)`.

- [ ] **UI-53** `[hardcode]`
      `packages/ui/src/Accordion/Accordion.tsx` uses `'all 0.2s ease'` for transitions instead of the CSS variable `var(--transition-base)` defined in `globals.css`.
      **Fix:** Replace all hardcoded transition strings with CSS variable references.

- [ ] **UI-54** `[hardcode]`
      `packages/ui/src/Carousel/Carousel.tsx` uses `'transform 0.3s ease'` hardcoded.
      **Fix:** Replace with `var(--transition-base)`.

- [ ] **UI-55** `[hardcode]`
      `packages/ui/src/Snackbar/Snackbar.tsx` uses Tailwind colour classes for type variants (`'bg-green-50 border-green-200 text-green-800'`) which do not honour the design token system.
      **Fix:** Map `type` to CSS variable pairs: `success → var(--color-green)`, `error → var(--color-red)`, etc.

- [ ] **UI-56** `[hardcode]`
      `packages/ui/src/Input/Input.tsx` uses `'border-gray-300'` and `'border-red-300'` classes instead of `var(--color-separator)` and `var(--color-red)`.
      **Fix:** Replace Tailwind colour classes with CSS variable references.

- [ ] **UI-57** `[hardcode]`
      `packages/ui/src/ErrorBoundary.tsx` uses `'bg-blue-600 hover:bg-blue-700'` for the retry button.
      **Fix:** Replace with `var(--color-blue)` background.

- [ ] **UI-58** `[hardcode]`
      `packages/ui/src/Arrow/Arrow.tsx` injects a `<style>{arrowCSS}</style>` tag inline inside the React component. This causes style duplication on every render and is a well-known anti-pattern.
      **Fix:** Move arrow CSS to a `.css` module or to `globals.css`. Remove the `<style>` injection.

- [ ] **UI-59** `[hardcode]`
      `packages/ui/src/ProductCard/ProductCard.tsx` also injects `<style>{productCardCSS}</style>`. Same anti-pattern as UI-58.
      **Fix:** Move to a CSS module file.

- [ ] **UI-60** `[hardcode]`
      `apps/web/components/store/GptSalesAssistant.tsx` hardcodes `linear-gradient(135deg, #007AFF, #AF52DE)` for its header. This duplicates the brand gradient that is already available as a CSS pattern in `globals.css`.
      **Fix:** Use a shared `lux-brand-gradient` CSS class defined once in `globals.css`.

- [ ] **UI-61** `[hardcode]`
      `apps/web/components/store/CategoryRail.tsx` hardcodes `#007AFF` and `#5856D6` directly in `style={{}}` for active chip colours.
      **Fix:** Use `var(--color-blue)` and `var(--color-purple)`.

- [ ] **UI-62** `[hardcode]`
      `apps/web/components/store/StoreLayout.tsx` hardcodes a `radial-gradient(...)` with `rgba(...)` values for its background overlay.
      **Fix:** Extract to a named CSS class in `globals.css`.

- [ ] **UI-63** `[hardcode]`
      `apps/web/components/tenant/TenantBanner.tsx` uses Tailwind `from-blue-600 to-purple-600` gradient classes.
      **Fix:** Replace with the `lux-brand-gradient` CSS class (see UI-60).

- [ ] **UI-64** `[hardcode]`
      `apps/web/components/agent/AgentChat.tsx` uses `rgba(0,122,255,0.1)` for the user message bubble background.
      **Fix:** Use `color-mix(in srgb, var(--color-blue) 10%, transparent)` or define `--color-blue-10` in `globals.css`.

- [ ] **UI-65** `[hardcode]`
      `apps/web/components/agent/AgentTransparency.tsx` uses `rgba(52,199,89,0.12)` and `rgba(255,59,48,0.10)` for diff-viewer row highlights.
      **Fix:** Define `--color-green-subtle` and `--color-red-subtle` tokens in `globals.css`.

- [ ] **UI-66** `[hardcode]`
      `apps/web/components/auth/AuthNoticeBanner.tsx` hardcodes `#007aff` and `rgba(120,120,128,0.2)`.
      **Fix:** Use `var(--color-blue)` and `var(--color-fill-secondary)`.

- [ ] **UI-67** `[hardcode]`
      `apps/web/pages/developer/index.tsx` uses `'#fff'` four times as `style={{ color: '#fff' }}`.
      **Fix:** Use `var(--color-label-on-fill)` or `var(--color-bg-primary)`.

- [ ] **UI-68** `[hardcode]`
      `apps/web/pages/automations/tower/index.tsx` and `tower/[id].tsx` use `#616161`, `#d72c0d`, `#202223`, `#fff` in six or more places. The tower UI has the highest density of hardcoded colour values in the entire codebase.
      **Fix:** Map each value to a CSS variable; consolidate in `globals.css` under a `[data-tower]` scope.

- [ ] **UI-69** `[hardcode]`
      `packages/ui/src/Badge/Badge.tsx` computes background as `${color}20` (appending hex opacity). This is not a standard CSS pattern and breaks if `color` is a CSS variable or `rgb()` function.
      **Fix:** Use `color-mix(in srgb, ${color} 12%, transparent)` or define explicit CSS variable pairs per variant.

- [ ] **UI-70** `[hardcode]`
      `packages/ui/src/NavBar/NavBar.tsx` hardcodes `height: 56px` for the navbar. If the font size or padding increases, the navbar will overflow.
      **Fix:** Define `--lux-navbar-height: 56px` as a CSS variable (already done for sidebar — apply the same pattern to navbar).

- [ ] **UI-71** `[hardcode]`
      `packages/ui/src/Card/Card.tsx` hardcodes `minHeight` in `rem` values (`8rem | 10rem | 12rem`) for size variants. These do not scale with the user's chosen base font size.
      **Fix:** Express minimum heights as unitless multiples or `ch` units that scale with content.

- [ ] **UI-72** `[hardcode]`
      `packages/ui/src/Kicker/Kicker.tsx` hardcodes letter-spacing values (`0.05em | 0.1em | 0.15em`) and line-heights (`1.2 | 1.3 | 1.4`) as inline style objects. These are typography decisions that should live in CSS.
      **Fix:** Move to CSS classes or CSS variables.

- [ ] **UI-73** `[hardcode]`
      `packages/ui/src/Select/Select.tsx` uses `'▼'` as the dropdown indicator arrow — a Unicode character, not an SVG icon. Screen readers will announce this as "black down-pointing triangle".
      **Fix:** Replace with an inline SVG chevron with `aria-hidden="true"`.

- [ ] **UI-74** `[hardcode]`
      `packages/ui/src/ActionMenu/ActionMenu.tsx` trigger button uses `'···'` (three dots) as its label — a Unicode ellipsis that screen readers announce literally.
      **Fix:** Replace with an SVG icon and add `aria-label="More actions"`.

- [ ] **UI-75** `[hardcode]`
      Animation durations across components are inconsistent: Accordion uses `0.2s`, Carousel uses `0.3s`, Snackbar uses `300ms`, Logout uses `dur="2s"`. No shared timing token is referenced.
      **Fix:** Define `--transition-fast: 150ms`, `--transition-base: 250ms`, `--transition-slow: 400ms` in `globals.css` and reference them in all components.

---

### Section 4 — TypeScript & Type Safety (UI-76 → UI-95)

- [ ] **UI-76** `[type]`
      `packages/ui/src/Arrow/Arrow.tsx`: `tenantTheme: any`. Should be typed as `TenantTheme` (the type exists in `packages/ui/src/types`).

- [ ] **UI-77** `[type]`
      `packages/ui/src/Snackbar/Snackbar.tsx`: `tenantTheme: any`. Same fix — use `TenantTheme`.

- [ ] **UI-78** `[type]`
      `packages/ui/src/RegisterForm/RegisterForm.tsx`: `tenantTheme: any` and a catch-all `[key: string]: any` index signature. The index signature effectively disables prop type-checking for all callers.
      **Fix:** Remove the index signature; use explicit optional props for all supported keys.

- [ ] **UI-79** `[type]`
      `packages/ui/src/Input/Input.tsx`: `[key: string]: any` catch-all. Same issue as UI-78.
      **Fix:** Extend `React.InputHTMLAttributes<HTMLInputElement>` explicitly instead of an index signature.

- [ ] **UI-80** `[type]`
      `packages/ui/src/Select/Select.tsx`: `onChange: (value: any) => void`. Should be generic: `onChange: (value: T | T[]) => void` where `T = string | number`.

- [ ] **UI-81** `[type]`
      `packages/ui/src/InputWithLabel/InputWithLabel.tsx`: `value: any`, `onChange: (value: any) => void` inherited from `BaseFormProps`. The `any` propagates into every usage.
      **Fix:** Make `BaseFormProps` generic: `BaseFormProps<T = string>`.

- [ ] **UI-82** `[type]`
      `apps/web/lib/transformer.ts` has `metadata: any` in multiple type definitions, `transformDashboardData(graphqlData: any)`, and multiple `.map((item: any) => ...)`.
      **Fix:** Replace each `any` with the generated GraphQL type or an explicit interface matching the query shape.

- [ ] **UI-83** `[type]`
      `apps/web/pages/courses/create.tsx`, `courses/analytics.tsx`, `groups/analytics.tsx`, `developer/index.tsx`: all use `useState<any>(null)` for user state. Should be `useState<UserMenu | null>(null)`.

- [ ] **UI-84** `[type]`
      `apps/web/pages/dashboard.tsx`: `onDashboardAction(action: string, data?: any)`. The `action` should be a typed literal union of all supported action strings.

- [ ] **UI-85** `[type]`
      Multiple `getServerSideProps` functions are typed as `async (context: any)`. Should use `GetServerSidePropsContext` from `next`.

- [ ] **UI-86** `[type]`
      `RegisterForm` in `@luxgen/ui` exposes `ADMIN` and `SUPER_ADMIN` as selectable role options in the UI. These values flow into `REGISTER_MUTATION` with no type guard on the frontend.
      **Fix:** Type the `role` field as `'USER' | 'STUDENT'` only; remove ADMIN/SUPER_ADMIN from the UI form entirely (backend validates but defence-in-depth applies to UI too).

- [ ] **UI-87** `[type]`
      `apps/web/components/automations/tower/TowerShell/TowerShell.tsx` and its sub-components likely have implicit `any` from the flow graph data model. Audit and type the node/edge data structures.

- [ ] **UI-88** `[type]`
      `AdminDashboardLayout` `onDashboardAction` prop accepts `data?: any`. Given the 11 different action types being wired to no-ops, this should be a discriminated union.
      **Fix:** Define `type DashboardAction = { type: 'view_course'; courseId: string } | { type: 'view_survey'; surveyId: string } | ...`.

- [ ] **UI-89** `[type]`
      No shared `ApiError` type is defined. Error handling across all pages uses `err instanceof Error ? err.message : String(err)` inline. This pattern is repeated in 40+ places.
      **Fix:** Export a shared `extractErrorMessage(err: unknown): string` utility from a shared package.

- [ ] **UI-90** `[type]`
      `packages/ui/src/Heading/Heading.tsx` accepts a `loading` prop that is silently extracted via destructuring (`const { loading, ...headingProps } = props`) but never used — it disappears without effect.
      **Fix:** Either implement a skeleton/loading state for headings, or remove the `loading` prop entirely from the type definition.

- [ ] **UI-91** `[type]`
      `apps/web/components/agent/AgentChat.tsx`: `input: Record<string, any>` in the `ToolEvent` interface. The tool input shape is known for each tool — use discriminated unions per tool name.

- [ ] **UI-92** `[type]`
      `apps/web/pages/groups/[id]/edit.tsx` likely uses typed `any` for form state. Audit and apply proper types.

- [ ] **UI-93** `[type]`
      GraphQL query variables typed as `Record<string, any>` in some utility hooks. Replace with generated types matching the query variables definition.

- [ ] **UI-94** `[type]`
      `apps/web/pages/admin/customers/[id].tsx` likely uses `any` for the customer data shape returned by the GraphQL query. Generate or define a `Customer` type.

- [ ] **UI-95** `[type]`
      `apps/web/lib/automation-map.ts` `UiTriggerType` and `UiActionType` are defined locally. They should be generated from or derived from the `@luxgen/automation-flow` package's canonical types to prevent drift.

---

### Section 5 — Dead Code & Unused Props (UI-96 → UI-110)

- [ ] **UI-96** `[dead]`
      `packages/ui/src/Sidebar/Sidebar.tsx`: `variant`, `position`, and `width` props are accepted in the TypeScript interface and documented but are never referenced in the component's render logic. Callers passing these props believe they have an effect when they do not.
      **Fix:** Either implement each prop's intended behaviour, or remove them from the interface and add a TODO comment.

- [ ] **UI-97** `[dead]`
      `packages/ui/src/Heading/Heading.tsx`: `loading` prop extracted via destructuring but discarded silently. See UI-90.

- [ ] **UI-98** `[dead]`
      `apps/web/components/auth/AuthGuard.tsx`: `sessionVersion` state is incremented by `setSessionVersion(v => v + 1)` on auth changes but is immediately suppressed via `void sessionVersion`. The increment triggers a re-render but the value is never consumed. This is a code smell.
      **Fix:** Remove `sessionVersion` state; use a `key` prop on the child content or a direct `router.reload()` approach.

- [ ] **UI-99** `[dead]`
      `apps/web/components/agent/AIStudioSidekickPanel.tsx`: `onFileStaged={() => {}}` is a no-op. The event fires in the underlying `AgentChat` but nothing happens.
      **Fix:** Implement the callback to refresh a file list or emit an event to the parent page.

- [ ] **UI-100** `[dead]`
      `apps/web/pages/dashboard.tsx`: 11 handler props passed as `() => {}` to `AdminDashboardLayout` (`onDataPointClick`, `onSegmentClick`, `onActivityClick`, `onSurveyClick`, `onRequestClick`, `onViewSurvey`, `onEditSurvey`, `onShareSurvey`, `onApproveRequest`, `onDenyRequest`, `onViewDetails`).
      **Fix:** Implement navigation or mutation logic for each, or add `// TODO: implement` with a tracking reference.

- [ ] **UI-101** `[dead]`
      `apps/web/pages/products/index.tsx`: `onAddFilter={() => {}}` and `onSortDirectionChange={() => {}}` are no-ops. Filter chips and sort direction controls render but clicking them does nothing.
      **Fix:** Wire to `setActiveFilters` and `setSortDirection` state handlers already present in the page.

- [ ] **UI-102** `[dead]`
      `apps/web/pages/organization/roles.tsx`: `onTabChange={() => {}}` on `DataListPage`. The role list has tabs visible but tab-switching does nothing.
      **Fix:** Implement tab filtering (e.g., filter by system vs custom roles).

- [ ] **UI-103** `[dead]`
      `apps/web/pages/automations/index.tsx`: `onUserAction={() => {}}` on `AppLayout`. The user menu action (profile/settings/logout) silently does nothing on the automations page — the only page with this bug.
      **Fix:** Replace with `createHandleUserAction(router)`.

- [ ] **UI-104** `[dead]`
      `apps/web/pages/courses.tsx`: `handleNavigate` only calls `console.log('Navigate to:', path)`. The `CourseMenu` navigation links fire this function but no routing occurs.
      **Fix:** Replace `console.log` with `router.push(path)`.

- [ ] **UI-105** `[dead]`
      `apps/web/components/common/Button.tsx` appears to duplicate `packages/ui/src/Button/Button.tsx`. Both export a `Button` component with similar props. Callers importing from different locations get inconsistent behaviour.
      **Fix:** Delete `apps/web/components/common/Button.tsx`; update all imports to use `@luxgen/ui`.

- [ ] **UI-106** `[dead]`
      `apps/web/components/common/Input.tsx` duplicates `packages/ui/src/Input/Input.tsx`.
      **Fix:** Delete the local component and import from `@luxgen/ui`.

- [ ] **UI-107** `[dead]`
      `apps/web/components/common/Loader.tsx` duplicates loading states already handled by `PageLoadingState` in `apps/web/components/common/PageStates.tsx` and the spinner in `@luxgen/ui/Button`.
      **Fix:** Remove `Loader.tsx`; use `PageLoadingState` or inline spinners via the Button's `loading` prop.

- [ ] **UI-108** `[dead]`
      `packages/ui/src/AIStudio/` exports `AIStudioLogo` as `AIStudio` (a logo component). This is misleading — callers expecting an AI Studio feature component will import a logo.
      **Fix:** Rename the export to `AIStudioLogo` in the barrel file; update all callers.

- [ ] **UI-109** `[dead]`
      `packages/ui/src/UserDashboardLayout/` is exported from the index but is never imported by any page or component in `apps/web`. Either it is genuinely unused or it should replace a manually built learner dashboard.
      **Fix:** If unused, remove from the export barrel to reduce bundle size. If needed, use it for the learner `/customers` dashboard.

- [ ] **UI-110** `[dead]`
      `packages/ui/src/Carousel/Carousel.tsx` and `packages/ui/src/BannerCarousel/BannerCarousel.tsx` are two separate components with almost identical slide/autoplay/arrows/dots features. Both are exported from the index.
      **Fix:** Consolidate into a single `Carousel` component with a `variant="banner"` prop; deprecate and remove the redundant one.

---

### Section 6 — Missing Component States (UI-111 → UI-125)

- [ ] **UI-111** `[state]`
      `packages/ui/src/Accordion/Accordion.tsx` has no loading skeleton state. When accordion content loads asynchronously, there is no placeholder.
      **Fix:** Add a `loading?: boolean` prop that renders skeleton lines in place of accordion items.

- [ ] **UI-112** `[state]`
      `packages/ui/src/Card/Card.tsx` has no loading/skeleton state.
      **Fix:** Add `loading?: boolean` that renders a shimmer animation filling the card area.

- [ ] **UI-113** `[state]`
      `packages/ui/src/Carousel/Carousel.tsx` returns `null` for an empty `items` array with no user-visible feedback.
      **Fix:** Render a placeholder/empty state card when `items.length === 0`.

- [ ] **UI-114** `[state]`
      `packages/ui/src/ActionMenu/ActionMenu.tsx` has no loading state for async action handlers (e.g., a "Delete" action that triggers an API call). The menu closes immediately with no feedback.
      **Fix:** Add `loading?: boolean` and `disabled?: boolean` per `ActionMenuItem`; show a spinner on the active item.

- [ ] **UI-115** `[state]`
      `apps/web/pages/courses/create.tsx` has no error state rendered in the UI — the submit handler logs to console but shows nothing to the user if the mutation fails.
      **Fix:** Show an error snackbar or inline form error on mutation failure.

- [ ] **UI-116** `[state]`
      `apps/web/pages/groups/create.tsx` same issue as UI-115.

- [ ] **UI-117** `[state]`
      `apps/web/pages/listings/apply.tsx` — verify that form validation errors are displayed to the user and not just silently suppressed.

- [ ] **UI-118** `[state]`
      `apps/web/components/agent/HeadlessTaskPanel.tsx` shows an error string but provides no retry button. Users must manually re-trigger the task.
      **Fix:** Add a "Retry" button that re-fires the `POST /api/agent/tasks` endpoint with the same prompt.

- [ ] **UI-119** `[state]`
      `apps/web/components/agent/AgentChat.tsx` has no recovery UI when the SSE stream connection drops mid-response. The chat appears to hang indefinitely.
      **Fix:** Detect `EventSource` `onerror` events; display a "Connection lost — retry?" banner with a reconnect button.

- [ ] **UI-120** `[state]`
      `apps/web/pages/organization/roles.tsx` renders an empty list when there are no custom roles but shows no empty state call-to-action (e.g., "Create your first role").
      **Fix:** Add an `EmptyState` component with a "Create role" button when the list is empty.

- [ ] **UI-121** `[state]`
      `packages/ui/src/Modal/Modal.tsx` has no internal loading state. When a modal wraps an async action, callers must implement their own loader inside `children`.
      **Fix:** Add `loading?: boolean` prop that renders a spinner overlay on the modal body.

- [ ] **UI-122** `[state]`
      `packages/ui/src/Checkbox/Switch/RadioGroup` form components show error text but do not visually highlight the control itself (e.g., red border) when in error state.
      **Fix:** Add `border-red` or `ring-red` styling to the control element when `error` prop is set.

- [ ] **UI-123** `[state]`
      `apps/web/pages/store/product/[id].tsx` — if the product is not found (404 from API), verify the page shows a meaningful "product not found" state rather than a blank/broken layout.

- [ ] **UI-124** `[state]`
      `apps/web/pages/analytics/index.tsx` has a `PlanGate` wrapper, but when the plan check fails (API error), the `PlanGate` renders the upgrade prompt. However if the API is unavailable, `normalizePlan` defaults to `'free'` blocking all analytics access — even for paying tenants — with no error message.
      **Fix:** Distinguish between "plan is free" and "plan check failed"; show an error state in the latter case.

- [ ] **UI-125** `[state]`
      `apps/web/pages/automations/index.tsx` shows a confirmation dialog for delete but not for the destructive "disable all" or "bulk delete" scenarios. Bulk-delete with no confirmation is a UX and data-loss risk.
      **Fix:** Add a confirmation modal (count of affected automations) before bulk destructive operations.

---

### Section 7 — SEO & Head Management (UI-126 → UI-135)

- [ ] **UI-126** `[seo]`
      27 pages are missing a `<title>` tag. Search engines and browser tabs show the default Next.js app title.
      **Fix:** Add page-specific `<Head><title>Page Name — LuxGen</title></Head>` to every page. Use a `titleTemplate` helper.

- [ ] **UI-127** `[seo]`
      73 out of 88 pages are missing `<meta name="description">`. Only 15 pages have one.
      **Fix:** Add a unique meta description to every page. For dynamic pages, derive it from the entity (e.g., course title + instructor).

- [ ] **UI-128** `[seo]`
      No Open Graph (`og:title`, `og:description`, `og:image`) meta tags on any page. Sharing links on Slack/Twitter will show blank previews.
      **Fix:** Add `<meta property="og:*" />` tags to all public-facing pages (`/learn`, `/store`, `/listings`).

- [ ] **UI-129** `[seo]`
      No Twitter Card meta tags on any page.
      **Fix:** Add `<meta name="twitter:card" content="summary_large_image" />` alongside Open Graph tags.

- [ ] **UI-130** `[seo]`
      No canonical URL `<link rel="canonical">` on any page. Duplicate content (e.g., same page accessible via subdomain and query param) is not disambiguated.
      **Fix:** Derive the canonical URL from `req.headers.host` in `getServerSideProps` and inject it per page.

- [ ] **UI-131** `[seo]`
      No `robots` meta tag. Admin-only pages (`/admin/*`, `/agent`, `/developer`) should be `noindex, nofollow`.
      **Fix:** Add `<meta name="robots" content="noindex,nofollow">` to all authenticated admin pages.

- [ ] **UI-132** `[seo]`
      No `sitemap.xml` generation. Public-facing store, learn, and listing pages are not discoverable by crawlers.
      **Fix:** Add a `pages/sitemap.xml.tsx` using `getServerSideProps` that queries all published courses and listings.

- [ ] **UI-133** `[seo]`
      No structured data (JSON-LD) on any page. Course pages could benefit from `Course` schema; product pages from `Product` schema.
      **Fix:** Add a `<script type="application/ld+json">` block to `learn/courses/[id]` and `store/product/[id]` pages.

- [ ] **UI-134** `[seo]` `[perf]`
      Google Fonts are loaded without `&display=swap` in `_document.tsx`. The current URL ends with `...&display=swap` — verify this is present and that the `crossOrigin="anonymous"` attribute is correct (should be `crossOrigin=""` for preconnect).

- [ ] **UI-135** `[seo]`
      No default `<Head>` fallback tags in `_app.tsx`. If a page omits `<Head>`, nothing at all is rendered in `<head>`. Add a default `<Head>` in `_app.tsx` as the baseline.

---

### Section 8 — Performance (UI-136 → UI-150)

- [ ] **UI-136** `[perf]`
      Zero pages use `next/image` (`<Image>` component). All images use external URLs passed to `<img>` or background CSS. `next/image` provides lazy loading, size optimisation, and format conversion (WebP/AVIF) for free.
      **Fix:** Migrate all `<img>` in page-level components to `<Image>` from `next/image`. Add `domains` config to `next.config.js` for Unsplash and other external hosts.

- [ ] **UI-137** `[perf]`
      Dashboard banner carousel uses Unsplash URLs directly (e.g., `https://images.unsplash.com/...?w=2071`). These large images load synchronously and block initial render.
      **Fix:** Use `next/image` with `priority={index === 0}` for the first slide and `loading="lazy"` for others.

- [ ] **UI-138** `[perf]`
      Inter font is loaded via Google Fonts in `_document.tsx`. The recommended approach for Next.js 13+ is `next/font/google` which self-hosts fonts and eliminates the extra DNS resolution and request to Google.
      **Fix:** Migrate to `import { Inter } from 'next/font/google'` and apply the font class to `<html>` in `_document.tsx`.

- [ ] **UI-139** `[perf]`
      `getDefaultSidebarSections()` creates a new array on every call with no memoisation. It is called 25+ times across pages/shells on every render.
      **Fix:** Use `useMemo(() => getDefaultSidebarSections(), [])` at each call site, or export a singleton constant.

- [ ] **UI-140** `[perf]`
      `getDefaultUser()` similarly creates a new object on every call — 16 pages affected.
      **Fix:** Export a `DEFAULT_USER` constant instead of a function.

- [ ] **UI-141** `[perf]`
      `apps/web/components/agent/AgentTransparency.tsx` and `apps/web/pages/automations/tower/[id].tsx` (TowerGraphCanvas) are heavy components that are included in the main bundle. They are only used in specific routes.
      **Fix:** Use `next/dynamic` with `{ ssr: false }` for both components to split them into separate chunks.

- [ ] **UI-142** `[perf]`
      `packages/ui/src/Arrow/Arrow.tsx` and `packages/ui/src/ProductCard/ProductCard.tsx` inject `<style>` tags at render time. Each mount creates a new `<style>` element, causing style duplication and Cumulative Layout Shift (CLS).
      **Fix:** Move CSS to module files or `globals.css`. Remove `<style>` injection from components.

- [ ] **UI-143** `[perf]`
      No `prefetch` strategy is used on any navigation link. `next/link` prefetches on hover by default, but `router.push` (used in most action handlers) does not prefetch.
      **Fix:** Use `router.prefetch('/courses')` in `useEffect` for commonly accessed next routes.

- [ ] **UI-144** `[perf]`
      `globals.css` loads 135+ CSS custom properties on every page including properties only relevant to specific contexts (e.g., `--lux-sidebar-*` properties loaded even on pages with no sidebar).
      **Fix:** Split `globals.css` into: `base.css` (tokens + resets), `sidebar.css`, `agent.css`, etc. Import only what each layout needs.

- [ ] **UI-145** `[perf]`
      The Apollo Client cache policy `fetchPolicy: 'cache-and-network'` is used on most data queries. This causes a double-fetch on every page load (cache read + network request). For stable data (courses, user list), `cache-first` is appropriate.
      **Fix:** Audit each query's `fetchPolicy`. Use `cache-first` for reference data; keep `cache-and-network` only for frequently updated data (orders, enrollments).

- [ ] **UI-146** `[perf]`
      No React `memo()` or `useMemo` is used on any list-rendering component in `apps/web/pages/`. Pages with large lists (users, orders, courses) re-render their entire list on any state change.
      **Fix:** Wrap row components in `React.memo`; memoize the filtered/sorted list with `useMemo`.

- [ ] **UI-147** `[perf]`
      `apps/web/pages/orders/index.tsx` calls three separate GraphQL queries (courses, users, enrollments) to construct order rows client-side. This is N+1 at the page level.
      **Fix:** Add a `orders(tenantId: ID!)` GraphQL query that returns pre-joined order data from the API.

- [ ] **UI-148** `[perf]`
      No Intersection Observer or virtualization is used for long lists. Pages with 100+ rows (users, orders) render all rows into the DOM simultaneously.
      **Fix:** Implement windowing with `react-virtual` or `@tanstack/react-virtual` for tables with > 50 rows.

- [ ] **UI-149** `[perf]`
      `apps/web/pages/automations/index.tsx` imports the full automation runner graph and trigger/action type definitions on the client, increasing the JS bundle for this page.
      **Fix:** Move trigger/action type resolution to the API; return only serialisable data to the client.

- [ ] **UI-150** `[perf]`
      `packages/ui/src/index.ts` exports every component in a single barrel file. Tree-shaking relies on build tooling being configured correctly, but side-effect-containing components (those with `<style>` injection — UI-58, UI-59) defeat tree-shaking.
      **Fix:** Mark the UI package `"sideEffects": false` in `package.json` after removing all inline `<style>` injections.

---

### Section 9 — Component API Design (UI-151 → UI-165)

- [ ] **UI-151** `[api]`
      `packages/ui/src/Select/Select.tsx` is not a generic component. The `onChange` callback receives `any`. All consumers must manually cast the value.
      **Fix:** Make `Select` generic: `Select<T extends string | number>` with `onChange: (value: T | T[]) => void`.

- [ ] **UI-152** `[api]`
      `packages/ui/src/InputWithLabel/InputWithLabel.tsx` is functionally identical to `<Input label="..." />`. The component adds no unique behaviour — it is a wrapper that could be replaced by a prop on `Input`.
      **Fix:** Add a `label?: string` prop directly to `Input`; deprecate and remove `InputWithLabel`.

- [ ] **UI-153** `[api]`
      `packages/ui/src/Form/Form.tsx` provides no form validation integration (no context, no `react-hook-form` compatibility, no schema). It is just a styled `<form>` wrapper that adds no value over native HTML.
      **Fix:** Either integrate with a validation library (`react-hook-form`) and provide a `FormContext`, or remove it and use native `<form>` elements.

- [ ] **UI-154** `[api]`
      `packages/ui/src/RegisterForm/RegisterForm.tsx` exposes `ADMIN` and `SUPER_ADMIN` as selectable role options in the role dropdown. Self-registration as ADMIN must never be permitted from the frontend.
      **Fix:** Remove `ADMIN` and `SUPER_ADMIN` from the role options; only expose `USER` / `STUDENT`. See security note in BA-24.

- [ ] **UI-155** `[api]`
      `packages/ui/src/LoginForm/LoginForm.tsx` accepts `defaultEmail` and `defaultPassword` props. Pre-populating the password field is a security anti-pattern.
      **Fix:** Remove `defaultPassword` prop entirely; remove any callers.

- [ ] **UI-156** `[api]`
      `packages/ui/src/Table/Table.tsx` has no pagination support. Callers must implement their own pagination outside the table, resulting in inconsistent pagination UIs across the app.
      **Fix:** Add optional `pagination: { page: number; pageSize: number; total: number; onPageChange: (p: number) => void }` prop.

- [ ] **UI-157** `[api]`
      `packages/ui/src/Card/Card.tsx` `imagePosition: 'left' | 'right'` values are accepted by the TypeScript type but the component only implements `'top'` and `'bottom'` layout in its render logic. Passing `'left'` or `'right'` silently falls back to `'top'`.
      **Fix:** Either implement side-image layouts, or remove `'left' | 'right'` from the union type.

- [ ] **UI-158** `[api]`
      `packages/ui/src/AdminDashboardLayout/` and `packages/ui/src/UserDashboardLayout/` are separate components exported from the index, but the distinction between when to use each is not documented.
      **Fix:** Add JSDoc comments on each; if they serve the same purpose, consolidate with a `userType: 'admin' | 'learner'` prop.

- [ ] **UI-159** `[api]`
      The `AppLayout` component (from `packages/ui/src/Layout/`) accepts `onSearch` but the search handler is never connected to a real search endpoint in any page. It is always either missing or wired to a no-op.
      **Fix:** Define the expected search behaviour contract; implement `GET /api/search` or a client-side Fuse.js search; wire `onSearch` in `_app.tsx`.

- [ ] **UI-160** `[api]`
      `packages/ui/src/NavBar/NavBar.tsx` accepts `showThemeToggle` and `onThemeToggle` props, but dark mode is not implemented in the CSS (`globals.css` has a `@media (prefers-color-scheme: dark)` block that maps some variables, but it is not wired to a user toggle).
      **Fix:** Either implement the dark mode toggle end-to-end (persist preference in `localStorage`, apply a `data-theme="dark"` attribute on `<html>`), or remove the `showThemeToggle` prop until it is ready.

- [ ] **UI-161** `[api]`
      `packages/ui/src/Logout/Logout.tsx` has a `showConfirmation` prop (default `true`) that shows "Are you sure?" — but the app's NavBar user menu calls the logout action directly via `onUserAction('logout')` bypassing this confirmation entirely.
      **Fix:** Ensure the NavBar logout flow goes through the `Logout` component's confirmation, or remove the confirmation-only component and handle it inline.

- [ ] **UI-162** `[api]`
      `packages/ui/src/Sidebar/Sidebar.tsx` accepts `onItemClick` but most pages also have `onNavigate` wired to `router.push`. There are two parallel navigation callback paths that can conflict.
      **Fix:** Standardise on one callback; remove the redundant one.

- [ ] **UI-163** `[api]`
      `packages/ui/src/GroupCard/GroupForm/GroupMemberList` components are exported from the UI library but the actual group management pages (`organization/groups`) do not use them — they use `DataListPage` directly with custom row rendering.
      **Fix:** Either use the exported group components in the pages, or remove them from the library if they are not referenced anywhere.

- [ ] **UI-164** `[api]`
      `packages/ui/src/BannerCarousel/BannerCarousel.tsx` `slides` prop items have a `backgroundColor` field, but the dashboard page passes slides with only `image` and `buttonText`. The mismatch means the `backgroundColor` fallback is always triggered.
      **Fix:** Align the `BannerSlide` type with the data shape used by the dashboard.

- [ ] **UI-165** `[api]`
      `packages/ui/src/Chip/Chip.tsx` and `packages/ui/src/Badge/Badge.tsx` are near-identical components (both render a styled pill with optional close button, icon, and label). Having both in the design system creates decision fatigue.
      **Fix:** Consolidate into a single `Tag` component with `variant` controlling size/weight; deprecate one.

---

### Section 10 — Accessibility (UI-166 → UI-180)

- [ ] **UI-166** `[a11y]`
      `packages/ui/src/ActionMenu/ActionMenu.tsx` trigger button shows `'···'` with no `aria-label`. Screen readers announce this as "button, middle dot middle dot middle dot".
      **Fix:** Add `aria-label="More actions"` to the trigger button.

- [ ] **UI-167** `[a11y]`
      `packages/ui/src/Carousel/Carousel.tsx` has no keyboard navigation (left/right arrow keys). Users who cannot use a pointer cannot advance slides.
      **Fix:** Add `onKeyDown` handler on the carousel container; handle `ArrowLeft`/`ArrowRight`/`Home`/`End`.

- [ ] **UI-168** `[a11y]`
      `packages/ui/src/BannerCarousel/BannerCarousel.tsx` autoplay does not pause when the user focuses an element inside the carousel (WCAG 2.1 success criterion 2.2.2).
      **Fix:** Pause autoplay on `focusin` event; resume on `focusout`.

- [ ] **UI-169** `[a11y]`
      `packages/ui/src/Modal/Modal.tsx` does not trap focus inside the modal when open. Tab-navigation escapes into the background content.
      **Fix:** Implement focus trap using `focus-trap-react` or a custom `useEffect` that constrains focus to modal children.

- [ ] **UI-170** `[a11y]`
      `packages/ui/src/Select/Select.tsx` custom dropdown is not keyboard-navigable. Users cannot open the dropdown, navigate options, or select with keyboard alone.
      **Fix:** Implement full keyboard navigation: `Enter`/`Space` to open, `Arrow` to navigate, `Enter` to select, `Escape` to close; add `role="listbox"` and `role="option"` ARIA roles.

- [ ] **UI-171** `[a11y]`
      `packages/ui/src/CountryLanguageDropdown/CountryLanguageDropdown.tsx` tab panels do not have `role="tab"` / `role="tabpanel"` / `aria-selected` attributes.
      **Fix:** Apply the ARIA tabs pattern to the Country/Language tab interface.

- [ ] **UI-172** `[a11y]`
      `packages/ui/src/Accordion/Accordion.tsx` toggle buttons do not have `aria-expanded` or `aria-controls` attributes. Screen readers cannot announce whether a section is open or closed.
      **Fix:** Add `aria-expanded={isOpen}` and `aria-controls={panelId}` to each trigger button; add `id={panelId}` and `role="region"` to each panel.

- [ ] **UI-173** `[a11y]`
      `packages/ui/src/Table/Table.tsx` has no `aria-sort` attribute on sortable column headers. Screen readers cannot announce the current sort direction.
      **Fix:** Add `aria-sort="ascending" | "descending" | "none"` to `<th>` elements based on current sort state.

- [ ] **UI-174** `[a11y]`
      No skip-to-main-content link exists in `_app.tsx` or any layout. Keyboard users must tab through the entire navigation on every page load.
      **Fix:** Add `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>` as the first element in the document body; add `id="main-content"` to the `<main>` element.

- [ ] **UI-175** `[a11y]`
      Form validation error states in `Checkbox`, `RadioGroup`, and `Switch` are displayed visually but are not announced via `aria-live` regions. Screen reader users may not notice that a validation error appeared.
      **Fix:** Add an `aria-live="polite"` region near each form field group that announces error messages.

- [ ] **UI-176** `[a11y]`
      `packages/ui/src/Snackbar/Snackbar.tsx` renders notifications without `role="alert"` or `aria-live="assertive"`. Screen readers will not announce toast messages.
      **Fix:** Add `role="alert"` to error/warning snackbars and `aria-live="polite"` to success/info snackbars.

- [ ] **UI-177** `[a11y]`
      `packages/ui/src/SearchBar/SearchBar.tsx` suggestions list has no `role="listbox"` / `role="option"` ARIA structure. The suggestion dropdown is not announced to screen readers.
      **Fix:** Apply the ARIA combobox pattern: `role="combobox"` on the input, `aria-expanded`, `role="listbox"` on the suggestions list.

- [ ] **UI-178** `[a11y]`
      All pages that use `AppLayout` render the sidebar landmark with no `<nav aria-label>`. If multiple `<nav>` elements exist on a page, they must be distinguished by label.
      **Fix:** Add `aria-label="Main navigation"` to the sidebar nav and `aria-label="Page navigation"` to any secondary nav.

- [ ] **UI-179** `[a11y]`
      Colour contrast between `var(--color-label-secondary)` text on `var(--color-bg-secondary)` background has not been verified against WCAG 2.1 AA (4.5:1 for normal text). Several card subtitles and table cell values use this pairing.
      **Fix:** Run a contrast audit using `axe-core` or browser DevTools; adjust token values if below 4.5:1.

- [ ] **UI-180** `[a11y]`
      `apps/web/pages/agent.tsx` and `pages/developer/index.tsx` use custom toggle switches (inline SVG/CSS) without `role="switch"` or `aria-checked`.
      **Fix:** Add `role="switch"` and `aria-checked={checked}` to all toggle controls; or replace with the `Switch` component from `@luxgen/ui`.

---

### Section 11 — Duplicate Components (UI-181 → UI-190)

- [ ] **UI-181** `[dup]`
      `packages/ui/src/BannerCarousel/` (exported) and `apps/web/components/BannerCarousel.tsx` (local) are two separate banner carousel implementations. The local version is simpler and may be what the dashboard page actually renders.
      **Fix:** Remove the local component; migrate its callers to the `@luxgen/ui` version.

- [ ] **UI-182** `[dup]`
      `packages/ui/src/ProductCard/ProductCard.tsx` (full-featured, tenant-themed) and `apps/web/components/store/ProductCard.tsx` (store-specific) are two separate product card components.
      **Fix:** Consolidate to the `@luxgen/ui` version with store-specific props; remove the local component.

- [ ] **UI-183** `[dup]`
      `packages/ui/src/Header/Header.tsx` (simple header with logo + menu) and `packages/ui/src/NavBar/NavBar.tsx` (full-featured with search, notifications, AI Studio) overlap in purpose. Both are exported from the index.
      **Fix:** Clarify the intended scope for each; deprecate `Header` if `NavBar` covers all use cases.

- [ ] **UI-184** `[dup]`
      `apps/web/components/storefront/LearnifyStorefront.tsx` and `apps/web/components/storefront/SimpleHomeWelcome.tsx` both appear to be landing-page templates. Only one should be active per tenant.
      **Fix:** Document which component is canonical for which tenant type; remove the unused one from the bundle via tree-shaking or conditional import.

- [ ] **UI-185** `[dup]`
      Email validation regex appears in both `packages/ui/src/LoginForm/LoginForm.tsx` and `packages/ui/src/RegisterForm/RegisterForm.tsx` as separate inline strings.
      **Fix:** Extract to a shared `validation.ts` utility; import in both forms.

- [ ] **UI-186** `[dup]`
      Password validation logic (minimum length check, error message) is duplicated in `LoginForm` (min 6 chars) and `RegisterForm` (min 8 chars). The inconsistency means a user can create an account with 8 chars but the backend might accept 6.
      **Fix:** Define a single `PASSWORD_MIN_LENGTH` constant in a shared package; enforce consistently.

- [ ] **UI-187** `[dup]`
      Social login button rendering is duplicated inside both `LoginForm` and `RegisterForm`. The same Google/LinkedIn/GitHub button array is built twice.
      **Fix:** Extract a `SocialLoginButtons` component shared by both forms.

- [ ] **UI-188** `[dup]`
      `packages/ui/src/UserManagement/` exports user management components. `apps/web/pages/organization/users.tsx` does not use them — it builds the user list via `DataListPage` with custom row rendering. The `UserManagement` library components appear unused.
      **Fix:** Either use the library components in the users page, or remove `UserManagement` from the package to reduce bundle size.

- [ ] **UI-189** `[dup]`
      `apps/web/components/common/PageStates.tsx` defines `PageLoadingState` and `PageEmptyState`. `packages/ui/src/NotFound/NotFound.tsx` provides similar empty-state UI. Two separate empty-state patterns coexist.
      **Fix:** Standardise on one; use `NotFound` from `@luxgen/ui` for all empty/error states.

- [ ] **UI-190** `[dup]`
      `packages/ui/src/context/UserContext.tsx` and `apps/web/lib/session.ts` both manage user state (localStorage-based). Any change to user data must be updated in both systems.
      **Fix:** Consolidate into a single `UserContext` that wraps `lib/session.ts`; remove the parallel system.

---

### Section 12 — Missing Connections & No-Op Wiring (UI-191 → UI-200)

- [ ] **UI-191** `[arch]`
      `NavBar` `onSearch` prop is never wired to a real search endpoint on any page. The search input fires events into a void.
      **Fix:** Implement `GET /api/search?q=&tenant=` and connect via `onSearch` in `_app.tsx` or each page.

- [ ] **UI-192** `[arch]`
      `NavBar` `notificationCount` is hardcoded to `3` on most pages. It never reflects real unread notifications.
      **Fix:** Implement `GET /api/notifications/unread-count` polled every 30s; pass the real count to `NavBar`.

- [ ] **UI-193** `[arch]`
      `NavBar` `onNotificationClick` is not wired to a notification list on any page. Clicking the bell icon has no effect on most pages.
      **Fix:** Implement a notifications dropdown panel (see BA-22).

- [ ] **UI-194** `[arch]`
      `NavBar` `showThemeToggle={false}` is set on every page. Dark mode is not implemented.
      **Fix:** Implement dark mode with `localStorage` persistence and `data-theme` attribute toggle; then enable `showThemeToggle` globally.

- [ ] **UI-195** `[arch]`
      `AppLayout`/`OrganizationShell` `onSearch` callback is defined but never connected to a search page. Pressing Enter in the NavBar search does nothing.
      **Fix:** On search submit, navigate to `/search?q={query}&tenant={tenant}` (page to be created).

- [ ] **UI-196** `[arch]`
      `Sidebar` `onUserAction` for `'logout'` fires `handleUserAction` which calls `router.push('/login')` but does NOT clear the Apollo Client cache. Cached data from the previous user's session can leak to the next login.
      **Fix:** Call `apolloClient.clearStore()` before redirecting on logout.

- [ ] **UI-197** `[arch]`
      `ProjectShell` `activeTab` (current/next iteration, priority, workflows) is not persisted between refreshes. Users are returned to the default tab on every page load.
      **Fix:** Persist the active project tab in the URL query string (`?tab=current`) or `localStorage`.

- [ ] **UI-198** `[arch]`
      `SettingsShell` navigation does not highlight the currently active settings section on initial page load (no `useRouter` to detect current path).
      **Fix:** Read `router.pathname` to determine the active nav item and apply an active style.

- [ ] **UI-199** `[arch]`
      `OrganizationShell` receives a `profileOpen` state managed inside the billing page (`organization/billing.tsx`) but this state is not used consistently across other organization pages. Profile/account settings access differs by page.
      **Fix:** Lift the `profileOpen` state to `OrganizationShell` and wire the profile action from `onUserAction`.

- [ ] **UI-200** `[arch]`
      `apps/web/pages/automations/index.tsx` fetches automation run history separately from automations themselves, using two `useQuery` calls that are not coordinated. If the first fails, the second still fires and displays partial data (runs for automations that may not have loaded).
      **Fix:** Use Apollo `useQuery` `skip` option on the runs query, gating it on successful automations load; or combine into a single `GET_AUTOMATIONS_WITH_RUNS` query.

---

### UI-Audit Progress Summary

| Section                                         | Items   | Done  |
| ----------------------------------------------- | ------- | ----- |
| Global Layout Architecture (UI-01–20)           | 20      | 0     |
| Responsive Design (UI-21–45)                    | 25      | 0     |
| Hardcoded Values / Tokens (UI-46–75)            | 30      | 4     |
| TypeScript & Type Safety (UI-76–95)             | 20      | 0     |
| Dead Code & Unused Props (UI-96–110)            | 15      | 0     |
| Missing States (UI-111–125)                     | 15      | 0     |
| SEO & Head Management (UI-126–135)              | 10      | 0     |
| Performance (UI-136–150)                        | 15      | 0     |
| Component API Design (UI-151–165)               | 15      | 0     |
| Accessibility (UI-166–180)                      | 15      | 0     |
| Duplicate Components (UI-181–190)               | 10      | 0     |
| No-Op Wiring / Missing Connections (UI-191–200) | 10      | 0     |
| **Total**                                       | **200** | **0** |

> Update Done column as items are completed. Priority order: Layout → Responsive → Hardcoded → TypeScript → Dead Code.

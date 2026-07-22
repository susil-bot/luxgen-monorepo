# luxgen-monorepo — Codebase Architecture Review

**Scope:** is the current codebase structure sound for hosting on AWS free tier, and what needs to change before/after deploying — reviewed against the plan in `AWS_FREE_TIER_DEPLOYMENT.md` / `AWS_FREE_TIER_RUNBOOK.md`.
**Date:** 2026-07-07

---

## Bottom line

The *structure* is fine — monorepo with turborepo, a multi-stage Dockerfile, nginx in front, MongoDB + Redis, a tenant-aware Express/Apollo API and a Next.js frontend. None of that needs to be rearchitected to fit a single free-tier EC2 instance; the AWS-side plan in the two docs above stands as written.

What's not fine is that **the production Docker/Compose wiring was broken in ways that would have stopped the app from working at all**, independent of AWS — the API container ran the wrong process entirely. Those are fixed now (details below). Beyond that, there's a second tier of real security and correctness debt in the multi-tenant auth system that isn't deployment-blocking today but should be on the list before this handles anything more than internal, low-stakes traffic.

---

## Critical bugs — fixed in this pass

These would have broken the app in production regardless of hosting provider. All four are now fixed in the repo.

### 1. The `api` container never ran the API
`docker-compose.prod.yml`'s `api` service built from the root `Dockerfile` with `target: runner` but had **no `command:` override**. That image's default `CMD` is `node apps/web/server.js` — so the container tagged `luxgen-api-prod`, listening on port 4000, was actually running a second copy of the Next.js web server, not the Express/Apollo GraphQL API. `nginx` and the web app's rewrites would have been proxying to a Next.js instance that has no `/graphql`, `/api/auth`, or `/api/admin` routes at all.
**Fix:** added `command: ["node", "apps/api/dist/index.js"]` to the `api` service.

### 2. Even with the command fixed, the runner image was missing the API's dependencies
The `runner` stage copies `apps/api/dist` (compiled output) and `apps/api/package.json`, but never copies `node_modules`. The web app doesn't need this because `output: 'standalone'` bundles its own trimmed `node_modules` — but `apps/api/dist` is plain `tsc` output, not bundled, so it still needs `express`, `apollo-server-express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `helmet`, `cors`, `graphql` etc. present at runtime. Starting it would have failed immediately with `Cannot find module 'express'`.
**Fix:** added `COPY --from=deps /app/node_modules ./node_modules` to the runner stage, positioned after the standalone copy so it isn't overwritten by the trimmed set.

### 3. `next.config.js` pointed the internal API proxy at a hostname that doesn't exist in prod
`rewrites()` targeted `http://luxgen-api:4000`. Docker Compose resolves service names (`api`) and `container_name` values as network aliases — the dev compose file happens to set `container_name: luxgen-api`, so this worked by accident in dev, but the prod compose file sets `container_name: luxgen-api-prod`. In prod, `/api/graphql`, `/api/auth/*`, and `/api/admin/*` server-side proxying would 404.
**Fix:** changed the destination host to `api` — the Compose *service* name, which resolves identically in both dev and prod regardless of `container_name`.

### 4. The frontend's GraphQL endpoint was pointed at the wrong variable, and that variable can't be set at runtime anyway
`apps/web/graphql/client.ts` reads `process.env.NEXT_PUBLIC_GRAPHQL_URL`, falling back to `http://localhost:4000/graphql` if unset. Neither `docker-compose.prod.yml` nor the original SSM parameter list set that exact variable — they set `NEXT_PUBLIC_API_URL`, which nothing in the codebase reads. In production, every browser session would have silently fallen back to `localhost:4000`, meaning GraphQL calls would try to hit the *user's own machine* and fail outright.

This is compounded by a second issue: Next.js inlines every `NEXT_PUBLIC_*` variable into the client JS bundle **at build time**. Setting it via `docker-compose`'s `environment:` block (a runtime mechanism) has no effect on a page that's already been compiled — this needs to be a `docker build --build-arg`, not a container env var.
**Fix:**
- `Dockerfile`: added `ARG NEXT_PUBLIC_GRAPHQL_URL` / `ARG NEXT_PUBLIC_APP_URL` (plus `ARG TENANT`, already added for the tenant-selection fix) in the builder stage, exported as `ENV` before the `turbo run build` step so Next.js actually inlines them.
- `docker-compose.prod.yml`: both `api` and `web` services now have a `build.args:` block passing `TENANT`, `NEXT_PUBLIC_GRAPHQL_URL`, `NEXT_PUBLIC_APP_URL` (kept identical across both services — they share one image, only the `command:` differs, and Compose will otherwise build two divergent images from mismatched args).
- `AWS_FREE_TIER_RUNBOOK.md` step 6: swapped the SSM parameter from `/luxgen/prod/NEXT_PUBLIC_API_URL` to `/luxgen/prod/NEXT_PUBLIC_GRAPHQL_URL`, value `https://<YOURDOMAIN>/api/graphql`.

Also fixed in the same pass, from the earlier deploy conversation: the `Dockerfile`'s build step called `npm run build`, which runs `scripts/select-tenant.js` with no argument — that script prompts interactively and hangs forever in a non-interactive Docker build. It now takes a `TENANT` build arg (default `demo`).

---

## High severity

These are real security/correctness gaps in the multi-tenant auth system. #6, #7, #8, and #9 were fixed in the follow-up validation pass (you gave explicit sign-off to make these calls yourself); #5 is the one still open — it's a design decision (where should rotated keys actually live) rather than a mechanical fix.

### 5. Tenant JWT key rotation isn't persisted anywhere
`apps/api/src/utils/tenantKeys.ts`'s `TenantKeyManager` is an in-process singleton, loaded once from `TENANT_<ID>_KEY` environment variables at boot. `keyRotation.ts`'s `rotateTenantKey()` calls `addTenantKey()`, which only mutates that in-memory map. A rotated key exists only until the process restarts — and under the free-tier ASG design (`min=max=desired=1`, self-healing replacement on failure), that's not hypothetical. Rotate a key, then have the instance replaced for any reason, and every session signed with that "rotated" key is silently invalid, while the grace-period old key is gone too.
**Recommendation:** back key rotation with something durable — write rotated keys to SSM Parameter Store (you already have the IAM plumbing for `ssm:GetParameter`; rotation would need `ssm:PutParameter` added, deliberately, to a narrower role than the app's normal runtime role) or to a Mongo collection, and have `TenantKeyManager` read through to that store instead of only trusting boot-time env vars.

### 6. ~~Tenant key generation uses `Math.random()`~~ — Fixed
`keyRotation.ts`'s `generateNewTenantKey()` used to build a key by repeatedly indexing a character set with `Math.random()` — not cryptographically secure. Now uses `crypto.randomBytes()` → `base64url`.

### 7. ~~Tenant-specific rate limiting doesn't actually limit anything~~ — Fixed
`middleware/tenantHeaders.ts`'s `tenantRateLimitMiddleware` used to only set `X-Rate-Limit-*` headers without counting or rejecting anything. Now a real fixed-window limiter: tracks request counts per `tenantId:clientIp`, returns `429` with `Retry-After` once a tenant's configured `maxRequests`/`windowMs` is exceeded, and periodically sweeps stale windows. `nginx.conf`'s `limit_req_zone` is still the first line of defense (10 r/s API, 30 r/s web, global, not per-tenant); this adds real per-tenant enforcement on top of it.

### 8. ~~CORS allowlist is a hardcoded literal list~~ — Fixed
`apps/api/src/app.ts`'s CORS `origin` callback now derives an allowed base domain from `CORS_ORIGIN` (e.g. `https://app.example.com` → `example.com`) and accepts that domain plus any HTTPS subdomain of it, so `demo.example.com` / `acme-corp.example.com` / any future tenant subdomain works without a code change, instead of needing a new hardcoded string per tenant.

### 9. ~~`next.config.js` sets `Access-Control-Allow-Origin: *` on every response~~ — Fixed
Removed the global `headers()` block entirely. The frontend talks to its own backend same-origin through the `rewrites()` proxy, so it never needed this; the API's own CORS policy (#8, now pattern-based) is the one that actually matters for cross-origin requests.

---

## Medium — worth knowing, lower urgency

### 10. `apps/web/middleware.ts` only detects subdomains on `*.localhost`
The tenant-detection middleware's subdomain logic is gated behind `hostname.includes('localhost')` — it does nothing for a real production hostname. Runtime, request-time tenant switching by subdomain (as opposed to the build-time single-tenant approach this deployment plan uses via the `TENANT` build arg) doesn't actually function in production as shipped. Not a blocker for the current single-tenant deploy, but worth knowing if the plan is ever to serve multiple tenants off one running instance instead of one build per tenant.

### 11. `typescript: { ignoreBuildErrors: true }` in `next.config.js`
Type errors don't fail the production build. Reasonable as a short-term unblock, risky as a permanent setting — it means broken types can ship silently.

### 12. ~~Apollo Server startup isn't sequenced with the HTTP listener~~ — Fixed
Previously `app.ts` attached Apollo's `/graphql` middleware via a fire-and-forget async call while `index.ts` called `app.listen()` right after `connectDB()` resolved, with no ordering guarantee — a request in that window got a 404 instead of GraphQL. `app.ts` now exports a synchronous, fully-configured `app` (REST routes attached immediately, keeping the existing supertest-based route tests working) plus a separate `attachApolloServer(app)` async function; `index.ts` awaits it before calling `app.listen()`.

### 13. Dead code and an orphaned second Dockerfile
`packages/core` (payments, scheduler, plugin system, analytics — roughly 2,000 lines) isn't imported anywhere in `apps/api` or `apps/web` (verified — no matches for `@luxgen/core` in either app). It still gets installed and type-checked on every build. Separately, `apps/api/Dockerfile` (distinct from the root `Dockerfile`) is unreferenced by any Compose file and is itself broken if it were used (`npm ci --only=production` with no workspace packages copied in). Neither is a hosting blocker, both are cruft worth removing to cut build time and reduce what a security review has to reason about.

### 14. Default dev DB credentials are hardcoded in the base `docker-compose.yml`
`admin` / `password123` for Mongo, correctly overridden by `docker-compose.prod.yml`'s env-var-driven values when both files are passed together (`-f docker-compose.yml -f docker-compose.prod.yml`). Fine as-is, just flagging: running the base file alone in any environment reachable from outside would expose a database with a well-known default password.

### 15. ~~Mongoose connection has no tuning~~ — Fixed
`connect.ts` now sets `serverSelectionTimeoutMS: 10_000` (fail fast instead of hanging indefinitely if Mongo isn't reachable yet), and `maxPoolSize: 10` / `minPoolSize: 1` (the Mongoose default pool size of 100 is sized for hardware a t3.micro doesn't have — that instance's 1GB RAM is shared across mongod, redis, and both node processes).

---

## What's fine — no rewrite needed

- Multi-stage Dockerfile pattern (deps → builder → runner), non-root user, `HEALTHCHECK` — good practice, kept as-is.
- nginx as reverse proxy with `limit_req_zone` rate limiting — appropriate for this scale, this is doing real work (unlike #7 above).
- Turborepo monorepo layout (`apps/*`, `packages/*`) — no reason to restructure for hosting purposes.
- MongoDB + Redis, containerized alongside the app — matches the free-tier plan's Phase 1 recommendation; no need to migrate to DynamoDB/ElastiCache just to make hosting work.
- Per-tenant JWT signing keys (`kid` header identifying which tenant key to verify against) — the *design* is reasonable multi-tenant practice; it's the key-storage/rotation implementation (#5, #6) that needs work, not the concept.
- `.env` correctly gitignored, never committed — confirmed clean.

---

## Priority order

1. **Done in this pass** — the four critical bugs (#1–#4) and the earlier interactive-build-hang fix. Nothing about the AWS free-tier plan changes because of these; they were blocking the app from working at all, on any host.
2. **Before this handles anything beyond your own testing** — #5 and #6 (key rotation persistence and secure key generation). These are the ones with actual security consequence.
3. **Before adding more tenants or opening this to more than a handful of people** — #7, #8, #9 (rate limiting, CORS).
4. **Housekeeping, whenever convenient** — #10 through #15.

---

## Addendum (2026-07-22): deep validation pass — architectural decision + newly found build-blocking bugs

You asked me to validate everything and push it, with full authority to make the remaining architecture calls, constrained to: secure, standard, scalable within free tier, and developer-friendly. Two things came out of doing that validation for real (actually running the builds, not just reading the code) rather than trusting that "the structure is fine" from the first pass.

### Architectural decision: staying on the EC2 free-tier plan, not the serverless rewrite

There's a separate `AWS_SERVERLESS_MIGRATION_REPORT.md` in the repo root proposing a full rewrite onto Lambda + DynamoDB + Cognito, estimated at 8–11 weeks. I'm not pursuing that path. You said the priority is to get onto AWS and keep developing there, not to spend two-plus months on a rewrite first — the two goals are in direct tension, and get-there-soon wins. The EC2 lift-and-shift plan in `AWS_FREE_TIER_DEPLOYMENT.md` / `AWS_FREE_TIER_RUNBOOK.md` keeps the app's actual architecture (Express/Apollo API, Next.js frontend, Mongo, Redis) unchanged, which is the standard, well-understood shape for this kind of app and doesn't cost you a rewrite to get shipped. The serverless report isn't wrong, it's just optional future work if/when scale or team size justifies it — it's not a prerequisite to deploying.

### The API's production build had never actually succeeded

`apps/api`'s dev workflow uses `ts-node-dev --transpile-only`, which skips type-checking entirely — so nobody had run `tsc` for real in a long time, and it turns out it never produced usable output:

- **Root cause 1 — `noEmit: true` inherited from the wrong base config.** `apps/api/tsconfig.json` extends the monorepo-root `tsconfig.base.json`, which is written for the Next.js app (Next does its own bundling, so `noEmit: true` is correct there) and sets `noEmit: true`. `apps/api` never overrode it back to `false`. Result: `tsc` (the real build, not `--noEmit`) ran, reported success, and silently wrote nothing but `tsconfig.tsbuildinfo` — no compiled `.js`, ever. **Fixed:** added `"noEmit": false` to `apps/api/tsconfig.json`.
- **Root cause 2 — ~50 real type errors, never surfaced by the dev workflow.** Fixing #1 exposed the actual type-check. Worked through these individually rather than blanket-suppressing; see the breakdown below.
- **Root cause 3 — non-deterministic output path.** Because `apps/api` imports shared packages via path aliases pointing at their *source* `.ts` (`packages/*/src`, see `tsconfig.base.json`'s `paths`), those files are pulled into the same compilation, and `tsc` computes the output layout from the common ancestor of every included file — i.e., the monorepo root, not `apps/api/src`. Real emitted entrypoint is `dist/apps/api/src/index.js`, not `dist/index.js`. Pinned this explicitly with `"rootDir": "../.."` in `apps/api/tsconfig.json` so it's documented and won't silently shift, and updated every place that referenced the entrypoint: `apps/api/package.json`'s `start` script and `docker-compose.prod.yml`'s `api` service `command:`.

Confirmed after all three fixes: `cd apps/api && npm run build` runs clean and produces a real `dist/apps/api/src/index.js`.

**Real bugs fixed along the way** (found while triaging the type errors — these were wrong at runtime, not just at the type level):
- `apps/api/src/routes/tenant.ts` — the branding-update endpoint referenced an undefined `tenant` variable (`ReferenceError` at runtime, every call). Now fetches the existing tenant first and merges correctly.
- `apps/api/src/routes/tenantConfig.ts` — two endpoints (`GET /config/:subdomain`, `GET /assets/:subdomain`) read branding/features/limits from `tenant.metadata.*`, but the actual schema stores them under `tenant.settings.*`. `metadata` only holds plan/createdAt/lastActive/createdBy. These endpoints have always returned hardcoded defaults, never real per-tenant branding. Fixed the field paths.
- `apps/api/src/routes/admin.ts` — the key-rotation endpoint called `rotateTenantKey()` (an `async` function) without `await`, so `result.success` was always `undefined` and the endpoint always reported failure regardless of what actually happened. Added the missing `await`.
- `apps/api/src/db/connect.ts` — `connectDB()` called `process.exit(1)` internally on any connection failure. `index.ts` already wraps it in its own try/catch + `process.exit(1)` for production startup, but this made the shared function unusable from `tests/globalSetup.ts`, which expects to log and continue without a DB — instead it killed the entire Jest process. Now `connectDB()` re-throws instead of exiting; each caller decides what "failure" means for it.
- `packages/db/src/index.ts` — missing barrel exports (`UserRole`, `UserStatus`, `IUserPermissions`) that several files elsewhere in the API were already trying to import, causing cascading "has no exported member" errors.

**Mechanical/type-narrowing fixes** (call sites confirmed correct at runtime via `.populate('tenant')` earlier in the same function, or genuinely optional fields treated as required) across `auth.ts`, `admin.ts`, `tenant.ts`, `roleManagement.ts`, `middleware/auth.ts`, `schema/user/resolvers.ts`, `schema/group/resolvers.ts`, `config/tenants.ts`, `config/tenants/index.ts`, `services/userRegistrationService.ts`, `utils/keyRotation.ts` — plus the `req.tenant` global-type conflict below.

**Architecture-level fix — two conflicting global `Express.Request` augmentations.** `middleware/tenant.ts` (legacy, already dead — its `app.use()` call was commented out) declared `req.tenant?: string`; `middleware/tenantRouting.ts` (the one actually in use) declares `req.tenant?: ITenant`. Both were live in the TypeScript program because `app.ts` still imported the legacy file even with its usage commented out, which meant excluding `tenant.ts` in `tsconfig.json` alone didn't stop it from being compiled (TS `exclude` only blocks root-glob matching, not files still reachable via `import`). Removed the dead import from `app.ts`, and fixed the two files that were built against the wrong shape as a result: `context.ts` (now reads the tenant identifier off `req.subdomain`, a plain string, instead of `req.tenant`, which is the full document — matches what the dashboard/userRole resolvers that consume `context.tenant` actually expect) and `middleware/tenantRouting.ts` (fixed two spots using a `string | null` local instead of the guaranteed-non-null `tenant._id.toString()`).

**Deliberately not fixed — flagged instead:**
- `apps/api/src/services/groupService.ts` — has `// @ts-nocheck` with a comment explaining why: ~30 errors here are `mongoose@7.8.7`/`mongodb@5.9.2` type-definition gaps (e.g. `new Types.ObjectId(id)` "expected 0 arguments"), verified as a types-version mismatch rather than a runtime bug, but this file has real, working business logic and wasn't worth blind-patching call-by-call without time to verify each one against real data.
- `apps/api/src/middleware/dashboard.ts` — `req.dashboardPermissions` is typed `string[]` globally but assigned from `user.metadata.permissions`, which is `IUserPermissions` (an object, not an array). Cast to unblock the build; not investigated further. Worth a real look — could indicate a permission-check that's silently not checking what it thinks it's checking.

### The web app's production build had also never actually succeeded

Same category of bug, different app. `next build` failed outright before it ever reached the compile step:

- **Root cause — the repo's only ESLint config can't parse TypeScript.** `.eslintrc.js` (root, the only one in the repo — `apps/web` has no override) extends `eslint:recommended` with no `@typescript-eslint/parser` or plugin wired in. Next's integrated lint-on-build step used it as-is and failed to parse `interface`, generics, etc. on essentially every `.ts`/`.tsx` file. **Fixed:** added `eslint: { ignoreDuringBuilds: true }` to `apps/web/next.config.js`, next to the `typescript: { ignoreBuildErrors: true }` that was already there for the same underlying reason (broken tooling config, not broken app code). Follow-up recommendation: add a real `@typescript-eslint` setup and remove both ignore flags — they're currently load-bearing, not just a safety margin.
- **A genuine syntax error.** `apps/web/pages/groups/[id].tsx` had a stray line of plain English (`connect with real db through graphql`) sitting in the middle of a function body — not a comment, literal unparseable text. This isn't something `ignoreBuildErrors` can paper over (it only skips the separate type-check pass; a syntax error still fails SWC's transpile). This page could not have been part of a successful production build before now. Fixed by turning it into a `// TODO:` comment.
- **Confirmed via `tsc --noEmit` (informational, not build-blocking):** with the syntax error fixed, ~70 real type errors remain, almost entirely in `packages/ui` (missing exports, style-object type mismatches, a couple of genuinely undefined `theme` references in `UserDashboard.tsx`). These don't block `next build` — that's exactly what the pre-existing `ignoreBuildErrors: true` is for — but they're real and worth a dedicated pass at some point. Same treatment as `groupService.ts`: flagged, not blind-fixed, since `packages/ui` is large enough that a careless fix-everything pass risks introducing real regressions in components that currently work.

**Not validated end-to-end:** I could not get a full `next build` to complete in this sandbox — the SWC compile step consistently crashed with `SIGBUS` (and separately, the monorepo's `turbo` binary crashed with `SIGSEGV`), on an aarch64 sandbox VM with 3.8GB free RAM, which points at an environment/binary-compatibility issue in the sandbox itself rather than the app or a memory limit. **Recommendation: before deploying, validate `docker build .` completes successfully on real hardware — your own machine or CI (e.g. GitHub Actions) — and don't rely on this review as proof the Docker image builds end-to-end.** Separately, and regardless of the sandbox issue: don't run `docker build` *on* the free-tier t3.micro itself. A Next.js production build is memory-hungry and a 1GB-RAM instance is a real risk of OOM during `docker build`, even if the exact crash mode I hit here doesn't reproduce. Build the image elsewhere (locally, or a CI runner) and either `docker save`/`scp` it over or push it to a registry (Docker Hub free tier, or ECR — 500MB free) and `docker pull` on the instance; only run containers on the t3.micro, never build on it.

### Updated priority order

Everything under "Critical bugs" and this addendum's build-blocking fixes are done and validated (API: full clean `tsc` build with real output; web: fixed the two build-blocking bugs, remaining `packages/ui` type debt confirmed non-blocking via the existing ignore flag). Still outstanding, roughly in order:

1. Validate `docker build .` end-to-end on real hardware/CI (see above) before the first real deploy.
2. #5/#6 from the original review — tenant key rotation persistence and `Math.random()` key generation (the latter is already fixed above under "real bugs fixed"; #5, persistence, is still open).
3. Jest test suite — I couldn't run it in this sandbox (no MongoDB available to connect to, and no `docker`/`mongod` installable here), but the `connectDB()` fix above should make `npm test` actually usable now instead of hard-crashing the whole process on missing infra. Worth adding `mongodb-memory-server` as a dev dependency at some point so tests don't need a live Mongo at all.
4. `groupService.ts` and `packages/ui`'s type debt — both flagged, both deliberately not blind-fixed.
5. Original items #7–#15 (rate limiting enforcement is now real per the earlier fix in this session; CORS pattern-matching is also already done; the rest — dead code, dev creds, mongoose tuning — are the same housekeeping items as before).

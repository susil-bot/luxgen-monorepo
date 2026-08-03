# LuxGen API — Production Deployment Plan

**Status: PLANNING ONLY. No deployment, no configuration changes, no infrastructure has been touched.**
This is a roadmap for review and approval. Every command below is to be run by you (or by me, one step at a time, after you say go) — nothing here has been executed against production.

Scope: `apps/api` (the backend). Confirmed with you before writing this:
- First production deployment (nothing live yet).
- Standardize on **Node 20 + compiled JS (tsc)** — not the tsx-runtime path.
- MongoDB Atlas already provisioned; Redis (Upstash) not yet — include setup.
- You have a domain ready to point at the API.

---

## 1. Project analysis

| Item | Finding |
|---|---|
| Backend framework | Express 4, with Apollo Server 3 (`apollo-server-express`) mounted for GraphQL at `/graphql`, plus ~30 hand-written REST routes under `/api/*`. Not NestJS/Fastify/Next API routes. |
| Node.js version | **Inconsistent today** — root `package.json` only floors it at `>=18.0.0`; two Dockerfiles build on `node:18-alpine`; a third Dockerfile (the one wired into `deploy/platforms/render.yaml`) and all-but-one GitHub Actions workflow use Node 20. **This plan standardizes everything on Node 20 LTS** (see §2 for the exact fix list). |
| Package manager | npm. `package-lock.json` at repo root, `lockfileVersion: 3` (needs npm ≥ 7; Node 20 ships npm 10, so this is fine). No yarn/pnpm lockfiles anywhere in the repo. |
| Database | MongoDB via Mongoose 7.5 (`packages/db`). Single shared database, tenant-scoped by a required `tenant` field + compound indexes — not per-tenant databases. |
| ORM | Mongoose (schema-first ODM, not a full ORM). No Prisma/TypeORM/Drizzle. No formal migration tool — see §4. |
| Auth | JWT access tokens (per-tenant signing key) + httpOnly refresh-token cookie. Same token-issuing code shared by REST (`/api/auth/*`) and GraphQL login/register mutations. |
| Env vars required | See the full table in §2 — 2 are hard-enforced at startup (`JWT_SECRET`, `MONGODB_URI`), everything else degrades gracefully but several **must** be set for correct production behavior. |
| Third-party integrations | Stripe (billing + webhook), SendGrid (transactional email, optional — defaults to a console-log stub if unset), Ollama (AI/agent features, out of scope for this backend deployment), cron-job.org (external cron caller for a reminder job). |
| Build process | `npm run build` → `node scripts/build-tolerant.js`, a `tsc` wrapper that currently tolerates up to **43 pre-existing TypeScript errors** on `apps/api` (tracked debt, documented in the script's own header comment) without failing the build. `build:strict` runs plain `tsc` with no tolerance, for reference. |
| Start command | `node dist/apps/api/src/index.js` (after `npm run build`). |
| Folder structure | `apps/api/src/{app.ts, index.ts, config/, context.ts, db/, docs/, graphql/, lib/, middleware/, notifications/, routes/, schema/, scripts/, services/, tests/, types/, utils/}`. `app.ts` wires Express + Apollo + WebSocket subscriptions; `index.ts` is the process entrypoint (env check → DB connect → seed-if-dev → listen). |

---

## 2. Deployment readiness audit

### 2.1 The one env var that matters most

`NODE_ENV=production` is unusually load-bearing in this codebase — three separate behaviors key off it directly:
1. Auto-seeding of demo data is **hard-disabled** only when `NODE_ENV === 'production'` (`apps/api/src/index.ts:29`).
2. Login rate limiting defaults to 10 attempts/15min in production vs. 1000 in any other env (`middleware/loginRateLimit.ts`).
3. Error responses omit stack traces only when `NODE_ENV === 'production'` (`utils/errorHandler.ts`).

**Action: `NODE_ENV=production` must be set explicitly on the hosting platform — do not rely on a default.**

### 2.2 Full environment variable inventory

| Variable | Required? | Production value to set |
|---|---|---|
| `NODE_ENV` | Enforced by behavior, not startup check | `production` |
| `PORT` | Platform-provided | Leave as platform default (Render sets this) |
| `LOG_LEVEL` | Optional | `info` |
| `JSON_LOGS` | Optional (new recommendation) | `true` — structured logs are easier to search on a hosted platform's log viewer |
| `MONGODB_URI` | **Required — startup fails without it** | Atlas SRV string, `readWrite`-scoped user, own database (not `admin`) |
| `REDIS_URL` | Optional, but recommended | Upstash `rediss://...` — see §4 |
| `JWT_SECRET` | **Required — startup fails without it** | 32+ random chars, generated fresh for prod, never reused from dev |
| `JWT_REFRESH_SECRET` | Optional (falls back to `JWT_SECRET`) | **Set explicitly, different value from `JWT_SECRET`** — defense in depth |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Optional | Defaults (`7d`/`30d`) are reasonable, keep unless you have a reason to change |
| `LOGIN_RATE_LIMIT_MAX` / `_WINDOW_MS` | Optional | Leave unset — production default (10/15min) is already sane |
| `SEED_IF_EMPTY` | Optional | Leave unset — irrelevant once `NODE_ENV=production` (seeding is hard-blocked regardless) |
| `TENANT_<SUBDOMAIN>_KEY` (one per active tenant, e.g. `TENANT_DEMO_KEY`) | **Required per tenant you run** | 32+ random chars each, distinct per tenant |
| `TENANT_KEY_GRACE_HOURS` | Optional | Default (24) is fine |
| `CORS_ORIGIN` / `CORS_ORIGINS` | **Required** | Your real production web origin(s), e.g. `https://luxgen.shop,https://demo.luxgen.shop` |
| `APP_DOMAIN` | **Required** | Your real base domain |
| `TENANT_SUBDOMAINS` | **Required** | Comma-separated active tenant subdomains |
| `APOLLO_INTROSPECTION` | **Required, must be `false`** | `false` — leaving this unset already defaults safe, but set it explicitly so it can't be flipped by accident |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Required if billing is live | Live (not test) keys once you're ready to charge real cards |
| `STRIPE_PRICE_STARTER/PRO/BUSINESS/LISTING` | Required if billing is live | Live Stripe price IDs |
| `BILLING_DEV_MODE` | **Required, must be `false`** | `false` — leaving this `true` in prod means upgrades are simulated, not charged |
| `WEB_APP_URL` | **Required** | Your real production web app URL |
| `EMAIL_PROVIDER` | **Required if you want real emails sent** | `sendgrid` — see 2.4, this is a launch blocker if skipped |
| `SENDGRID_API_KEY` / `EMAIL_FROM` | Required if `EMAIL_PROVIDER=sendgrid` | Your SendGrid credentials |
| `JOBS_API_KEY` | Required if using the cron reminder endpoint | Random shared secret, given to cron-job.org as a header |
| `API_URL` / `GRAPHQL_URL` | **Required** | Your real production API URL |
| `OLLAMA_HOST` | Not applicable | AI/agent feature, out of scope for this backend deployment |

### 2.3 Secrets that must never be committed

`JWT_SECRET`, `JWT_REFRESH_SECRET`, every `TENANT_<SUBDOMAIN>_KEY`, `MONGODB_URI`, `REDIS_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SENDGRID_API_KEY`, `JOBS_API_KEY`.

Verified: `.gitignore` already covers `.env`, `.env.local`, `.env.production`, etc. at multiple levels, and neither `.env` nor `apps/api/.env` is currently tracked by git. Good — no cleanup needed here, just discipline going forward (set these only as platform environment variables, never in a committed file).

### 2.4 Gaps found — ranked by severity

**Launch-blocking if not addressed:**
1. **No real email delivery by default.** `EMAIL_PROVIDER` defaults to `log` (`apps/api/src/utils/email.ts`) — password resets, invites, and verification emails silently become log lines instead of real emails unless you explicitly set `EMAIL_PROVIDER=sendgrid` + `SENDGRID_API_KEY` + `EMAIL_FROM`. Users will not receive password resets otherwise.
2. **Three inconsistent Dockerfiles / Node versions.** You've chosen Node 20 + compiled JS — this plan's Phase 1 includes reconciling this (pin `engines` to Node 20, align both Dockerfiles, retire the third, fix the one GitHub Actions workflow still pinned to Node 18).
3. **MongoDB Atlas free tier (M0) has no automated backups.** Real user data with no backup is a data-loss risk from day one — see §4 and §9.

**Should fix before or shortly after launch:**
4. Stripe client getters (`enrollmentService.ts`, `listingSubscriptionService.ts`, `usageService.ts`) call `new Stripe(process.env.STRIPE_SECRET_KEY!)` with a non-null assertion. If `STRIPE_SECRET_KEY` is ever unset in production, these throw an unhandled TypeError instead of a clean error. Low risk if you always set the key, but worth a defensive guard.
5. Tenant config references an `emailProvider: 'mailgun'` option (`apps/api/src/config/tenants/index.ts`) that has no actual implementation — `email.ts` only implements `log` and `sendgrid`. If any tenant is ever configured for `mailgun`, it silently falls back to the log stub. Not a risk today (no tenant uses it), but worth removing the dead option or implementing it.
6. `helmet()` runs with fully default config globally; a *separate*, more complete CSP is applied by `tenantSecurityHeadersMiddleware` — but only after tenant resolution succeeds. Public pre-tenant routes (`/health`, `/api-docs`, `/api/tenant-config/*`) get only helmet's defaults. Low risk (these aren't sensitive HTML pages users log into), but worth knowing.

**Nice-to-have improvements:**
7. Logging is a hand-rolled console wrapper (`utils/logger.ts`) with level filtering and optional JSON mode (`JSON_LOGS=true`) — no PII/secret redaction built in. Recommend `JSON_LOGS=true` in prod for searchability, and a periodic grep of logger call sites for anything sensitive being passed as `meta`.
8. Rate limiting (login + per-tenant) falls back to an in-memory, per-process store if Redis is unavailable. Fine for a single instance (which is what you're starting with); becomes inconsistent the moment you run more than one instance. Provisioning Upstash now (per your answer) avoids this from day one.
9. CI does not currently gate merges on test results — every test step across `ci.yml` and `deploy-api.yml` uses `continue-on-error: true`. Not fixed by this plan (out of scope), but flagged since it affects how much you can trust a green checkmark.

---

## 3. Infrastructure recommendation

| Platform | Pros | Cons |
|---|---|---|
| **Render (recommended)** | Free tier already the documented target for this project; `render.yaml` Blueprint auto-deploys on git push; free, auto-renewing SSL + custom domain support built in; zero server management; Docker-native (matches your existing Dockerfiles) | Free tier spins down after 15 min idle (cold start on next request); 750 hrs/mo cap; single region on free tier |
| AWS ECS (Fargate) | Real auto-scaling, no cold starts, fine-grained control, integrates with the AWS path already partially documented in this repo (`AWS_SERVERLESS_MIGRATION_REPORT.md`) | No free tier at meaningful scale; real ops overhead (task defs, ALB, VPC, IAM) — a lot for a solo/small team; slower iteration loop |
| AWS EC2 | Full control, can be made free-tier eligible (t2/t3.micro, 12 months) | You own the entire box: OS patching, process supervision, TLS renewal, security groups — this is exactly the ops burden a solo dev should avoid right now |
| Railway | Very similar developer experience to Render, good free tier historically | Free tier has shifted to trial-credit-based rather than a persistent free plan; less proven for MongoDB-heavy Node APIs in this repo's own documentation |
| Fly.io | No cold-start free tier (always-on machines), good global edge story, has a documented fallback path in this repo (`deploy/platforms/fly.api.toml` already exists) | Free allowance is usage-based and smaller than Render's; slightly more CLI/config overhead (`fly.toml`, volumes) for a first deployment |
| DigitalOcean (Droplet or App Platform) | Predictable flat pricing, well-documented, App Platform is Render-like | No free tier at all (cheapest is a paid Droplet/App); for a $0-budget first launch this is a non-starter until revenue exists |
| Docker VPS (any provider) | Maximum control, cheapest at scale | Full ops burden (same as EC2) — reverse proxy, TLS, process supervision, monitoring all become your job; wrong trade-off for a 1-2 person team's first production deploy |

**Recommendation: Render.** This repo already has purpose-built tooling for it (`Dockerfile.api` exists specifically because Render can't target a stage in a multi-stage Dockerfile; two `render.yaml` Blueprints already exist), it matches the free-tier budget, and it eliminates the operational surface (TLS, reverse proxy, process supervision, zero-downtime redeploys) that would otherwise fall entirely on you. Fly.io is the credible fallback if Render's cold starts become a real problem later — its config already exists in `deploy/platforms/fly.api.toml`.

**Fix needed before deploying (per your Node 20 decision):** the repo currently has two `render.yaml` files (root, and `deploy/platforms/render.yaml`) pointing at two *different* Dockerfiles with different Node versions. This plan picks **one canonical pair — root `render.yaml` + `Dockerfile.api`, bumped to Node 20 with the `tsc`-compiled build** — and retires the other (`deploy/platforms/render.yaml` + `apps/api/Dockerfile`, the Node-20-but-`tsx`-runtime path) to avoid future drift. See Phase 1.

---

## 4. Database deployment

- **Hosting:** MongoDB Atlas (already provisioned per your answer). Start on the free M0 tier since you're pre-launch; plan to upgrade once real user data exists (see backups below).
- **Connection strategy:** `mongodb+srv://` connection string as the `MONGODB_URI` secret on Render. Create a **dedicated database user** scoped to `readWrite` on your production database only — not an admin/root user. Under Atlas Network Access, since Render's free/starter tiers don't provide a static outbound IP, use **"Allow Access from Anywhere" (0.0.0.0/0)** combined with a strong, unique, randomly-generated password — this is the standard trade-off for PaaS-hosted apps without a static egress IP. Revisit if you later move to a plan with a fixed IP.
- **Migrations:** There is no formal migration tool in this codebase — Mongoose is schema-first with no `migrations/` folder anywhere. In practice, schema changes here have been additive (new optional fields). For any real breaking change, follow the existing pattern already in the repo (`apps/api/src/scripts/backfill-course-commerce.ts`): write a one-off script, run it manually once after deploy, document what it did. If the team wants formal tracked migrations later, `migrate-mongo` is the standard free/open-source choice — not needed for this first deployment.
- **Backup strategy:** **Atlas M0 has no automated backups — this is a real gap.** Two options, not mutually exclusive:
  1. Upgrade to Atlas M2/M5 (a few dollars/month) once you have real user data — these tiers include continuous cloud backups.
  2. In the meantime, schedule a periodic `mongodump` export (e.g. a small script triggered by the same cron-job.org pattern already used for the listing-reminders job) writing to cheap object storage. Treat this as an interim measure, not a permanent one.
- **Connection pooling:** Already configured sanely in `packages/db/src/connection.ts` — `maxPoolSize: 20`, `serverSelectionTimeoutMS: 10_000`, `socketTimeoutMS: 45_000`. Note this pool is per-process: total connections = `maxPoolSize × running instances`. At a single Render instance, that's a max of 20 — comfortably under Atlas M0's connection ceiling.
- **Security recommendations:** dedicated non-admin DB user; strong generated password (not reused anywhere else); TLS enforced by default on `mongodb+srv://` connections (nothing to configure); rotate the DB password if it's ever exposed in a log or shared insecurely; revisit the Network Access allowlist if you move to a platform with a static IP.

---

## 5. Deployment checklist

- [ ] All required env vars from §2.2 set on Render (not in any committed file)
- [ ] `NODE_ENV=production` explicitly set
- [ ] `APOLLO_INTROSPECTION=false` and `BILLING_DEV_MODE=false` explicitly set
- [ ] `EMAIL_PROVIDER=sendgrid` + valid `SENDGRID_API_KEY`/`EMAIL_FROM` set (or a conscious decision to launch without real email, documented)
- [ ] Distinct `JWT_SECRET` and `JWT_REFRESH_SECRET` generated fresh for production
- [ ] One `TENANT_<SUBDOMAIN>_KEY` set per tenant you're actually running
- [ ] `npm run build` (the tolerant build) succeeds locally against the Node-20-pinned toolchain before pushing
- [ ] `npm run build:strict` run once for visibility — confirm the new error count vs. the tracked baseline of 43 hasn't grown for reasons unrelated to the Node bump
- [ ] MongoDB Atlas: dedicated prod DB user created, Network Access allowlist set, connection string tested from a local shell
- [ ] Upstash Redis: instance created, `REDIS_URL` tested
- [ ] No database migrations needed for this first deploy (fresh database) — confirmed N/A for launch
- [ ] `/health` endpoint returns 200 after deploy
- [ ] `/api-docs` and `/graphql` reachable after deploy
- [ ] Custom domain added in Render, DNS record created, SSL certificate issued and verified (Render/Let's Encrypt, automatic)
- [ ] Reverse proxy: not applicable — Render terminates TLS and proxies to the container directly
- [ ] Process manager: not applicable — Docker + Render's own process supervision replaces PM2/systemd
- [ ] Monitoring: Render's built-in metrics/alerts enabled at minimum; note as a future improvement to add an external uptime check (e.g. a free UptimeRobot monitor on `/health`)
- [ ] Logging: `JSON_LOGS=true`, `LOG_LEVEL=info` set; confirm logs are visible in Render's log viewer
- [ ] Backup: accepted as a known gap on M0, or upgraded before real user data exists (your call — flagged in §9)

---

## 6. CI/CD plan (GitHub Actions)

**What already exists:** `ci.yml` (lint/format/build/test on push+PR to main, test step non-blocking), `deploy-api.yml` (fast-fail build check scoped to `apps/api`/`packages`/Docker/render.yaml changes, also non-blocking on test, Node 18 — needs bumping to 20), `web-build.yml`, a disabled `e2e.yml` stub, and an AI PR-review bot (`presubmit.yml`). **There is no separate "deploy" job in Actions today** — Render's Blueprint watches `main` directly and builds/deploys itself; Actions exists purely as a fast pre-check.

**Recommended shape, minimal change from what exists:**
- **Build:** keep `ci.yml`'s existing `build` job (`scripts/validate-build.sh`), bump `deploy-api.yml`'s Node version from 18 to 20 to match the standardized toolchain.
- **Test:** keep running (`jest`, which is what's actually wired in, not the separate Vitest `api-auto` project), but this plan does not change `continue-on-error` — that's a separate decision about test suite trust, out of scope here.
- **Lint:** already present (`oxlint` via `ci.yml`'s `lint` job) — no change needed.
- **Deploy:** no new Actions job needed. Render's Blueprint auto-deploy on merge to `main` **is** the deploy step. What this plan adds: enable branch protection on `main` requiring `ci.yml`'s `build` job (and ideally `lint`) to pass before merge, so Render never builds a commit that failed CI's own build check.
- **Rollback:** Render keeps prior successful deploys — one-click "rollback to previous deploy" in the Render dashboard is the primary path. At the git level, `git revert <bad-commit>` and push to `main` triggers a clean forward-fix redeploy, which is generally safer than force-pushing history.

---

## 7. Step-by-step deployment plan (phased)

**Phase 1 — Repo fixes (no deployment yet)**
- Pin Node 20 everywhere: root `package.json` `engines`, both `Dockerfile` and `Dockerfile.api` `FROM node:20-alpine`, `deploy-api.yml` node-version 18→20.
- Retire `apps/api/Dockerfile` + `deploy/platforms/render.yaml` (the tsx-runtime path) or clearly mark them historical — canonical path becomes root `render.yaml` + `Dockerfile.api`.
- Run `npm run build` and `npm run build:strict` locally against Node 20; confirm no new errors beyond the tracked baseline.
- Verify `.env`/secrets discipline (already clean per §2.3 — just keep it that way).

**Phase 2 — Provision infrastructure**
- MongoDB Atlas: create production database + dedicated user + Network Access rule (already have the Atlas account per your answer).
- Upstash: create a Redis database, copy the `rediss://` connection string.
- Render: create the Blueprint-based Web Service from the (fixed) root `render.yaml`.
- Set every env var from §2.2 in Render's dashboard.

**Phase 3 — First deploy**
- Push the Phase 1 fixes to `main` (or a branch, verify via Render preview if using one) — Render's Blueprint builds and deploys automatically.
- Watch the build logs for the Docker build + health check.

**Phase 4 — Verify**
- Hit `/health`, `/api-docs`, `/graphql` on the Render-provided `.onrender.com` URL.
- Run a real login/register flow against a test tenant to confirm Mongo + JWT + (if configured) SendGrid all work end-to-end.
- Confirm Stripe webhook endpoint is reachable if billing is enabled (Stripe CLI `stripe listen --forward-to` against the live URL, or a dashboard test event).

**Phase 5 — Domain, SSL, monitoring**
- Add your custom domain in Render, create the DNS record it gives you (CNAME to the Render hostname, or the A/ALIAS record Render specifies for an apex domain).
- Confirm Render's automatic SSL certificate issues successfully (usually within minutes).
- Add an external uptime check against `/health` (e.g. free UptimeRobot monitor) — Render's own metrics are a good start but an outside check catches Render-platform-level outages too.

---

## 8. Commands

All commands below are for **your own terminal**, run from the repo root unless noted. None of these have been run for you.

**Phase 1 — local verification**
```bash
# Confirm the build passes on the toolchain you're standardizing on
nvm install 20 && nvm use 20        # or your Node version manager of choice
npm ci                              # clean install from the committed lockfile
npm run build                       # the tolerant build — should succeed
npm run build:strict                # plain tsc — compare error count to the tracked baseline (43)
npm run lint                        # oxlint — should be clean or unchanged from main
```

**Phase 2 — Atlas (run in the Atlas UI, commands here are for local verification only)**
```bash
# Test the connection string locally before trusting it in Render
mongosh "mongodb+srv://<user>:<password>@<cluster>.mongodb.net/luxgen_prod"
```

**Phase 2 — Upstash (verify the Redis URL locally)**
```bash
redis-cli -u "rediss://default:<password>@<host>:<port>" PING
# expect: PONG
```

**Phase 3 — deploy**
```bash
git checkout -b chore/deploy-prep
# (make the Phase 1 fixes: engines, Dockerfiles, deploy-api.yml)
git add -A
git commit -m "chore(deploy): pin Node 20, consolidate to Dockerfile.api"
git push -u origin chore/deploy-prep
gh pr create --title "chore(deploy): standardize on Node 20 + tsc build" \
  --label "help wanted" --label chore --label deployment
# merge after review — Render's Blueprint deploys automatically from main
```

**Phase 4 — verify the live deployment**
```bash
curl -s https://<your-service>.onrender.com/health
# expect: {"status":"OK","timestamp":"..."}

curl -s https://<your-service>.onrender.com/openapi.json | head -c 200
# expect: the start of the OpenAPI JSON spec

curl -s -o /dev/null -w "%{http_code}\n" https://<your-service>.onrender.com/api-docs
# expect: 200
```

**Phase 5 — after DNS propagates**
```bash
dig +short api.yourdomain.com
# expect: your Render-provided hostname/IP, once DNS has propagated

curl -sI https://api.yourdomain.com/health
# expect: HTTP/2 200, and a valid certificate (no curl TLS warnings)
```

---

## 9. Risks

- **Data loss:** Atlas M0 has no automated backups (see §4). Until you upgrade or add a manual export, a cluster-level failure or an accidental bad migration script has no safety net. This is the single biggest risk in this plan.
- **Downtime on redeploy:** Render's default deploy strategy briefly swaps the container; the free tier does not guarantee zero-downtime blue/green deploys the way paid tiers can. Expect a few seconds of unavailability per deploy — acceptable pre-launch, worth revisiting once you have real traffic.
- **Cold starts:** Free-tier Render spins the service down after ~15 minutes idle; the next request pays a cold-start cost (can be several seconds). Fine for early testing, a real UX problem once you have paying users — the trigger to move to a paid Render tier or Fly.io.
- **Silent email failure:** if `EMAIL_PROVIDER` is left at its default (`log`), password resets and invites appear to succeed but no email is ever sent — a support-ticket-generating failure mode, not a crash, so it's easy to miss in testing if you don't check for it explicitly.
- **Stripe misconfiguration:** the non-null-asserted `STRIPE_SECRET_KEY` usages (§2.4) mean a missing key surfaces as a raw TypeError rather than a clean error message, if billing code paths are hit before the key is set.
- **Rollback plan:** Render dashboard "rollback to previous deploy" is the fast path (seconds). Git-level: `git revert <commit> && git push` triggers a clean redeploy of the reverted state — prefer this over force-push for anything already merged to `main`.

---

## 10. Final action plan

1. **Fix Node/Docker inconsistency** — *30 min* — Prereq: none. Commands: edit `package.json` engines, both Dockerfiles' `FROM` line, `deploy-api.yml` node-version. Expected output: `npm run build` succeeds locally on Node 20. Verify: `node --version` shows v20.x, `docker build -f Dockerfile.api .` succeeds locally if Docker is available to you.
2. **Retire the divergent Dockerfile/render.yaml pair** — *15 min* — Prereq: step 1 done. Commands: none (file removal/relabeling), reviewed in the same PR. Verify: only one `render.yaml` is treated as live; the other is deleted or clearly marked historical in a comment.
3. **Create Atlas production DB user + Network Access rule** — *15 min* — Prereq: Atlas account (have). Commands: done in Atlas UI; verify via `mongosh` locally. Expected output: successful connection. Verify: `db.runCommand({ping:1})` returns `{ ok: 1 }`.
4. **Provision Upstash Redis** — *10 min* — Prereq: none. Commands: Upstash UI, verify via `redis-cli -u ... PING`. Expected output: `PONG`.
5. **Create Render Web Service from `render.yaml`** — *20 min* — Prereq: steps 1-2 merged to `main`. Commands: Render dashboard "New Blueprint", point at the repo. Expected output: a build kicks off. Verify: build logs show `Dockerfile.api` stages completing.
6. **Set all production env vars in Render** — *20 min* — Prereq: step 5. Reference: §2.2 table. Verify: Render's env var list matches the table, no placeholder/dev values left in.
7. **First deploy + smoke test** — *15 min* — Prereq: steps 5-6. Commands: from §8 Phase 4. Expected output: `/health` returns 200, `/api-docs` loads, a test login succeeds. Verify: manually exercise one full auth flow against a real (test) tenant.
8. **Point your domain at Render** — *15 min + DNS propagation (up to 24-48h, usually much less)* — Prereq: step 7 passed. Commands: from §8 Phase 5. Verify: `curl -sI https://api.yourdomain.com/health` returns 200 with a valid certificate.
9. **Add an external uptime check** — *10 min* — Prereq: step 8. Commands: none (third-party dashboard, e.g. UptimeRobot, free tier). Verify: a test alert fires correctly when you temporarily point the monitor at a bad path.
10. **Decide on the backup gap** — *decision, not a build task* — Prereq: none, can happen anytime before real user data exists. Either upgrade Atlas to M2/M5, or schedule a manual export job. Verify: a successful restore-from-backup dry run, at least once.

---

This plan makes no changes on its own. Tell me which phase to start on and I'll execute it step by step, pausing for your confirmation between phases.

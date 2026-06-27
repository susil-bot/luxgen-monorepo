# Free-Tier Cloud Deployment

> Deploy LuxGen for **$0/month** using free hobby tiers. Trade-offs: cold starts, no Agent Studio LLM in cloud, optional worker disabled.

---

## Recommended $0 stack

| Layer        | Service                                                 | Free tier limits                         | Role                   |
| ------------ | ------------------------------------------------------- | ---------------------------------------- | ---------------------- |
| **Web**      | [Vercel](https://vercel.com) Hobby                      | 100 GB bandwidth, serverless             | `apps/web` (Next.js)   |
| **API**      | [Render](https://render.com) Free                       | 750 hrs/mo, spins down after 15 min idle | `apps/api` (GraphQL)   |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) M0 | 512 MB storage                           | `@luxgen/db`           |
| **Redis**    | [Upstash](https://upstash.com)                          | 256 MB, 10k cmds/day                     | Optional — agent queue |
| **Cron**     | [cron-job.org](https://cron-job.org)                    | Free schedules                           | Listing reminder job   |
| **Email**    | Console / Resend free tier                              | 100 emails/day on Resend                 | Listing notifications  |
| **Payments** | Stripe Test mode                                        | Free                                     | Billing + listings     |

**Estimated monthly cost: $0** (domains optional ~$12/yr).

---

## Architecture (free tier)

```mermaid
flowchart LR
  User --> Vercel[apps/web Vercel]
  Vercel -->|NEXT_PUBLIC_GRAPHQL_URL| Render[apps/api Render]
  Render --> Atlas[(MongoDB Atlas M0)]
  Render --> Upstash[(Upstash Redis)]
  Stripe -->|webhook| Render
  Cron[cron-job.org] -->|POST /api/jobs/listing-reminders| Render
```

---

## Step 1 — MongoDB Atlas (database)

1. Create account → **Build a Database** → **M0 FREE**.
2. Region: same as API (e.g. `us-east-1`).
3. **Database Access** → user + password.
4. **Network Access** → `0.0.0.0/0` (allow from Render/Vercel; tighten later with IP allowlist).
5. Copy connection string:
   ```
   mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/luxgen_prod?retryWrites=true&w=majority
   ```
6. Seed once (local):
   ```bash
   MONGODB_URI="mongodb+srv://..." npm run seed --workspace=@luxgen/api
   ```

---

## Step 2 — Upstash Redis (optional)

1. Create Redis database (free).
2. Copy `UPSTASH_REDIS_REST_URL` or classic `redis://` URL.
3. Set API env: `REDIS_URL=rediss://default:...@....upstash.io:6379`

Skip if you disable agent-worker and don't need Redis-backed queues.

---

## Step 3 — Deploy API on Render

### Option A — Blueprint (recommended)

1. Push repo to GitHub.
2. Render Dashboard → **New** → **Blueprint** → connect repo.
3. Uses [`deploy/platforms/render.yaml`](../../deploy/platforms/render.yaml).
4. Set **secret** env vars in Render dashboard (see [ENV_PRODUCTION.md](./ENV_PRODUCTION.md)).

### Option B — Manual Docker service

1. **New Web Service** → connect GitHub repo.
2. **Environment:** Docker
3. **Dockerfile path:** `apps/api/Dockerfile`
4. **Docker context:** `.` (repo root — required for monorepo packages)
5. **Build command:** (Docker handles via Dockerfile)
6. **Health check path:** `/health`
7. **Port:** `4000`

**Important env vars on Render:**

```bash
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://...
REDIS_URL=rediss://...
JWT_SECRET=<32+ random chars>
CORS_ORIGIN=https://your-app.vercel.app
APOLLO_INTROSPECTION=false
BILLING_DEV_MODE=false
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
WEB_APP_URL=https://your-app.vercel.app
JOBS_API_KEY=<random secret for cron>
EMAIL_PROVIDER=log
```

Copy your Render URL: `https://luxgen-api.onrender.com`

**Free-tier caveat:** First request after idle may take 30–60s (cold start). Use [UptimeRobot](https://uptimerobot.com) free ping every 5 min to reduce cold starts (optional).

---

## Step 4 — Deploy Web on Vercel

1. Import GitHub repo in [Vercel](https://vercel.com/new).
2. **Root Directory:** `apps/web`
3. **Framework:** Next.js (auto-detected)
4. **Install Command:** `cd ../.. && npm install`
5. **Build Command:** `cd ../.. && npx turbo run build --filter=@luxgen/web`
6. Or use [`deploy/platforms/vercel.json`](../../deploy/platforms/vercel.json) at repo root with `rootDirectory` set in project settings.

**Environment variables (Vercel):**

```bash
NODE_ENV=production
API_URL=https://luxgen-api.onrender.com
NEXT_PUBLIC_API_URL=https://luxgen-api.onrender.com
NEXT_PUBLIC_GRAPHQL_URL=https://luxgen-api.onrender.com/graphql
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
# Agent — disable or point to local-only; Ollama won't run on Vercel
OLLAMA_HOST=
BILLING_DEV_MODE=false
```

7. Deploy → note URL `https://your-app.vercel.app`
8. **Update Render** `CORS_ORIGIN` and API `WEB_APP_URL` to match Vercel URL.

Config reference: [`deploy/platforms/vercel.json`](../../deploy/platforms/vercel.json)

---

## Step 5 — Stripe webhooks

1. Stripe Dashboard → **Developers** → **Webhooks** → Add endpoint  
   `https://luxgen-api.onrender.com/api/billing/webhook`
2. Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
3. Copy signing secret → `STRIPE_WEBHOOK_SECRET` on Render.

Use Stripe **test mode** for free development.

---

## Step 6 — Listing reminder cron (free)

1. [cron-job.org](https://cron-job.org) → create account.
2. New cron job:
   - URL: `https://luxgen-api.onrender.com/api/jobs/listing-reminders`
   - Method: `POST`
   - Header: `x-jobs-key: <your JOBS_API_KEY>`
   - Schedule: daily at 09:00 UTC
3. Matches `listingReminderService` in API.

---

## Step 7 — Custom domain (optional)

| Service                 | Action                                                                 |
| ----------------------- | ---------------------------------------------------------------------- |
| Vercel                  | Add domain → DNS CNAME to Vercel                                       |
| Render                  | Add custom domain on API service                                       |
| Multi-tenant subdomains | Wildcard DNS `*.yourdomain.com` → Vercel; configure in `middleware.ts` |

---

## What does NOT run on free tier

| Feature                   | Why                                     | Workaround                                      |
| ------------------------- | --------------------------------------- | ----------------------------------------------- |
| **Agent Studio (Ollama)** | LLM needs GPU/RAM; Vercel is serverless | Use locally; Enterprise gate stays off in cloud |
| **agent-worker**          | Needs always-on process + Redis         | Skip on free tier                               |
| **Prometheus/Grafana**    | docker-compose.prod only                | Use host dashboards or skip                     |
| **Zero cold starts**      | Render free spins down                  | UptimeRobot ping or paid tier                   |

Set `BILLING_DEV_MODE=false` and rely on Stripe test keys for billing demos.

---

## Alternative: single free VM (Oracle Cloud Always Free)

Run **everything** on one ARM VM with Docker — no cold starts, full stack including Ollama (tight on RAM).

See [DOCKER.md](./DOCKER.md) § Oracle Cloud Always Free.

**Trade-off:** More DevOps work; 24 GB RAM Ampere instance can run `docker-compose.prod.yml` minus monitoring.

---

## Alternative: Fly.io

- Fly.io offers a small free allowance (shared-cpu VMs).
- Deploy API with `deploy/platforms/fly.api.toml`.
- Good if Render cold starts are unacceptable and you stay within free limits.

```bash
fly launch --config deploy/platforms/fly.api.toml
fly secrets set MONGODB_URI=... JWT_SECRET=...
fly deploy
```

---

## Post-deploy checklist

- [ ] `GET https://<api>/health` → 200
- [ ] `GET https://<web>/api/health` → 200
- [ ] Login works against Atlas data
- [ ] GraphQL playground disabled (`APOLLO_INTROSPECTION=false`)
- [ ] Stripe webhook delivers (Stripe CLI or dashboard logs)
- [ ] Cron job returns 200 for listing reminders
- [ ] CORS: web can call API (no browser CORS errors)

Full validation: [technical/operations/CHECKLIST.md](../technical/operations/CHECKLIST.md)

---

## Upgrading from free tier

| When                | Move to                             |
| ------------------- | ----------------------------------- |
| Cold starts hurt UX | Render Starter ($7/mo) or Fly paid  |
| Need Agent in cloud | GPU VPS or OpenAI API + code change |
| Production Stripe   | Live keys + dedicated webhook       |
| High traffic        | Vercel Pro, Atlas M10+, Redis paid  |

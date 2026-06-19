# Production Environment Variables

> Consolidated reference for cloud deployment. Templates: [`deploy/env/`](../../deploy/env/)

---

## Web (`apps/web`) — Vercel / Docker

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NODE_ENV` | Yes | `production` | |
| `API_URL` | Yes | `https://api.example.com` | Server-side rewrites to GraphQL |
| `NEXT_PUBLIC_API_URL` | Yes | same as API_URL | Client-visible |
| `NEXT_PUBLIC_GRAPHQL_URL` | Yes | `https://api.example.com/graphql` | Apollo client |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://app.example.com` | Links, redirects |
| `OLLAMA_HOST` | No | *(empty)* | Leave empty on Vercel — Agent local only |
| `OLLAMA_MODEL` | No | | Only if running agent routes with external LLM |

Copy from: `apps/web/.env.example`

---

## API (`apps/api`) — Render / Fly / Docker

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NODE_ENV` | Yes | `production` | |
| `PORT` | Yes | `4000` | Platform may inject `PORT` |
| `MONGODB_URI` | Yes | `mongodb+srv://...` | Atlas connection string |
| `REDIS_URL` | Optional | `rediss://...` | Upstash; skip if no worker |
| `JWT_SECRET` | Yes | 32+ random chars | **Rotate from dev** |
| `JWT_EXPIRES_IN` | No | `7d` | |
| `CORS_ORIGIN` | Yes | `https://app.vercel.app` | Exact web origin |
| `APOLLO_INTROSPECTION` | Yes | `false` | Disable in prod |
| `LOG_LEVEL` | No | `info` | |
| `WEB_APP_URL` | Yes | `https://app.vercel.app` | Email links |
| `BILLING_DEV_MODE` | Yes | `false` | |
| `STRIPE_SECRET_KEY` | Yes* | `sk_live_...` or test | *If billing enabled |
| `STRIPE_WEBHOOK_SECRET` | Yes* | `whsec_...` | From Stripe dashboard |
| `STRIPE_PRICE_STARTER` | Yes* | `price_...` | |
| `STRIPE_PRICE_PRO` | Yes* | `price_...` | |
| `STRIPE_PRICE_BUSINESS` | Yes* | `price_...` | |
| `STRIPE_PRICE_LISTING` | Yes* | `price_...` | Directory listings |
| `EMAIL_PROVIDER` | Yes | `log` / `sendgrid` | `log` for dev; real provider in prod |
| `SENDGRID_API_KEY` | If SendGrid | | |
| `EMAIL_FROM` | If sending | `noreply@domain.com` | |
| `JOBS_API_KEY` | Yes | random secret | Cron auth header |
| `LISTING_REMINDER_*_DAYS` | No | see `.env.example` | Reminder schedules |
| `TENANT_*_KEY` | Per tenant | | JWT tenant keys |

Copy from: `apps/api/.env.example`

---

## Stripe webhook URL

```
https://<api-host>/api/billing/webhook
```

Configure in Stripe Dashboard → Webhooks.

---

## Cron job header

```
POST https://<api-host>/api/jobs/listing-reminders
x-jobs-key: <JOBS_API_KEY>
```

---

## Security checklist

- [ ] Unique `JWT_SECRET` per environment
- [ ] `APOLLO_INTROSPECTION=false`
- [ ] `BILLING_DEV_MODE=false`
- [ ] Atlas IP allowlist or VPC peering (tighten from `0.0.0.0/0` when stable)
- [ ] Never commit `.env` — use platform secret stores
- [ ] Rotate keys if leaked

Template file: [`deploy/env/production.env.example`](../../deploy/env/production.env.example)

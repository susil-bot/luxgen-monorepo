# Skill: Deployment & Cloud

**Domain:** Deploy monorepo to free/paid cloud, env vars, Docker, CI.  
**Docs:** [docs/deployment/INDEX.md](../../docs/deployment/INDEX.md)

---

## Read first

1. [FREE_TIER_CLOUD.md](../../docs/deployment/FREE_TIER_CLOUD.md) — $0 stack
2. [MONOREPO_BUILD.md](../../docs/deployment/MONOREPO_BUILD.md) — turbo build rules
3. [ENV_PRODUCTION.md](../../docs/deployment/ENV_PRODUCTION.md) — secrets
4. [REPO_STRUCTURE.md](../../REPO_STRUCTURE.md) — where files live

---

## Free-tier default stack

| Component | Host |
|-----------|------|
| Web | Vercel (`apps/web`, root install + turbo build) |
| API | Render Docker (`apps/api/Dockerfile`, context `.`) |
| MongoDB | Atlas M0 |
| Redis | Upstash (optional) |
| Cron | cron-job.org → `/api/jobs/listing-reminders` |

**Do not deploy Ollama/agent-worker on free tier.**

---

## Config files

| File | Platform |
|------|----------|
| `deploy/platforms/vercel.json` | Vercel |
| `deploy/platforms/render.yaml` | Render Blueprint |
| `deploy/platforms/fly.api.toml` | Fly.io |
| `deploy/env/production.env.example` | All |

---

## Build commands (from repo root)

```bash
npm run build:web
npm run build:api
```

Never `npm run build` inside `apps/web` alone without workspace install at root.

---

## Common agent mistakes

| Mistake | Correct approach |
|---------|------------------|
| Docker context = `apps/api` | Context = `.` (monorepo root) |
| Missing `NEXT_PUBLIC_GRAPHQL_URL` on Vercel | Set before build |
| `CORS_ORIGIN=localhost` in prod | Set to Vercel URL |
| `APOLLO_INTROSPECTION=true` in prod | Set `false` |
| Deploy Agent Studio to Vercel | Local Ollama only; leave `OLLAMA_HOST` empty |

---

## Self-hosted

[DOCKER.md](../../docs/deployment/DOCKER.md) — Oracle Cloud Always Free VM + compose.

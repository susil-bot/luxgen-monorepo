# Deployment Documentation

> **Main constraint:** deploy to the cloud on **free tiers** where possible.  
> **Start here:** [FREE_TIER_CLOUD.md](./FREE_TIER_CLOUD.md)

---

## Documents

| Document                                           | Audience        | Description                                               |
| -------------------------------------------------- | --------------- | --------------------------------------------------------- |
| [FREE_TIER_CLOUD.md](./FREE_TIER_CLOUD.md)         | Everyone        | Recommended $0 stack: Vercel + Render + Atlas + Upstash   |
| [MONOREPO_BUILD.md](./MONOREPO_BUILD.md)           | Developers / CI | How Turborepo builds `apps/*` and `packages/*` for deploy |
| [PRESUBMIT_AI_REVIEW.md](./PRESUBMIT_AI_REVIEW.md) | Maintainers     | AI PR reviews — Gemini `LLM_API_KEY` setup                |
| [ENV_PRODUCTION.md](./ENV_PRODUCTION.md)           | DevOps          | Production environment variables (web + API)              |
| [DOCKER.md](./DOCKER.md)                           | Self-hosters    | Docker Compose prod + Oracle Cloud Always Free VM         |
| [../../deploy/README.md](../../deploy/README.md)   | CI / platforms  | Platform configs (`render.yaml`, `vercel.json`)           |

---

## What gets deployed

| Component           | Required for MVP | Free-tier host       |
| ------------------- | ---------------- | -------------------- |
| `apps/web`          | Yes              | Vercel Hobby         |
| `apps/api`          | Yes              | Render Free / Fly.io |
| MongoDB             | Yes              | MongoDB Atlas M0     |
| Redis               | Optional\*       | Upstash Free         |
| `apps/agent-worker` | No (Enterprise)  | Skip on free tier    |
| Ollama / Agent SSE  | No               | Local dev only       |
| Stripe webhooks     | Yes (billing)    | Render API URL       |
| Listing cron        | Yes              | cron-job.org (free)  |

\*Redis needed for agent worker queue; core LMS + GraphQL works without it if worker is disabled.

---

## Quick decision tree

```
Need $0/month?
  └─ YES → FREE_TIER_CLOUD.md (Vercel + Rendered Render + Atlas)
  └─ Have a free VM (Oracle)?
       └─ DOCKER.md (single VM, docker-compose.prod.yml)
  └─ Paid production?
       └─ DOCKER.md + managed MongoDB/Redis + Vercel Pro / Render paid
```

---

## Related docs

- [DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md) — local setup
- [technical/operations/CHECKLIST.md](../technical/operations/CHECKLIST.md) — pre-deploy validation
- [ARCHITECTURE.md](../ARCHITECTURE.md) — system diagram

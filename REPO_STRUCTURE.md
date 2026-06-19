# LuxGen Repository Structure

> Canonical layout for the monorepo. Keeps apps, shared packages, deploy configs, and docs in predictable places.

---

## Top-level map

```
luxgen-monorepo/
├── apps/                 # Runnable applications (deploy targets)
├── packages/             # Shared libraries (imported by apps)
├── deploy/               # Cloud platform configs & env templates
├── docs/                 # All documentation
├── skills/               # Agent/developer task guides
├── scripts/              # Build, validate, tenant utilities
├── .github/workflows/    # CI (lint → build → test)
├── .husky/               # Git hooks (pre-commit, pre-push)
│
├── docker-compose*.yml   # Local & self-hosted Docker stacks
├── Dockerfile            # Legacy combined image (prefer apps/*/Dockerfile)
├── Makefile              # Local dev commands
├── turbo.json            # Turborepo pipeline
├── package.json          # Workspace root
│
├── AGENTS.md             # AI agent entrypoint
├── CODEBASE.md           # Repo map for developers/agents
├── REPO_STRUCTURE.md     # ← this file
├── README.md             # Project overview
└── CHECKLIST.md          # Validation checklist
```

---

## `apps/` — deployable applications

| App | Package | Port | Deploy to |
|-----|---------|------|-----------|
| `web/` | `@luxgen/web` | 3000 | **Vercel** (free) or Docker |
| `api/` | `@luxgen/api` | 4000 | **Render/Fly** (free) or Docker |
| `agent-worker/` | `@luxgen/agent-worker` | — | Optional; skip on free tier |

Each app has its own `package.json`, Dockerfile(s), and `.env.example`.

---

## `packages/` — shared code

| Package | Purpose |
|---------|---------|
| `ui/` | React components, sidebar, layouts |
| `db/` | Mongoose models |
| `agent/` | Agent orchestrator, automation bridge |
| `billing/` | Plans, feature gates, usage limits |
| `auth/` | JWT utilities |
| `config/` | Env helpers |
| `utils/` | Pure functions |

**Rule:** Business logic for API lives in `apps/api/src/services/`, not in packages (except billing/agent domains).

---

## `deploy/` — deployment assets

| Path | Purpose |
|------|---------|
| `deploy/platforms/vercel.json` | Vercel build settings |
| `deploy/platforms/render.yaml` | Render Blueprint |
| `deploy/platforms/fly.api.toml` | Fly.io API service |
| `deploy/env/production.env.example` | Prod env template |

Docs: `docs/deployment/`

---

## `docs/` — documentation

| Path | Purpose |
|------|---------|
| `docs/INDEX.md` | Master index |
| `docs/deployment/` | Cloud deploy guides |
| `docs/ARCHITECTURE.md` | System design |
| `docs/API_REFERENCE.md` | GraphQL + REST |
| `docs/FEATURE_CATALOG.md` | Feature reference |
| Phase docs | `PHASE_9_BILLING.md`, etc. |

---

## `skills/` — domain guides

One folder per domain with `SKILL.md`. Symlinked at `.agents/skills/` for agent tools.

---

## What goes where (decision guide)

| I'm adding… | Put it in… |
|-------------|------------|
| New page/route | `apps/web/pages/` |
| GraphQL API | `apps/api/src/schema/<domain>/` + `services/` |
| DB model | `packages/db/src/` |
| Shared UI component | `packages/ui/src/` |
| Plan gate / pricing | `packages/billing/` |
| Deploy config | `deploy/platforms/` |
| Documentation | `docs/` (update `INDEX.md`) |
| Agent task guide | `skills/<domain>/SKILL.md` |
| One-off script | `scripts/` |

---

## Monorepo conventions

- **Install once** at repo root: `npm install`
- **Build apps** with Turbo filters from root: `npm run build:web`, `npm run build:api`
- **Docker context** is always `.` (root), not `apps/api` alone
- **Env files** stay in each app; production templates in `deploy/env/`

See [docs/deployment/MONOREPO_BUILD.md](./docs/deployment/MONOREPO_BUILD.md)

---

## `.agents/` compatibility

`.agents/skills` → symlink to `skills/`. Do not duplicate skill content.

---

## Future consolidation (optional)

These remain at root for Makefile compatibility but may move under `deploy/docker/` later:

- `docker-compose*.yml`
- `nginx*.conf`
- `monitoring/`

Do not move without updating `Makefile` and docs.

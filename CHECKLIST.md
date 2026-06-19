# LuxGen — Development Checklist & Validation Status

Last validated: 2026-06-18

---

## Legend
- ✅ Done & validated
- 🔧 Fixed in this session
- ⚠️ Needs action (see notes)
- ❌ Broken / not started

---

## 1. Local Development Setup

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1.1 | Node.js v20 installed | ✅ | v22.16.0 detected |
| 1.2 | npm installed | ✅ | v10.9.2 detected |
| 1.3 | Docker + Docker Compose installed | ✅ | Confirmed running |
| 1.4 | Root `npm install` run | ⚠️ | Run `make setup` on first clone |
| 1.5 | `apps/web/.env.local` exists | ✅ 🔧 | Created with all required vars |
| 1.6 | `apps/api/.env` exists | ✅ | Was already present |
| 1.7 | MongoDB running | ✅ | `luxgen-mongodb` container healthy |
| 1.8 | Redis running | ✅ | `luxgen-redis` container healthy |

**To start local dev (recommended — fastest):**
```bash
make setup     # first time only
make dev       # starts turbo dev (web + api with hot reload)
```

---

## 2. Agent Studio (Local LLM)

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 2.1 | Ollama installed & running | ✅ | Running natively at `localhost:11434` |
| 2.2 | Model downloaded | ✅ | `mistral:latest` (4.1 GB, 7.2B Q4) |
| 2.3 | `OLLAMA_HOST` configured | ✅ 🔧 | Added to `.env.local` |
| 2.4 | `OLLAMA_MODEL` matches installed model | ✅ 🔧 | Set to `mistral:latest` |
| 2.5 | `/api/agent/health` returns `ok: true, hasModel: true` | ✅ | Confirmed via curl |
| 2.6 | Agent Studio UI accessible at `/agent` | ⚠️ | Start web app first: `make dev` |
| 2.7 | Agent can read codebase files | ⚠️ | Test after starting dev server |
| 2.8 | Agent stages files to `.agent-staging/` | ⚠️ | Test after starting dev server |
| 2.9 | Transparency diff panel shows changes | ⚠️ | Test after starting dev server |
| 2.10 | Apply All writes files to real codebase | ⚠️ | Test after starting dev server |
| 2.11 | Upgrade to `qwen2.5-coder:7b` (optional, better code) | ⚠️ | Run: `make agent-pull-qwen` |

**To test Agent Studio:**
```bash
make dev          # start the app
# Navigate to http://localhost:3000/agent
# Type: "list the files in apps/web/pages"
# Verify: tool badges appear and agent responds
```

**To upgrade to the best coding model:**
```bash
make agent-pull-qwen
# After pull finishes, update apps/web/.env.local:
# OLLAMA_MODEL=qwen2.5-coder:7b
# Restart dev server
```

---

## 3. Docker Infrastructure

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 3.1 | `docker-compose.yml` — base services | ✅ | MongoDB, Redis, Ollama defined |
| 3.2 | `docker-compose.dev.yml` — dev overrides | ✅ 🔧 | Fixed: now references actual Dockerfiles, correct network |
| 3.3 | `docker-compose.staging.yml` | ✅ 🔧 | Created from scratch |
| 3.4 | `docker-compose.prod.yml` | ⚠️ | Exists but `Dockerfile` target names may need tuning after first prod build |
| 3.5 | `apps/api/Dockerfile.dev` | ✅ 🔧 | Created — Node 20, volume-mount pattern |
| 3.6 | `apps/web/Dockerfile.dev` | ✅ 🔧 | Created — Node 20 + Next.js |
| 3.7 | `apps/api/Dockerfile` (production) | ✅ 🔧 | Created — 3-stage multi-stage build |
| 3.8 | `apps/web/Dockerfile` (production) | ✅ 🔧 | Created — standalone Next.js output |
| 3.9 | Full Docker dev stack starts cleanly | ⚠️ | Validate: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build` |
| 3.10 | Ollama in Docker (optional — currently runs natively) | ⚠️ | Run `make agent-start` to also run it in Docker |

---

## 4. Environment Variables

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 4.1 | `.env.example` (root) | ✅ 🔧 | Created |
| 4.2 | `apps/web/.env.example` | ✅ 🔧 | Created — all vars documented with examples |
| 4.3 | `apps/api/.env.example` | ✅ 🔧 | Created — all vars documented |
| 4.4 | `.env.staging.example` | ✅ 🔧 | Created — template for staging |
| 4.5 | `.env.staging` (actual staging values) | ⚠️ | Copy `.env.staging.example` → `.env.staging`, fill in real values |
| 4.6 | `.env.production` (actual prod values) | ⚠️ | Must be created before `make prod` |
| 4.7 | All secrets rotated from defaults | ⚠️ | `JWT_SECRET`, `MONGO_ROOT_PASSWORD` must be changed in staging/prod |
| 4.8 | `scripts/check-env.sh` validates vars | ✅ 🔧 | Created — run: `sh scripts/check-env.sh web` |

**Quick env validation:**
```bash
sh scripts/check-env.sh web      # validate web env vars
sh scripts/check-env.sh api      # validate api env vars
sh scripts/check-env.sh staging  # validate staging env vars
```

---

## 5. Developer Experience

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 5.1 | `Makefile` with all commands | ✅ 🔧 | Created — run `make help` to see all |
| 5.2 | `make setup` works on fresh clone | ⚠️ | Test on a clean machine |
| 5.3 | `make dev` starts turbo dev | ✅ | Uses existing turbo pipeline |
| 5.4 | `make dev-infra` starts Docker infra only | ✅ 🔧 | MongoDB + Redis + Ollama |
| 5.5 | `make dev-full` starts entire stack in Docker | ⚠️ | Test: `make dev-full` |
| 5.6 | `make staging` starts staging env | ⚠️ | Requires `.env.staging` |
| 5.7 | `make logs` shows aggregated logs | ✅ | Wraps `docker compose logs -f` |
| 5.8 | `make clean` stops all services | ✅ | Safe — preserves volumes/data |
| 5.9 | `make clean-all` full reset | ✅ | Prompts for confirmation |
| 5.10 | `make agent-status` shows model info | ✅ | Try it now |
| 5.11 | `AGENT_STUDIO.md` — full documentation | ✅ | 650-line technical reference |
| 5.12 | `.gitignore` covers `.agent-staging/` | ✅ 🔧 | Added |

---

## 6. Production Readiness

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 6.1 | Multi-stage Dockerfiles (no dev deps in prod image) | ✅ 🔧 | api + web both have 3-stage builds |
| 6.2 | Non-root user in prod containers | ✅ 🔧 | `nextjs:nodejs` and `apiuser:nodejs` |
| 6.3 | Health checks in all prod containers | ✅ 🔧 | curl-based health checks |
| 6.4 | Resource limits configured | ✅ | Already in `docker-compose.prod.yml` |
| 6.5 | Nginx reverse proxy configured | ⚠️ | `nginx.prod.conf` file needs to be created |
| 6.6 | SSL/TLS certificates | ⚠️ | Configure before public deployment |
| 6.7 | MongoDB auth enabled in prod | ✅ | Uses `${MONGO_ROOT_USERNAME}` vars |
| 6.8 | No hardcoded secrets in any Dockerfile or compose | ✅ | All secrets via env vars |
| 6.9 | `.next/standalone` output works in Docker | ⚠️ | Validate: `make build-web` then inspect `.next/standalone/` |
| 6.10 | API TypeScript compiles cleanly | ⚠️ | Validate: `make build-api` |

---

## 7. Code Quality

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 7.1 | TypeScript build errors (web) | ⚠️ | `typescript.ignoreBuildErrors: true` masks errors — should fix & disable |
| 7.2 | TypeScript build errors (api) | ⚠️ | Run: `make build-api` |
| 7.3 | Lint passing | ⚠️ | Run: `make lint` |
| 7.4 | Tests passing | ⚠️ | Run: `make test` |
| 7.5 | `groups/[id].tsx` GraphQL TODO resolved | ⚠️ | Currently uses setTimeout mock |
| 7.6 | `groups/dashboard.tsx` GraphQL TODO resolved | ⚠️ | Currently uses hardcoded data |

---

## 8. Next Steps (Priority Order)

### Immediate (unblocks testing today)
```bash
# 1. Start the dev server
make dev

# 2. Test Agent Studio in browser
open http://localhost:3000/agent

# 3. Check health endpoint
curl http://localhost:3000/api/agent/health
# Expected: {"ok":true,"hasModel":true,"model":"mistral:latest","models":["mistral:latest"]}
```

### This Week
- [ ] Test `make dev-full` (full Docker dev stack) and fix any issues
- [ ] Create `nginx.prod.conf` for production reverse proxy
- [ ] Create `.env.staging` with real staging values
- [ ] Run `make staging` and validate staging build works
- [ ] Fix TypeScript errors in `packages/ui/src/` (pre-existing)

### Before Production
- [ ] Create `.env.production` with real production secrets
- [ ] Set up SSL certificates (Let's Encrypt or similar)
- [ ] Create `nginx.prod.conf`
- [ ] Run `make build` and fix any build errors
- [ ] Pull `qwen2.5-coder:7b` for better Agent Studio code generation
- [ ] Disable `typescript.ignoreBuildErrors` in `next.config.js`
- [ ] Set up CI/CD pipeline (GitHub Actions recommended)

---

## Quick Reference

```bash
# ── Daily development ─────────────────────────────────────────────────────
make dev             # start web + api locally (fastest)
make dev-infra       # start MongoDB + Redis + Ollama in Docker

# ── Agent Studio ─────────────────────────────────────────────────────────
make agent-status    # check which models are available
make agent-pull-qwen # pull qwen2.5-coder:7b (better code, ~4.7 GB)

# ── Check everything ──────────────────────────────────────────────────────
make status          # Docker services status
sh scripts/check-env.sh web   # validate web env vars

# ── Environments ─────────────────────────────────────────────────────────
make dev-full        # full stack in Docker
make staging         # staging build (needs .env.staging)

# ── Help ─────────────────────────────────────────────────────────────────
make help            # all available commands
```

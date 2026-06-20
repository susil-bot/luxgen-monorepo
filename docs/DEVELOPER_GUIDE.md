# Developer Guide — LuxGen

> **Audience:** Engineers onboarding to the monorepo.  
> **Next steps:** [CODEBASE.md](../CODEBASE.md), [CODING_STANDARDS.md](../CODING_STANDARDS.md), [docs/INDEX.md](./INDEX.md)

---

## 1. What you're building

LuxGen is a **multi-tenant LMS** with:

- GraphQL API (web + future mobile)
- Workflow automations (Pro+)
- Stripe billing and plan gates
- Template marketplace and usage metering
- Enterprise Agent Studio (AI-assisted code changes)
- Business directory with subscription lifecycle

Architecture overview: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 2. Prerequisites

| Tool       | Version / notes                                 |
| ---------- | ----------------------------------------------- |
| Node.js    | 18+                                             |
| npm        | Workspace root install                          |
| MongoDB    | Local or Docker (`make dev-infra`)              |
| Redis      | Agent worker + queue                            |
| Ollama     | Agent Studio (`http://localhost:11434`)         |
| Stripe CLI | Optional — webhook testing for billing/listings |

---

## 3. First-time setup

```bash
# From repo root
npm install

# Start MongoDB, Redis, Ollama (Docker)
make dev-infra

# Copy env files
cp apps/api/.env.example apps/api/.env
# Create apps/web/.env.local — see CODEBASE.md § Environment Variables

# Terminal 1 — API
cd apps/api && npm run dev

# Terminal 2 — Web
cd apps/web && npm run dev
```

Or pick your **role stack** (starts Mongo + API + your client — faster than `make dev`):

```bash
make dev-stack-web      # learner / marketing pages in apps/web
make dev-stack-admin    # commerce admin: /orders, /admin/customers, /products
make dev-stack-mobile   # Expo app (requires apps/mobile merged)
make dev-stack-api      # GraphQL API only
```

See `skills/dev-workflows/SKILL.md` and `make help`.

Legacy: `make dev` runs all turbo `dev` workspaces.

**URLs:**

| Service | URL                                    |
| ------- | -------------------------------------- |
| Web     | http://localhost:3000                  |
| GraphQL | http://localhost:4000/graphql          |
| Tenants | `?tenant=demo` or `?tenant=idea-vibes` |

---

## 4. Repository layout

```
apps/
  web/          Next.js 14 Pages Router — UI
  api/          GraphQL + REST + Stripe webhooks
  agent-worker/ Headless agent jobs (Redis)
packages/
  ui/           @luxgen/ui — layouts, sidebar, components
  db/           @luxgen/db — Mongoose models
  agent/        @luxgen/agent — orchestrator, git, automation bridge
  billing/      @luxgen/billing — plans, gates, limits
  auth/         JWT helpers
docs/           Architecture, API, business, phases
skills/         Agent + developer task guides
```

Full map: [CODEBASE.md](../CODEBASE.md)

---

## 5. Development workflow

### New page

1. Copy structure from an existing page (e.g. `pages/groups/index.tsx`)
2. Follow Standard Page Template in CODEBASE.md
3. Use iOS tokens — [skills/ios-design/SKILL.md](../skills/ios-design/SKILL.md)
4. Add nav item — [skills/sidebar/SKILL.md](../skills/sidebar/SKILL.md)

### New GraphQL feature

1. [skills/graphql/SKILL.md](../skills/graphql/SKILL.md)
2. Service in `apps/api/src/services/`
3. Schema in `apps/api/src/schema/<domain>/`
4. Client query in `apps/web/graphql/queries/`

### Plan-gated feature

1. [skills/billing/SKILL.md](../skills/billing/SKILL.md)
2. Feature flag in `@luxgen/billing`
3. Server assert + client `PlanGate`

---

## 6. Key environment variables

### API (`apps/api/.env`)

| Variable                | Purpose                     |
| ----------------------- | --------------------------- |
| `MONGODB_URI`           | Mongo connection            |
| `JWT_SECRET`            | Auth tokens                 |
| `STRIPE_SECRET_KEY`     | Billing + listings          |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification        |
| `BILLING_DEV_MODE`      | Dev billing shortcuts       |
| `EMAIL_PROVIDER`        | Listing notification emails |
| `WEB_APP_URL`           | Links in emails             |
| `JOBS_API_KEY`          | Cron job auth               |

See full list: `apps/api/.env.example`

### Web (`apps/web/.env.local`)

| Variable                       | Purpose        |
| ------------------------------ | -------------- |
| `NEXT_PUBLIC_GRAPHQL_URL`      | Client GraphQL |
| `OLLAMA_HOST` / `OLLAMA_MODEL` | Agent chat     |

---

## 7. Testing, hooks & CI

### Code quality (Oxc — oxlint + oxfmt)

Replaces ESLint + Prettier at the repo root. Per-package `eslint` scripts remain for legacy use.

```bash
npm run lint          # oxlint (errors only, --quiet)
npm run lint:all      # oxlint including warnings
npm run lint:fix      # auto-fix + suggestions
npm run format        # oxfmt --check
npm run format:fix    # oxfmt --write
npm run quality       # lint + format check
npm run quality:fix   # lint:fix + format:fix
```

Config: `.oxlintrc.json`, `.oxfmtrc.json`, `.oxlintignore`

### Local git hooks (Husky)

| Hook           | Runs                                          | Matches CI |
| -------------- | --------------------------------------------- | ---------- |
| **pre-commit** | `lint-staged` → ESLint on staged `.ts`/`.tsx` | Lint job   |
| **pre-push**   | `scripts/validate-build.sh`                   | Build job  |

```bash
npm run validate        # lint + build (full check)
npm run validate:build  # build only (same as pre-push)
```

Hooks install on `npm install` via the `prepare` script. Emergency bypass: `git commit --no-verify` / `git push --no-verify`.

### GitHub Actions

`.github/workflows/ci.yml` — **Lint** → **Build** → **Test** on push/PR to `main`/`master`.

### Manual checks

```bash
npm run lint          # Root lint (turbo)
make test             # If configured
```

**Known issues:** Pre-existing TS errors in `@luxgen/ui`; web build may ignore them. Fix only when touching those files.

Checklist before deploy: [CHECKLIST.md](../CHECKLIST.md)

Deploy to cloud (free tier): [deployment/FREE_TIER_CLOUD.md](./deployment/FREE_TIER_CLOUD.md)

Repo layout: [REPO_STRUCTURE.md](../REPO_STRUCTURE.md)

---

## 8. Documentation map

| Need                   | Document                                                                 |
| ---------------------- | ------------------------------------------------------------------------ |
| All docs index         | [INDEX.md](./INDEX.md)                                                   |
| Every feature          | [FEATURE_CATALOG.md](./FEATURE_CATALOG.md)                               |
| GraphQL + REST         | [API_REFERENCE.md](./API_REFERENCE.md)                                   |
| Business ↔ code        | [BUSINESS_TECH_TRANSLATION.md](./BUSINESS_TECH_TRANSLATION.md)           |
| Billing                | [PHASE_9_BILLING.md](./PHASE_9_BILLING.md)                               |
| Marketplace            | [PHASE_10_MARKETPLACE.md](./PHASE_10_MARKETPLACE.md)                     |
| Listings               | [LISTING_SUBSCRIPTION_LIFECYCLE.md](./LISTING_SUBSCRIPTION_LIFECYCLE.md) |
| Agent platform         | [AGENT_STUDIO.md](../AGENT_STUDIO.md)                                    |
| AI agents working here | [AI_AGENT_GUIDE.md](./AI_AGENT_GUIDE.md)                                 |

---

## 9. Getting help

- **Troubleshooting:** [DEVELOPER_KNOWLEDGE_BASE.md](./DEVELOPER_KNOWLEDGE_BASE.md)
- **Multi-tenant:** [MULTI_TENANT_ARCHITECTURE.md](../MULTI_TENANT_ARCHITECTURE.md)
- **Personas & pages:** [PERSONA_PAGES.md](./PERSONA_PAGES.md)

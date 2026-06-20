# Monorepo Build & Deploy

> How Turborepo builds LuxGen for production. Read before configuring CI or cloud platforms.

---

## Workspace layout

```
luxgen-monorepo/
├── apps/
│   ├── web/           @luxgen/web   → Next.js (Vercel / Docker)
│   ├── api/           @luxgen/api   → Express + GraphQL (Render / Docker)
│   └── agent-worker/  @luxgen/agent-worker → optional worker
├── packages/
│   ├── ui/            @luxgen/ui
│   ├── db/            @luxgen/db
│   ├── agent/         @luxgen/agent
│   ├── billing/       @luxgen/billing
│   ├── auth/          @luxgen/auth
│   ├── config/        @luxgen/config
│   └── utils/         @luxgen/utils
├── deploy/            Platform configs (Vercel, Render, Fly)
├── docs/              Documentation
├── skills/            Agent/developer skills
└── scripts/           Tenant selection, init scripts
```

Full map: [technical/development/REPO_STRUCTURE.md](../technical/development/REPO_STRUCTURE.md)

---

## Dependency graph (build order)

Turbo `dependsOn: ["^build"]` builds packages before apps:

```
@luxgen/utils, @luxgen/config, @luxgen/auth
        ↓
@luxgen/billing, @luxgen/db
        ↓
@luxgen/ui, @luxgen/agent
        ↓
@luxgen/web, @luxgen/api, @luxgen/agent-worker
```

---

## Build commands

From **repository root** (required for workspace deps):

```bash
# Everything
npm run build

# Single app (what cloud platforms should use)
npm run build:web    # turbo --filter=@luxgen/web
npm run build:api    # turbo --filter=@luxgen/api

# Per-tenant build (optional branding)
npm run build:demo
```

---

## Web (`apps/web`)

| Setting     | Value                                                 |
| ----------- | ----------------------------------------------------- |
| Output      | Next.js `standalone` (see `next.config.js`)           |
| Docker      | `apps/web/Dockerfile` — context must be **repo root** |
| Vercel root | `apps/web` with install/build from monorepo root      |

**Build-time env (Vercel):** `NEXT_PUBLIC_*` vars must be set before build.

**Runtime env:** `API_URL` for rewrites to GraphQL backend.

---

## API (`apps/api`)

| Setting | Value                                                                               |
| ------- | ----------------------------------------------------------------------------------- |
| Build   | `tsc` → `dist/` locally; **Docker uses `tsx`** for production until TS debt cleared |
| Start   | `node dist/index.js` local; `npx tsx src/index.ts` in Docker                        |
| Docker  | `apps/api/Dockerfile` — context **repo root**                                       |
| Health  | `GET /health`                                                                       |

Dockerfile runs `turbo run build --filter=@luxgen/api` which compiles API + dependency packages.

---

## Common platform mistakes

| Mistake                                               | Fix                                                   |
| ----------------------------------------------------- | ----------------------------------------------------- |
| Build from `apps/web` only without root `npm install` | Install at repo root; filter turbo build              |
| Docker context = `apps/api`                           | Set context to `.` (monorepo root)                    |
| Missing `NEXT_PUBLIC_GRAPHQL_URL` at build            | Add in Vercel env before deploy                       |
| API can't find `@luxgen/db`                           | Ensure full workspace copied in Docker builder stage  |
| API can't `tsc` (pre-existing TS errors)              | Docker uses `tsx` runtime — see `apps/api/Dockerfile` |
| Web rewrites fail in prod                             | Set `API_URL` to public API URL (not localhost)       |

---

## CI example (GitHub Actions)

See [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml):

- **Lint** job — `npm run lint`
- **Build** job — `scripts/validate-build.sh` (same as Husky **pre-push**)
- **Test** job — `npm run test`

Local **pre-commit** runs `lint-staged` (ESLint on staged files).

```bash
npm run validate        # lint + build
npm run validate:build  # build only
```

---

## Docker images

| Dockerfile                | Purpose                                     |
| ------------------------- | ------------------------------------------- |
| `apps/api/Dockerfile`     | Production API (use this on Render)         |
| `apps/web/Dockerfile`     | Production web standalone                   |
| `apps/api/Dockerfile.dev` | Local dev hot-reload                        |
| `apps/web/Dockerfile.dev` | Local dev hot-reload                        |
| `Dockerfile` (root)       | Legacy combined image — prefer split deploy |

---

## Agent worker (optional)

Only deploy if Redis is available and Enterprise agent queue is needed:

```bash
npm run build --workspace=@luxgen/agent-worker
node apps/agent-worker/dist/index.js
```

Not included in free-tier guide — add a second Render/Fly service when upgrading.

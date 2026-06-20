# Skill: Developer Role Dev Workflows

**Domain:** Which services to run locally based on what you build (web, admin/commerce, Expo mobile, API-only).  
**Docs:** [DEVELOPER_GUIDE.md](../../docs/DEVELOPER_GUIDE.md), [Makefile](../../Makefile), [MOBILE_STORE_ROADMAP.md](../../docs/MOBILE_STORE_ROADMAP.md)

---

## One backend, three client surfaces

| Surface              | App                   | GraphQL consumer                              |
| -------------------- | --------------------- | --------------------------------------------- |
| **Web / learner**    | `apps/web` (Next.js)  | Marketing, `/learn`, `/dashboard`, courses    |
| **Admin / commerce** | `apps/web` (same app) | `/admin/*`, `/orders`, `/products`, customers |
| **Mobile**           | `apps/mobile` (Expo)  | Learner app — same schema as web              |
| **Backend**          | `apps/api`            | Source of truth for all clients               |

All clients send `Authorization: Bearer` + `x-tenant` (subdomain). See [GRAPHQL_PLATFORM.md](../../docs/GRAPHQL_PLATFORM.md).

---

## Quick start by role

Run **one** command from repo root. Each starts **MongoDB** (Docker) if needed, then **API**, then your client.

| I work on…              | Command                 | What runs                        |
| ----------------------- | ----------------------- | -------------------------------- |
| **Web / learner UI**    | `make dev-stack-web`    | Mongo + API + Next.js            |
| **Admin / commerce**    | `make dev-stack-admin`  | Mongo + API + Next.js            |
| **Expo mobile**         | `make dev-stack-mobile` | Mongo + API + Expo               |
| **API / GraphQL only**  | `make dev-stack-api`    | Mongo + API                      |
| **Full turbo (legacy)** | `make dev`              | All workspaces with `dev` script |

npm equivalents: `npm run dev:stack:web`, `dev:stack:admin`, `dev:stack:mobile`, `dev:stack:api`.

---

## URLs (local)

| Service           | URL                                                  |
| ----------------- | ---------------------------------------------------- |
| GraphQL           | http://localhost:4000/graphql                        |
| Web (demo tenant) | http://demo.localhost:3000                           |
| Learner store     | http://demo.localhost:3000/learn                     |
| Admin customers   | http://demo.localhost:3000/admin/customers           |
| Orders            | http://demo.localhost:3000/orders                    |
| Mobile API env    | `apps/mobile/.env.local` → `EXPO_PUBLIC_GRAPHQL_URL` |

**Demo login:** `alex.thompson@demo.com` / `password123` · tenant `demo`

---

## Web vs admin — same stack, different routes

Both use `apps/web`. The Makefile targets differ only in **documented entry URLs**:

- **Web developer** → `/learn`, `/dashboard`, `/courses`
- **Admin developer** → `/admin/customers`, `/orders`, `/products`, `/admin/listings`

Do **not** run `make dev` unless you need every workspace (agent-worker, etc.). Role stacks are faster.

---

## Mobile prerequisites

`make dev-stack-mobile` requires `apps/mobile` (merged from `feat/mobile-foundation`). Script copies `apps/mobile/.env.example` → `.env.local` on first run.

- iOS Simulator: `localhost:4000` works for GraphQL
- Android emulator: use `10.0.2.2:4000` in `.env.local`

---

## First-time setup

```bash
make setup          # env files + npm install + dev-infra
make dev-stack-web  # pick your role
```

---

## When to add infra

| Need                  | Extra command      |
| --------------------- | ------------------ |
| Agent Studio / Ollama | `make agent-start` |
| Full Docker stack     | `make dev-docker`  |
| Re-seed DB            | `make db-seed`     |

---

## Agent rules

1. **Load this skill** when the user says they work on web, admin, mobile, or backend only.
2. **Recommend role stack**, not bare `make dev`, unless they explicitly need all apps.
3. **Never** tell mobile devs to run only `dev:web`; tell them `make dev-stack-mobile`.
4. **API changes** ship in `apps/api` first; web/mobile are thin clients (separate PRs per `.cursor/rules/pr-workflow.mdc`).

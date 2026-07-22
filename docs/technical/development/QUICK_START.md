# Developer Quick Start

> **Parent:** [Technical docs](../README.md) · **Next:** [Developer guide](../../DEVELOPER_GUIDE.md)

---

## Prerequisites

- Node.js 20+
- npm (workspace root install)
- Optional: Docker Desktop for containerized stack

## Local development (npm)

```bash
npm install
npm run dev          # Turbo — web :3000, API :4000
npm test
npm run lint
```

## Docker development (recommended)

One command — builds images, starts MongoDB/Redis/API/Web with hot reload, and **auto-seeds on first boot only**:

```bash
make dev-docker
# or
npm run dev:docker:detach
```

| URL                           | Purpose                          |
| ----------------------------- | -------------------------------- |
| http://demo.localhost:3000    | Demo tenant app                  |
| http://localhost:4000/graphql | GraphQL playground               |
| http://localhost:8081         | Mongo Express (admin / admin123) |

**Demo login:** `alex.thompson@demo.com` / `password123`

### Docker commands

```bash
make logs          # follow all logs
make clean         # stop stack (keeps DB volume)
make db-reset      # wipe DB; API re-seeds on next start
make clean-all     # stop + delete all volumes
make dev-clean-web # kill :3000/:4000, wipe .next, restart web stack
```

## Subdomain routing

Use tenant subdomains locally (`demo.localhost:3000`). See [SUBDOMAIN_SETUP.md](./SUBDOMAIN_SETUP.md).

## Next steps

| Task              | Document                                                                   |
| ----------------- | -------------------------------------------------------------------------- |
| Repo layout       | [REPO_STRUCTURE.md](./REPO_STRUCTURE.md)                                   |
| Tenancy model     | [../architecture/MULTI_TENANT.md](../architecture/MULTI_TENANT.md)         |
| Pre-deploy checks | [../operations/CHECKLIST.md](../operations/CHECKLIST.md)                   |
| Cloud deploy      | [../../deployment/FREE_TIER_CLOUD.md](../../deployment/FREE_TIER_CLOUD.md) |

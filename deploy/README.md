# Deploy configs

Platform-specific deployment files for the LuxGen monorepo.

**Documentation:** [docs/deployment/INDEX.md](../docs/deployment/INDEX.md)  
**Free tier guide:** [docs/deployment/FREE_TIER_CLOUD.md](../docs/deployment/FREE_TIER_CLOUD.md)

---

## Contents

```
deploy/
├── README.md                 ← this file
├── env/
│   └── production.env.example
└── platforms/
    ├── render.yaml           Render Blueprint (API + optional web)
    ├── vercel.json           Vercel monorepo settings
    └── fly.api.toml          Fly.io API service
```

---

## Quick deploy

| Platform | Config                   | App                           |
| -------- | ------------------------ | ----------------------------- |
| Vercel   | `platforms/vercel.json`  | `apps/web`                    |
| Render   | `platforms/render.yaml`  | `apps/api`, `apps/mcp-server` |
| Fly.io   | `platforms/fly.api.toml` | `apps/api`                    |
| Docker   | `apps/*/Dockerfile`      | API + web separately          |

Always build from **monorepo root** — see [MONOREPO_BUILD.md](../docs/deployment/MONOREPO_BUILD.md).

---

## Husky & GitHub Actions

Local hooks mirror CI:

| Hook / Job | Command                                          |
| ---------- | ------------------------------------------------ |
| pre-commit | `lint-staged` → `oxlint --fix` + `oxfmt --write` |
| pre-push   | `sh scripts/validate-build.sh`                   |
| CI lint    | `npm run lint` (oxlint)                          |
| CI format  | `npm run format` (oxfmt --check)                 |

Root scripts: `npm run validate`, `npm run validate:build`

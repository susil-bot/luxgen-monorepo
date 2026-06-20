# LuxGen Technical Documentation

> Hierarchical index for engineers, DevOps, and AI agents. Product and business docs stay in [../INDEX.md](../INDEX.md).

---

## 1. Onboarding

| Document                                                             | Description                               |
| -------------------------------------------------------------------- | ----------------------------------------- |
| [development/QUICK_START.md](./development/QUICK_START.md)           | Install, Docker, demo URLs, credentials   |
| [../DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md)                       | Full developer onboarding                 |
| [development/CODEBASE.md](./development/CODEBASE.md)                 | Repo map — pages, packages, ports, models |
| [development/CODING_STANDARDS.md](./development/CODING_STANDARDS.md) | Non-negotiable coding rules               |
| [development/REPO_STRUCTURE.md](./development/REPO_STRUCTURE.md)     | Monorepo layout and file placement        |

## 2. Architecture

| Document                                                       | Description                              |
| -------------------------------------------------------------- | ---------------------------------------- |
| [../ARCHITECTURE.md](../ARCHITECTURE.md)                       | System layers, data flow, deployment     |
| [architecture/MULTI_TENANT.md](./architecture/MULTI_TENANT.md) | Subdomain tenancy, themes, tenant config |
| [../TENANT_LAYER_SUPERADMIN.md](../TENANT_LAYER_SUPERADMIN.md) | Superadmin runbook, debugging, roadmap   |
| [../SECURITY_HARDENING.md](../SECURITY_HARDENING.md)           | Isolation, JWT, rate limits, CSP         |
| [../GRAPHQL_PLATFORM.md](../GRAPHQL_PLATFORM.md)               | GraphQL contract for web + mobile        |

## 3. Local development

| Document                                                                   | Description                       |
| -------------------------------------------------------------------------- | --------------------------------- |
| [development/SUBDOMAIN_SETUP.md](./development/SUBDOMAIN_SETUP.md)         | Local subdomain routing           |
| [development/TENANT_BUILD_SYSTEM.md](./development/TENANT_BUILD_SYSTEM.md) | Build-time tenant selection       |
| [../DEVELOPER_KNOWLEDGE_BASE.md](../DEVELOPER_KNOWLEDGE_BASE.md)           | Troubleshooting, env, Docker tips |
| [../tenant-keys.md](../tenant-keys.md)                                     | Per-tenant JWT keys               |

## 4. API & integration

| Document                                     | Description                     |
| -------------------------------------------- | ------------------------------- |
| [../API_REFERENCE.md](../API_REFERENCE.md)   | GraphQL domains, REST, webhooks |
| [../auth-api.md](../auth-api.md)             | Auth endpoints                  |
| [../../AGENTS.md](../../AGENTS.md)           | AI agent entrypoint             |
| [../AI_AGENT_GUIDE.md](../AI_AGENT_GUIDE.md) | Agent playbook                  |

## 5. Platform modules

| Document                                                                     | Description                 |
| ---------------------------------------------------------------------------- | --------------------------- |
| [../PHASE_9_BILLING.md](../PHASE_9_BILLING.md)                               | Stripe, plan gates          |
| [../PHASE_10_MARKETPLACE.md](../PHASE_10_MARKETPLACE.md)                     | Template marketplace        |
| [../LISTING_SUBSCRIPTION_LIFECYCLE.md](../LISTING_SUBSCRIPTION_LIFECYCLE.md) | Business directory          |
| [agent/AGENT_STUDIO.md](./agent/AGENT_STUDIO.md)                             | Agent Studio implementation |
| [../AGENT_STUDIO_ARCHITECTURE.md](../AGENT_STUDIO_ARCHITECTURE.md)           | Agent platform architecture |

## 6. UI & design

| Document                                                                       | Description                 |
| ------------------------------------------------------------------------------ | --------------------------- |
| [../AUTH_UI.md](../AUTH_UI.md)                                                 | Auth UX, session notices    |
| [../IOS_UI_AUDIT.md](../IOS_UI_AUDIT.md)                                       | iOS design compliance audit |
| [ui/SEARCH_AND_DROPDOWN_COMPONENTS.md](./ui/SEARCH_AND_DROPDOWN_COMPONENTS.md) | Search & dropdown spec      |
| [../LAYOUT_PATTERNS.md](../LAYOUT_PATTERNS.md)                                 | Page layout patterns        |
| [../../skills/ios-design/SKILL.md](../../skills/ios-design/SKILL.md)           | Design tokens & templates   |

## 7. Operations & deployment

| Document                                                                   | Description                            |
| -------------------------------------------------------------------------- | -------------------------------------- |
| [operations/CHECKLIST.md](./operations/CHECKLIST.md)                       | Dev / staging / prod validation        |
| [operations/DEVELOPER_AGENT_TODO.md](./operations/DEVELOPER_AGENT_TODO.md) | Architect audit backlog                |
| [../deployment/INDEX.md](../deployment/INDEX.md)                           | Cloud deployment hub                   |
| [../deployment/FREE_TIER_CLOUD.md](../deployment/FREE_TIER_CLOUD.md)       | $0 tier: Vercel + Render + Atlas       |
| [../deployment/DOCKER.md](../deployment/DOCKER.md)                         | Docker & VM deploy                     |
| [../deployment/MONOREPO_BUILD.md](../deployment/MONOREPO_BUILD.md)         | Turbo CI builds                        |
| [../deployment/ENV_PRODUCTION.md](../deployment/ENV_PRODUCTION.md)         | Production env vars                    |
| [../../deploy/README.md](../../deploy/README.md)                           | Platform configs (`render.yaml`, etc.) |
| [../../k8s/README.md](../../k8s/README.md)                                 | Kubernetes manifests                   |

## 8. Infrastructure configs (YAML)

| File                              | Purpose                             | Docs                                                           |
| --------------------------------- | ----------------------------------- | -------------------------------------------------------------- |
| `docker-compose.yml`              | Base stack (Mongo, Redis, API, Web) | [DOCKER.md](../deployment/DOCKER.md)                           |
| `docker-compose.dev.yml`          | Dev overrides (hot reload)          | [QUICK_START.md](./development/QUICK_START.md)                 |
| `docker-compose.staging.yml`      | Staging stack                       | [deployment/INDEX.md](../deployment/INDEX.md)                  |
| `docker-compose.prod.yml`         | Production stack                    | [ENV_PRODUCTION.md](../deployment/ENV_PRODUCTION.md)           |
| `.github/workflows/ci.yml`        | Lint, format, test                  | [MONOREPO_BUILD.md](../deployment/MONOREPO_BUILD.md)           |
| `.github/workflows/web-build.yml` | Web production build                | [MONOREPO_BUILD.md](../deployment/MONOREPO_BUILD.md)           |
| `.github/workflows/presubmit.yml` | AI PR code review (Gemini)          | [PRESUBMIT_AI_REVIEW.md](../deployment/PRESUBMIT_AI_REVIEW.md) |
| `deploy/platforms/render.yaml`    | Render Blueprint                    | [FREE_TIER_CLOUD.md](../deployment/FREE_TIER_CLOUD.md)         |
| `k8s/*.yaml`                      | Kubernetes services                 | [k8s/README.md](../../k8s/README.md)                           |

## 9. Planning & internal

| Document                                                                                                 | Description                   |
| -------------------------------------------------------------------------------------------------------- | ----------------------------- |
| [planning/infra-validation-and-expo-feasibility.md](./planning/infra-validation-and-expo-feasibility.md) | Mobile/Expo feasibility study |
| [planning/bulk-upload-export-architecture.md](./planning/bulk-upload-export-architecture.md)             | Bulk upload/export design     |
| [../internal/NOTES_FOR_DAVE.md](../internal/NOTES_FOR_DAVE.md)                                           | Internal contributor notes    |

---

## Documentation standards

See [\_meta/DOCUMENTATION_STANDARD.md](./_meta/DOCUMENTATION_STANDARD.md) for markdown and YAML conventions.

_Last updated: 2026-06-20_

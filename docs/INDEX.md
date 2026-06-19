# LuxGen Documentation Index

> **Start here.** This index routes developers, product stakeholders, and AI agents to the right document.

---

## By audience

| I am… | Start with | Then read |
|-------|------------|-----------|
| **New developer** | [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | [CODEBASE.md](../CODEBASE.md), [CODING_STANDARDS.md](../CODING_STANDARDS.md) |
| **Product / business** | [BUSINESS_STRATEGY_2026.md](./BUSINESS_STRATEGY_2026.md) | [BUSINESS_TECH_TRANSLATION.md](./BUSINESS_TECH_TRANSLATION.md), [FEATURE_CATALOG.md](./FEATURE_CATALOG.md) |
| **AI coding agent** | [../AGENTS.md](../AGENTS.md) | [AI_AGENT_GUIDE.md](./AI_AGENT_GUIDE.md), [CODEBASE.md](../CODEBASE.md), relevant `skills/*/SKILL.md` |
| **Architect / tech lead** | [ARCHITECTURE.md](./ARCHITECTURE.md) | [GRAPHQL_PLATFORM.md](./GRAPHQL_PLATFORM.md), phase docs below |
| **Deploying to cloud** | [deployment/FREE_TIER_CLOUD.md](./deployment/FREE_TIER_CLOUD.md) | [deployment/INDEX.md](./deployment/INDEX.md), [../deploy/README.md](../deploy/README.md) |
| **API consumer (web/mobile)** | [API_REFERENCE.md](./API_REFERENCE.md) | [GRAPHQL_PLATFORM.md](./GRAPHQL_PLATFORM.md), [auth-api.md](./auth-api.md) |

---

## By topic

### Platform & architecture

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System layers, apps, packages, data flow, deployment |
| [GRAPHQL_PLATFORM.md](./GRAPHQL_PLATFORM.md) | GraphQL-first contract for web + mobile |
| [MULTI_TENANT_ARCHITECTURE.md](../MULTI_TENANT_ARCHITECTURE.md) | Subdomain tenancy, tenant config |
| [API_REFERENCE.md](./API_REFERENCE.md) | GraphQL domains, REST routes, webhooks |

### Business & features

| Document | Description |
|----------|-------------|
| [BUSINESS_STRATEGY_2026.md](./BUSINESS_STRATEGY_2026.md) | ICP, pricing, GTM, roadmap |
| [BUSINESS_TECH_TRANSLATION.md](./BUSINESS_TECH_TRANSLATION.md) | Business goal → technical feature map |
| [FEATURE_CATALOG.md](./FEATURE_CATALOG.md) | Every feature: user value, code locations, APIs |
| [PERSONA_PAGES.md](./PERSONA_PAGES.md) | Admin, learner, analytics, developer personas |

### Revenue & monetization (Phases 9–10)

| Document | Description |
|----------|-------------|
| [PHASE_9_BILLING.md](./PHASE_9_BILLING.md) | Stripe plans, plan gates, billing UI |
| [PHASE_10_MARKETPLACE.md](./PHASE_10_MARKETPLACE.md) | Template marketplace, usage metering |
| [LISTING_SUBSCRIPTION_LIFECYCLE.md](./LISTING_SUBSCRIPTION_LIFECYCLE.md) | Business directory listings, emails, subscriptions |

### Agent Studio & automations (Phases 4–7)

| Document | Description |
|----------|-------------|
| [../AGENT_STUDIO.md](../AGENT_STUDIO.md) | SSE, tools, staging (implementation) |
| [AGENT_STUDIO_ARCHITECTURE.md](./AGENT_STUDIO_ARCHITECTURE.md) | Phases 3–7 target architecture |
| [AI_STUDIO_TIMELINE.md](./AI_STUDIO_TIMELINE.md) | Task backlog & edge cases |

### UI & design

| Document | Description |
|----------|-------------|
| [../CODING_STANDARDS.md](../CODING_STANDARDS.md) | TypeScript, React, CSS rules |
| [SIDEBAR_REDESIGN.md](./SIDEBAR_REDESIGN.md) | Sidebar spec |
| `skills/ios-design/SKILL.md` | Design tokens & page template |

### Operations

| Document | Description |
|----------|-------------|
| [../CHECKLIST.md](../CHECKLIST.md) | Dev/staging/prod validation |
| [deployment/INDEX.md](./deployment/INDEX.md) | **Cloud deployment hub** |
| [deployment/FREE_TIER_CLOUD.md](./deployment/FREE_TIER_CLOUD.md) | $0 deploy: Vercel + Render + Atlas |
| [deployment/MONOREPO_BUILD.md](./deployment/MONOREPO_BUILD.md) | Turbo build for CI/cloud |
| [deployment/ENV_PRODUCTION.md](./deployment/ENV_PRODUCTION.md) | Production env vars |
| [deployment/DOCKER.md](./deployment/DOCKER.md) | Docker & Oracle Cloud VM |
| [../REPO_STRUCTURE.md](../REPO_STRUCTURE.md) | Repository layout guide |
| [DEVELOPER_KNOWLEDGE_BASE.md](./DEVELOPER_KNOWLEDGE_BASE.md) | Troubleshooting, Docker, env |
| [tenant-keys.md](./tenant-keys.md) | Per-tenant JWT keys |

---

## Agent skills (`skills/`)

| Skill | Load when… |
|-------|------------|
| [ios-design](../skills/ios-design/SKILL.md) | Any new page, CSS, layout |
| [sidebar](../skills/sidebar/SKILL.md) | Navigation, sidebar |
| [persona-pages](../skills/persona-pages/SKILL.md) | Learner, admin, analytics pages |
| [ai-studio](../skills/ai-studio/SKILL.md) | Agent Studio, `@luxgen/agent` |
| [automation](../skills/automation/SKILL.md) | Automations, marketplace templates |
| [billing](../skills/billing/SKILL.md) | Plans, Stripe, plan gates |
| [listings](../skills/listings/SKILL.md) | Business directory, application lifecycle |
| [graphql](../skills/graphql/SKILL.md) | New GraphQL domain, mobile API |
| [deployment](../skills/deployment/SKILL.md) | Cloud deploy, Docker, CI |
| [fullstack-developer](../skills/fullstack-developer/SKILL.md) | General full-stack patterns |

---

## Implementation phases (roadmap)

| Phase | Status | Doc |
|-------|--------|-----|
| 1–3 | Shipped | [AGENT_STUDIO.md](../AGENT_STUDIO.md) |
| 4 | Shipped | `@luxgen/agent` extraction — [ARCHITECTURE.md](./ARCHITECTURE.md) |
| 5 | Shipped | Git worktree pipeline — [AGENT_STUDIO_ARCHITECTURE.md](./AGENT_STUDIO_ARCHITECTURE.md) |
| 6 | Shipped | Validation, Mongo, Redis worker |
| 7 | Shipped | GraphQL automations + bridge |
| 8 | Planned | Mobile app (Expo) on GraphQL |
| 9 | Shipped | [PHASE_9_BILLING.md](./PHASE_9_BILLING.md) |
| 10 | Shipped | [PHASE_10_MARKETPLACE.md](./PHASE_10_MARKETPLACE.md) |
| Listings | Shipped | [LISTING_SUBSCRIPTION_LIFECYCLE.md](./LISTING_SUBSCRIPTION_LIFECYCLE.md) |

---

## Repository entrypoints (always canonical)

| File | Role |
|------|------|
| [CODEBASE.md](../CODEBASE.md) | Repo map — **read first for code changes** |
| [AGENTS.md](../AGENTS.md) | AI agent entrypoint |
| [CODING_STANDARDS.md](../CODING_STANDARDS.md) | Non-negotiable coding rules |

*Last updated: documentation pass — listings, billing, marketplace, agent platform.*

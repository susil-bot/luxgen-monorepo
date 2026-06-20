# LuxGen — AI Agent Entrypoint

This file is the repository-level entrypoint for AI coding agents (Claude Code, Cursor, Copilot Workspace, and similar tools).

---

## Canonical Guidance

- `CODING_STANDARDS.md` — non-negotiable coding rules.
- `CODEBASE.md` — full repository map: pages, packages, ports, data models, how-to guides.
- `docs/INDEX.md` — documentation hub (developer, business, architecture, API).
- `docs/AI_AGENT_GUIDE.md` — agent playbook: read order, constraints, feature map.
- `skills/` — task-specific guidance by domain (`.agents/skills` symlinks here).

---

## First Action for Every Session

1. Read `CODEBASE.md`
2. Read `docs/AI_AGENT_GUIDE.md` if the task is non-trivial
3. Load the relevant `skills/<domain>/SKILL.md` (table below)

---

## Skill Loading

Read `skills/<skill-name>/SKILL.md` **first** when a task matches that skill's domain.

| Task domain                           | Skill to load                                |
| ------------------------------------- | -------------------------------------------- |
| Sidebar navigation                    | `skills/sidebar/SKILL.md`                    |
| Learner / customer / analytics pages  | `skills/persona-pages/SKILL.md`              |
| AI Studio / agent config              | `skills/ai-studio/SKILL.md`                  |
| Automations / workflows / marketplace | `skills/automation/SKILL.md`                 |
| Billing / Stripe / plan gates         | `skills/billing/SKILL.md`                    |
| Business listings / directory         | `skills/listings/SKILL.md`                   |
| New GraphQL domain / mobile API       | `skills/graphql/SKILL.md`                    |
| Commerce CRUD / form → API wiring     | `skills/fullstack-developer/SKILL.md`        |
| Cloud deploy / Docker / CI            | `skills/deployment/SKILL.md`                 |
| CSS, colours, typography, layout      | `skills/ios-design/SKILL.md`                 |
| Any new page                          | `skills/ios-design/SKILL.md` + `CODEBASE.md` |

**PR policy:** Feature work (`feat/`) and bug fixes (`fix/`) must be separate PRs — see `.cursor/rules/pr-workflow.mdc`. **Every PR/issue needs labels** — see `.cursor/rules/pr-labels.mdc` (`help wanted` is mandatory). **Auth / login UI** — see `.cursor/rules/auth-session.mdc`.

---

## Documentation by perspective

| Perspective            | Start here                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| **AI agent**           | This file → `docs/AI_AGENT_GUIDE.md` → domain skill                                                |
| **Developer**          | `docs/DEVELOPER_GUIDE.md` → `CODEBASE.md`                                                          |
| **Product / business** | `docs/BUSINESS_STRATEGY_2026.md` → `docs/BUSINESS_TECH_TRANSLATION.md` → `docs/FEATURE_CATALOG.md` |
| **Architecture**       | `docs/ARCHITECTURE.md` → `docs/GRAPHQL_PLATFORM.md`                                                |
| **Deployment**         | `docs/deployment/FREE_TIER_CLOUD.md` → `deploy/`                                                   |
| **API consumer**       | `docs/API_REFERENCE.md`                                                                            |

---

## Repository Quick Facts

| Item          | Value                                            |
| ------------- | ------------------------------------------------ |
| Monorepo tool | Turborepo                                        |
| Frontend      | Next.js 14 Pages Router — `apps/web/`            |
| Backend       | GraphQL (Apollo + Express) — `apps/api/`         |
| Agent package | `@luxgen/agent` — `packages/agent/`              |
| Billing       | `@luxgen/billing` — plans, gates, usage          |
| UI package    | `@luxgen/ui` — `packages/ui/src/`                |
| Design system | iOS/macOS tokens — `apps/web/styles/globals.css` |
| LLM backend   | Ollama at `http://localhost:11434`               |
| Multi-tenancy | Subdomain routing — `demo`, `idea-vibes`         |
| Dev command   | `npm run dev` from repo root or `make dev`       |

---

## Shipped platform modules

| Module                 | Doc                                      |
| ---------------------- | ---------------------------------------- |
| Automations (Phase 7)  | `docs/AGENT_STUDIO_ARCHITECTURE.md`      |
| Billing (Phase 9)      | `docs/PHASE_9_BILLING.md`                |
| Marketplace (Phase 10) | `docs/PHASE_10_MARKETPLACE.md`           |
| Business listings      | `docs/LISTING_SUBSCRIPTION_LIFECYCLE.md` |

Full index: `docs/INDEX.md`

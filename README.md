<p align="center">
  <strong>LuxGen</strong>
</p>

<p align="center">
  Multi-tenant learning, commerce, and automation platform for modern organizations.
</p>

<p align="center">
  <a href="./docs/INDEX.md">Documentation</a> ·
  <a href="./docs/technical/development/QUICK_START.md">Quick Start</a> ·
  <a href="./docs/BUSINESS_STRATEGY_2026.md">Product</a> ·
  <a href="./docs/API_REFERENCE.md">API</a>
</p>

---

## About

LuxGen helps teams run branded learning experiences, commerce workflows, and AI-assisted operations from a single platform. Each customer organization gets an isolated tenant with its own subdomain, branding, users, and data — while sharing a reliable, scalable core.

Built for product teams who need enterprise-grade multi-tenancy without rebuilding infrastructure from scratch.

## Platform capabilities

| Capability                | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| **Multi-tenant SaaS**     | Subdomain routing, tenant isolation, per-tenant branding   |
| **Learning & commerce**   | Courses, enrollments, products, orders, customers          |
| **Automations**           | Trigger → action workflows with plan-based feature gates   |
| **Billing & marketplace** | Stripe subscriptions, usage metering, template marketplace |
| **Agent Studio**          | AI-assisted development and automation (`@luxgen/agent`)   |
| **Business listings**     | Directory with editorial review and subscription lifecycle |

## Get started

Developers: install dependencies and start the local stack.

```bash
npm install
npm run dev
```

For Docker, seeded databases, and demo credentials, see the **[Developer Quick Start](./docs/technical/development/QUICK_START.md)**.

## Documentation

| Audience               | Start here                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| **Everyone**           | [Documentation index](./docs/INDEX.md)                                                               |
| **Developers**         | [Developer guide](./docs/DEVELOPER_GUIDE.md) · [Technical docs](./docs/technical/README.md)          |
| **Product & business** | [Business strategy](./docs/BUSINESS_STRATEGY_2026.md) · [Feature catalog](./docs/FEATURE_CATALOG.md) |
| **AI coding agents**   | [AGENTS.md](./AGENTS.md)                                                                             |
| **Architecture & API** | [Architecture](./docs/ARCHITECTURE.md) · [API reference](./docs/API_REFERENCE.md)                    |
| **Deployment**         | [Cloud deployment](./docs/deployment/INDEX.md)                                                       |

Technical depth (repo layout, tenancy, checklists, YAML configs) lives under **[docs/technical/](./docs/technical/README.md)** — not in this README.

## Repository

LuxGen is a **Turborepo monorepo**: `apps/` (web, API, agent worker), `packages/` (UI, DB, billing, agent), and `docs/` (all documentation). Root keeps only `README.md` and `AGENTS.md`; technical docs live under `docs/technical/`.

## Contributing

1. Branch from `main` using prefixes: `feat/`, `fix/`, or `chore/`
2. Open a pull request — **do not push directly to `main`**
3. Follow [CODING_STANDARDS.md](./docs/technical/development/CODING_STANDARDS.md) and the PR workflow in `.cursor/rules/`

## Support

- **Issues:** GitHub Issues on this repository
- **Internal runbooks:** [Tenant layer (superadmin)](./docs/TENANT_LAYER_SUPERADMIN.md) · [Operations checklist](./docs/technical/operations/CHECKLIST.md)

---

<p align="center">
  <sub>LuxGen · Proprietary · Internal use</sub>
</p>

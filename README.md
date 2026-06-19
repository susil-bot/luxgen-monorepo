# LuxGen Monorepo

A comprehensive multi-tenant platform built with Next.js, Node.js, and MongoDB. Features dynamic tenant detection, theme-aware UI components, and enterprise-grade architecture.

## ✨ Key Features

- **🏢 Multi-Tenant Architecture**: Dynamic tenant detection via subdomains and query parameters
- **⚡ Automations**: Trigger → action workflows with plan gates (Pro+)
- **💳 Billing**: Stripe subscriptions, usage metering, template marketplace
- **🤖 Agent Studio**: Enterprise AI-assisted code changes (`@luxgen/agent`)
- **📋 Business Listings**: Directory with editorial review and subscription lifecycle
- **🎨 Theme System**: CSS custom properties with tenant-specific branding
- **📱 Responsive Design**: Mobile-first UI components with breakpoint management
- **🔐 Authentication**: JWT-based auth with per-tenant key rotation
- **📊 Analytics**: Built-in performance tracking and user analytics
- **🛡️ Error Handling**: Comprehensive error boundaries and graceful fallbacks
- **♿ Accessibility**: WCAG compliant components with proper ARIA attributes
- **🔧 TypeScript**: Full TypeScript support across all packages

## 📁 Project Structure

```
luxgen-monorepo/
├── apps/
│   ├── api/          # GraphQL API server
│   └── web/          # Next.js web application
├── packages/
│   ├── auth/         # Authentication utilities
│   ├── config/       # Configuration management
│   ├── core/         # Core business logic
│   ├── db/           # Database models and connections
│   ├── shared/       # Shared utilities
│   ├── ui/           # UI component library
│   └── utils/        # Utility functions
└── docs/             # Documentation
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

## 🐳 Docker Development (recommended)

One command — builds images, starts MongoDB/Redis/API/Web with hot reload, and **auto-seeds on first boot only** (data persists in Docker volumes):

```bash
make dev-docker
# or
npm run dev:docker:detach
```

| URL | Purpose |
|-----|---------|
| http://demo.localhost:3000 | Demo tenant app |
| http://localhost:4000/graphql | GraphQL playground |
| http://localhost:8081 | Mongo Express (admin / admin123) |

**Demo login:** `alex.thompson@demo.com` / `password123`

```bash
make logs          # follow all logs
make clean         # stop stack (keeps DB volume — no re-seed needed)
make db-reset      # wipe DB; API re-seeds automatically on next start
make clean-all     # stop + delete all volumes (full reset)
```

## 🔧 Recent Improvements

### ✅ Hydration Error Fixes
- Fixed React hydration mismatches in `TenantDebug` component
- Resolved server/client tenant detection inconsistencies
- Added proper SSR support with `initialTenant` prop

### ✅ Multi-Tenant System
- Dynamic tenant detection from subdomains (`ideavibes.localhost:3000`)
- Query parameter fallback (`?tenant=demo`)
- Tenant-specific theming and branding
- API integration for dynamic tenant configuration

### ✅ UI Component Library
- Comprehensive NavBar with search and notifications
- Collapsible Sidebar with hierarchical navigation
- AppLayout with responsive design
- SearchBar and CountryLanguageDropdown components
- Error boundaries and debugging tools

### ✅ API Integration
- GraphQL API with tenant-aware queries
- REST endpoints for tenant configuration
- User management with tenant separation
- Database seeding with sample multi-tenant data

## 📚 Documentation

**Start at [docs/INDEX.md](./docs/INDEX.md)** — full hub for developers, product, and AI agents.

| Perspective | Document |
|-------------|----------|
| Developer onboarding | [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) |
| AI coding agents | [AGENTS.md](./AGENTS.md) → [docs/AI_AGENT_GUIDE.md](./docs/AI_AGENT_GUIDE.md) |
| Business & strategy | [docs/BUSINESS_STRATEGY_2026.md](./docs/BUSINESS_STRATEGY_2026.md) |
| Business ↔ engineering | [docs/BUSINESS_TECH_TRANSLATION.md](./docs/BUSINESS_TECH_TRANSLATION.md) |
| Feature catalog | [docs/FEATURE_CATALOG.md](./docs/FEATURE_CATALOG.md) |
| Architecture | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| API reference | [docs/API_REFERENCE.md](./docs/API_REFERENCE.md) |
| Repo map | [CODEBASE.md](./CODEBASE.md) |

Phase docs: [Billing](./docs/PHASE_9_BILLING.md) · [Marketplace](./docs/PHASE_10_MARKETPLACE.md) · [Listings](./docs/LISTING_SUBSCRIPTION_LIFECYCLE.md)

**Deploy (free tier):** [docs/deployment/FREE_TIER_CLOUD.md](./docs/deployment/FREE_TIER_CLOUD.md) · **Repo layout:** [REPO_STRUCTURE.md](./REPO_STRUCTURE.md)

## 🛠️ Development

This is a monorepo managed with Turbo. Each package can be developed independently while sharing common dependencies.

### Available Scripts

- `npm run dev` - Start all development servers
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run lint` - Run ESLint on all packages
- `npm run clean` - Clean all build artifacts

## 🏗️ Architecture

The platform follows a multi-tenant architecture with:
- **Tenant Isolation**: Each tenant has isolated data and configuration
- **Shared Infrastructure**: Common services and utilities
- **Scalable Design**: Built to handle multiple tenants efficiently

## 📦 Packages

| Package | Purpose |
|---------|---------|
| **apps/web** | Next.js frontend — LMS, billing, automations, listings, agent UI |
| **apps/api** | GraphQL + REST + Stripe webhooks |
| **apps/agent-worker** | Headless agent jobs (Redis) |
| **@luxgen/ui** | Shared UI component library |
| **@luxgen/db** | Mongoose models |
| **@luxgen/agent** | Agent orchestrator, git pipeline, automation bridge |
| **@luxgen/billing** | Plans, feature gates, usage limits |
| **@luxgen/auth** | JWT helpers |
| **@luxgen/config** | Configuration utilities |
| **@luxgen/utils** | Utility functions |

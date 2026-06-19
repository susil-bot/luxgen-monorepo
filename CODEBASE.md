# LuxGen Codebase Reference

> **For AI agents**: Read this file first (`read_file CODEBASE.md`) before exploring the codebase.
> It maps the entire repo so you can navigate directly to the right file instead of guessing.

---

## Key Design Documents

| Document | Purpose | Read when... |
|----------|---------|--------------|
| `CODEBASE.md` (this file) | Repo map, conventions, page template | Before any work |
| `docs/INDEX.md` | Documentation hub — developer, business, agent, API | Finding the right doc |
| `docs/DEVELOPER_GUIDE.md` | Onboarding, local dev, workflow | New to the repo |
| `docs/AI_AGENT_GUIDE.md` | AI agent playbook | Agent sessions |
| `docs/FEATURE_CATALOG.md` | Every feature: routes, APIs, packages | Product or cross-feature work |
| `docs/ARCHITECTURE.md` | System layers, apps, packages, flows | Architecture changes |
| `docs/API_REFERENCE.md` | GraphQL domains + REST routes | API work |
| `docs/BUSINESS_TECH_TRANSLATION.md` | Business goal ↔ technical feature | Product/engineering alignment |
| `AGENT_STUDIO.md` | Agent Studio deep-dive (SSE, tools, staging) | Agent / `@luxgen/agent` work |
| `docs/SIDEBAR_REDESIGN.md` | Sidebar spec | Before touching sidebar |
| `docs/deployment/FREE_TIER_CLOUD.md` | $0 cloud deploy (Vercel + Render + Atlas) | Before production deploy |
| `REPO_STRUCTURE.md` | Canonical repo layout | Onboarding, refactors |
| `CHECKLIST.md` | Dev/staging/prod validation | Before deploying |

---

## Repository Layout

```
luxgen-monorepo-main/
├── apps/
│   ├── web/                     # Next.js 14 frontend (port 3000)
│   ├── api/                     # GraphQL API — Apollo Server + Express (port 4000)
│   └── agent-worker/            # Headless agent jobs (Redis queue)
├── packages/
│   ├── ui/                      # @luxgen/ui — shared React component library
│   ├── db/                      # @luxgen/db — Mongoose models + DB connection
│   ├── agent/                   # @luxgen/agent — orchestrator, git, automation bridge
│   ├── billing/                 # @luxgen/billing — plans, feature gates, usage limits
│   ├── auth/                    # @luxgen/auth — JWT helpers
│   ├── config/                  # @luxgen/config — shared env/config utilities
│   └── utils/                   # @luxgen/utils — shared pure functions
├── docs/                        # Architecture, API, business, deployment — start at INDEX.md
├── deploy/                      # Platform configs (Vercel, Render, Fly) + prod env template
├── skills/                      # Domain skills for agents (.agents/skills → here)
├── .github/workflows/           # CI (build web + api on PR)
├── docker-compose.yml           # Base: MongoDB, Redis, Ollama
├── Makefile                     # `make help` shows all commands
├── CODEBASE.md                  # ← this file
├── AGENTS.md                    # AI agent entrypoint
├── AGENT_STUDIO.md              # Agent Studio technical deep-dive
└── CHECKLIST.md                 # Dev/staging/prod validation checklist
```

---

## Frontend — `apps/web/`

### Router
**Pages Router** (Next.js 14). Every file in `pages/` is a route.

```
apps/web/
├── pages/
│   ├── _app.tsx                 # Root: ApolloProvider + ThemeProvider + GlobalProvider
│   ├── _document.tsx            # HTML document
│   ├── index.tsx                # / → homepage (redirects to /dashboard)
│   ├── login.tsx                # /login
│   ├── register.tsx             # /register
│   ├── dashboard.tsx            # /dashboard — requires tenant prop from getServerSideProps
│   ├── courses.tsx              # /courses
│   ├── users.tsx                # /users
│   ├── agent.tsx                # /agent — Agent Studio (Enterprise gate)
│   ├── automations/             # /automations — workflow rules (Pro gate)
│   ├── billing/                 # /billing — plans, Stripe checkout
│   ├── marketplace/             # /marketplace — automation templates
│   ├── listings/                # /listings — public directory, apply, my applications
│   ├── admin/listings/          # /admin/listings — editorial review queue
│   ├── analytics/               # /analytics — Pro gate
│   ├── customers/               # /customers — learner persona
│   ├── developer/               # /developer — developer hub
│   ├── 404.tsx                  # custom 404
│   ├── api/                     # Next.js API routes (serverless)
│   │   ├── health.ts            # GET /api/health
│   │   └── agent/
│   │       ├── chat.ts          # POST /api/agent/chat — SSE (Enterprise gate)
│   │       ├── health.ts        # GET /api/agent/health
│   │       ├── stage.ts         # GET/DELETE /api/agent/stage
│   │       └── apply.ts         # POST /api/agent/apply
│   ├── courses/
│   │   ├── index.tsx            # /courses
│   │   └── [id].tsx             # /courses/:id
│   └── groups/
│       ├── index.tsx            # /groups
│       ├── [id].tsx             # /groups/:id — group detail
│       ├── [id].tsx             # /groups/:id
│       ├── analytics.tsx        # /groups/analytics
│       ├── create.tsx           # /groups/create
│       └── dashboard.tsx        # /groups/dashboard
├── components/
│   ├── agent/
│   │   ├── AgentChat.tsx
│   │   └── AgentTransparency.tsx
│   ├── billing/
│   │   └── PlanGate.tsx         # Client-side plan feature gate
│   └── tenant/
│       └── TenantBanner.tsx
├── lib/
│   ├── agent.ts                 # Agent tools, session types, SYSTEM_PROMPT, AGENT_TOOLS_OPENAI
│   ├── theme.tsx                # ThemeProvider (dark/light, localStorage['luxgen-theme'])
│   ├── apolloClient.ts          # Apollo Client setup
│   └── transformer.ts           # transformDashboardData, transformUserData, etc.
├── graphql/
│   └── queries/                 # Apollo gql`` query/mutation documents
│       ├── auth.ts
│       ├── dashboard.ts
│       ├── automations.ts       # Phase 7
│       ├── billing.ts           # Phase 9
│       ├── marketplace.ts       # Phase 10
│       └── listings.ts          # Business directory
├── styles/
│   └── globals.css              # iOS design system (CSS custom properties + utility classes)
├── middleware.ts                # Subdomain → ?tenant= rewrite (demo.localhost → ?tenant=demo)
├── next.config.js               # rewrites: /api/graphql → :4000/graphql
└── .env.local                   # Local dev env vars (not committed)
```

### Environment Variables (apps/web)

| Variable | Example | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `development` | Required |
| `API_URL` | `http://localhost:4000` | Server-side GraphQL proxy target |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Client-side API URL |
| `NEXT_PUBLIC_GRAPHQL_URL` | `http://localhost:4000/graphql` | GraphQL endpoint |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | App base URL |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server (agent backend) |
| `OLLAMA_MODEL` | `mistral:latest` | Model to use for agent |

### iOS Design System

All pages must use these CSS variables — never hardcode colors.

**Colors** (auto-switch dark/light):
```css
var(--color-bg-primary)          /* #F2F2F7 light / #000 dark — page background */
var(--color-bg-secondary)        /* #FFF / #1C1C1E — card background */
var(--color-label-primary)       /* #000 / #FFF — main text */
var(--color-label-secondary)     /* rgba text — secondary text */
var(--color-label-tertiary)      /* rgba text — hints, placeholders */
var(--color-blue)                /* #007AFF / #0A84FF — primary action */
var(--color-green)               /* #34C759 / #30D158 — success */
var(--color-red)                 /* #FF3B30 / #FF453A — error/destructive */
var(--color-orange)              /* #FF9500 — warning */
var(--color-purple)              /* #AF52DE — info/brand */
var(--color-separator)           /* subtle divider */
var(--color-fill-quaternary)     /* very subtle fill — hover backgrounds */
```

**Radii**: `var(--radius-xs/sm/md/lg/xl/2xl/full)`

**Shadows**: `var(--shadow-xs/sm/md/lg/xl/floating)`

**Utility classes** (defined in globals.css):
```
.surface            — white card, lg radius, sm shadow, separator border
.surface-elevated   — elevated card, xl radius, lg shadow
.glass              — frosted glass (sidebar/navbar)
.stat-card          — hover-lift metric card
.input-field        — iOS-style input (focus ring with var(--color-blue))
.badge .badge-blue/green/red/orange/purple/gray — pill badges
.nav-item / .nav-item.active — sidebar nav links
.ios-large-title    — 34px bold heading (like iOS Mail app)
.ios-card           — inset-grouped card
.ios-card-row       — row inside ios-card with separator
.ios-btn-primary    — filled blue pill button
.ios-btn-secondary  — tinted blue pill button
.ios-btn-plain      — text-only blue button
.ios-metric-tile    — stat metric tile with label/value/sub slots
.ios-avatar .ios-avatar-sm/md/lg/xl — gradient avatar circle
.ios-empty-state    — empty state with icon/title/subtitle
.ios-spinner        — iOS-style loading spinner
.ios-form-group     — inset form card (Settings-style)
.divider            — 1px separator line
.segmented / .segmented-item.active — segmented control (iOS style)
.animate-fade-in / .animate-slide-up / .animate-scale-in — entry animations
```

**NEVER use**: `bg-white`, `bg-gray-*`, `text-gray-*`, `border-gray-*`, `rounded` (use `rounded-xl` or CSS var).
**ALWAYS use**: CSS custom properties from the list above.

### Standard Page Template

Every new page must follow this exact structure:

```tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  SnackbarProvider, useSnackbar,
  AppLayout, getDefaultUser, getDefaultLogo, getDefaultSidebarSections
} from '@luxgen/ui';

const MyPageContent: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useSnackbar();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('user');
    if (data) {
      try {
        const p = JSON.parse(data);
        setUser({ name: `${p.firstName} ${p.lastName}`, email: p.email, role: p.role });
      } catch { setUser(getDefaultUser()); }
    } else { setUser(getDefaultUser()); }
  }, []);

  const handleUserAction = (action: 'profile' | 'settings' | 'logout') => {
    if (action === 'logout') { localStorage.removeItem('authToken'); router.push('/login'); }
    else router.push(`/${action}`);
  };

  return (
    <>
      <Head><title>My Page - LuxGen</title></Head>
      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={user}
        onUserAction={handleUserAction}
        logo={getDefaultLogo()}
        sidebarCollapsible
        responsive
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="ios-large-title mb-1">Page Title</h1>
          <p className="text-secondary text-sm mb-8">Subtitle text</p>
          {/* content */}
        </div>
      </AppLayout>
    </>
  );
};

export default function MyPage() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <MyPageContent />
    </SnackbarProvider>
  );
}
```

### Multi-Tenancy

- Subdomain routing: `demo.localhost:3000` → middleware rewrites to `?tenant=demo`
- Two tenants: `demo` (pro plan) and `idea-vibes` (enterprise plan)
- Tenant config in `apps/api/src/config/tenants.ts`
- Tenant query param accessible via `useRouter().query.tenant`
- `getServerSideProps` passes `tenant` as prop to pages that need it:
  ```ts
  export const getServerSideProps = ({ query }) => ({
    props: { tenant: (query.tenant as string) || 'demo' }
  });
  ```

---

## Backend — `apps/api/`

```
apps/api/src/
├── index.ts                     # Entry: Express + Apollo Server setup
├── schema/                      # GraphQL domains (typeDefs + resolvers per folder)
│   ├── index.ts                 # Merges all domains
│   ├── tenant/ course/ group/ user/ dashboard/
│   ├── automation/              # Phase 7
│   ├── billing/                 # Phase 9
│   ├── marketplace/             # Phase 10
│   └── listing/                 # Business directory
├── services/                    # Business logic (resolvers delegate here)
│   ├── automationService.ts
│   ├── billingService.ts
│   ├── marketplaceService.ts
│   ├── usageService.ts
│   ├── listingService.ts
│   ├── listingNotificationService.ts
│   ├── listingSubscriptionService.ts
│   └── listingReminderService.ts
├── notifications/
│   └── listing-templates.ts     # Listing email HTML templates
├── routes/                      # REST: billing webhook, jobs
├── config/
│   └── tenants.ts               # demo + idea-vibes tenant configs
├── middleware/
│   ├── tenantRouting.ts
│   └── roleManagement.ts
└── tests/
```

### GraphQL domains

Registered in `apps/api/src/schema/index.ts`. Playground: `http://localhost:4000/graphql`

| Domain | Models / services |
|--------|-------------------|
| tenant, user, course, group, dashboard | Core LMS |
| automation | `Automation`, `AutomationRun`, bridge |
| billing | `TenantSubscription`, Stripe |
| marketplace | `AutomationTemplate`, usage |
| listing | `BusinessListing`, `EmailNotificationLog` |

Full API catalog: `docs/API_REFERENCE.md`

### Environment Variables (apps/api)

| Variable | Example | Purpose |
|----------|---------|---------|
| `PORT` | `4000` | Server port |
| `MONGODB_URI` | `mongodb://admin:password123@localhost:27017/luxgen_dev?authSource=admin` | MongoDB connection |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `JWT_SECRET` | `your-secret-here` | JWT signing key |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Stripe billing + listings |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Webhook signature |
| `BILLING_DEV_MODE` | `true` | Dev billing shortcuts |
| `EMAIL_PROVIDER` | `console` | Listing notification emails |
| `WEB_APP_URL` | `http://localhost:3000` | Links in emails |
| `JOBS_API_KEY` | `dev-jobs-key` | Cron job auth |

See `apps/api/.env.example` for full list.

---

## Shared Packages

### @luxgen/ui (`packages/ui/src/`)

Key exports to use in pages:

| Export | Description |
|--------|-------------|
| `AppLayout` | Main dashboard layout (sidebar + navbar + content) |
| `getDefaultSidebarSections()` | Returns nav sections including Developer > Agent Studio |
| `getDefaultUser()` | Returns a default user object for development |
| `getDefaultLogo()` | Returns the LuxGen logo config |
| `SnackbarProvider` | Toast notification context (wrap every page) |
| `useSnackbar()` | `{ showSuccess, showError, showInfo, showWarning }` |
| `AdminDashboardLayout` | Full admin dashboard (used by dashboard.tsx) |
| `LoginForm` | Login form component |
| `RegisterVisual` | Right-panel illustration for auth pages |
| `TenantDebug` | Dev-only tenant info overlay |
| `GroupCard` | Group list/grid card component |
| `CourseMenu` | Course navigation menu |

### @luxgen/db (`packages/db/src/`)

Mongoose models: `User`, `Tenant`, `Course`, `Group`, `Automation`, `AutomationRun`, `AutomationTemplate`, `TenantSubscription`, `TenantUsageMonthly`, `BusinessListing`, `EmailNotificationLog`, `AgentTask`, `AgentAuditEntry`

### @luxgen/billing (`packages/billing/`)

- Plan tiers (Free → Enterprise), feature flags, usage limits
- `assertFeature(plan, feature)` — throws `PLAN_UPGRADE_REQUIRED`
- Used by API resolvers, automation bridge, agent routes

### @luxgen/agent (`packages/agent/`)

- Agent orchestrator, git worktree pipeline, validation
- Automation bridge: `src/automation/bridge.ts`, `events.ts`
- Consumed by `apps/web/pages/api/agent/*` and `apps/agent-worker`

### @luxgen/auth (`packages/auth/src/`)

- `signToken(payload)` → JWT string
- `verifyToken(token)` → decoded payload

---

## Agent Studio — How It Works

Agent logic lives in **`@luxgen/agent`** (`packages/agent/`). Web exposes SSE and git endpoints:

| File | Role |
|------|------|
| `packages/agent/` | Orchestrator, tools, git pipeline, validation, automation bridge |
| `apps/web/pages/api/agent/chat.ts` | SSE streaming → Ollama (Enterprise gate) |
| `apps/web/pages/api/agent/*` | Health, stage, apply, commit, merge |
| `apps/web/components/agent/` | Chat UI, diff viewer |
| `apps/web/pages/agent.tsx` | `/agent` page |
| `apps/agent-worker/` | Redis queue worker for headless jobs |

**Plan gate:** Enterprise (`agentStudio` feature).

Full docs: `AGENT_STUDIO.md`, `docs/AGENT_STUDIO_ARCHITECTURE.md`, `skills/ai-studio/SKILL.md`

---

## Development Commands

```bash
make help            # all available commands
make setup           # first-time: env files + npm install + infra
make dev             # start web + api locally (fastest — infra must be running)
make dev-infra       # start MongoDB + Redis + Ollama in Docker
make build           # turbo build all apps + packages
npm run build:web    # build web only (Vercel CI)
npm run build:api    # build API only (Render CI)
```

Deploy: see `docs/deployment/FREE_TIER_CLOUD.md` and `deploy/` configs.

**To start dev servers without Docker** (fastest):
```bash
# Terminal 1:
cd apps/web && npx next dev -p 3000

# Terminal 2:
cd apps/api && npm run dev
```

---

## How to Add a New Feature

### New page (e.g. `/settings`)

1. `read_file apps/web/pages/groups/index.tsx` — use as template
2. Create `apps/web/pages/settings.tsx` using the Standard Page Template above
3. Add to sidebar: `read_file packages/ui/src/Layout/DefaultNavigation.tsx`, add entry to `getDefaultSidebarSections()`

### New GraphQL query

1. `read_file apps/web/graphql/queries/dashboard.ts` — follow the gql`` pattern
2. Create `apps/web/graphql/queries/settings.ts` with your query
3. Use `useQuery` in your page component

### New API route

1. Create `apps/web/pages/api/your-feature.ts`
2. Handler signature: `export default async function handler(req: NextApiRequest, res: NextApiResponse)`
3. Pattern: `if (req.method === 'GET') { ... } else { res.status(405).end(); }`

### New GraphQL domain (backend)

1. Read `skills/graphql/SKILL.md`
2. Model in `packages/db/src/` if new persistence
3. Service in `apps/api/src/services/<name>Service.ts`
4. `apps/api/src/schema/<domain>/typeDefs.ts` + `resolvers.ts`
5. Register in `apps/api/src/schema/index.ts`
6. Client query in `apps/web/graphql/queries/<domain>.ts`
7. Update `docs/API_REFERENCE.md`

### New GraphQL resolver (legacy note)

Prefer the domain folder pattern above over flat `resolvers/`.

---

## Known Issues

| Issue | Location | Status |
|-------|----------|--------|
| 120 TypeScript errors in `@luxgen/ui` | `packages/ui/src/` | Pre-existing; UI build skipped (`echo 'Skipping...'`) |
| `typescript.ignoreBuildErrors: true` | `apps/web/next.config.js` | Must disable after fixing TS errors |
| `groups/[id].tsx` uses mock setTimeout | `apps/web/pages/groups/[id].tsx` | Replace with real GraphQL query |
| `groups/dashboard.tsx` uses hardcoded data | `apps/web/pages/groups/dashboard.tsx` | Replace with real GraphQL query |
| `UserRetention` SVG NaN warning | `packages/ui/src/UserRetention/` | NaN passed for SVG circle cx/cy/r |

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Pages | `kebab-case.tsx` | `agent-settings.tsx` |
| Components | `PascalCase.tsx` | `AgentChat.tsx` |
| Hooks | `use-kebab-case.ts` | `use-agent-session.ts` |
| Utilities | `camelCase.ts` | `transformer.ts` |
| GraphQL queries | `camelCase.ts` in `graphql/queries/` | `dashboard.ts` |
| API routes | `kebab-case.ts` in `pages/api/` | `agent-health.ts` |

---

## Documentation & skills

| Path | Purpose |
|------|---------|
| `docs/INDEX.md` | Master documentation index |
| `docs/FEATURE_CATALOG.md` | Per-feature reference |
| `docs/BUSINESS_TECH_TRANSLATION.md` | Business ↔ tech mapping |
| `skills/*/SKILL.md` | Domain task guides for agents |

---

## Ports

| Service | Port | URL |
|---------|------|-----|
| Next.js (web) | 3000 | http://localhost:3000 |
| GraphQL API | 4000 | http://localhost:4000/graphql |
| MongoDB | 27017 | (internal) |
| Redis | 6379 | (internal) |
| Ollama | 11434 | http://localhost:11434 |
| Mongo Express (dev) | 8081 | http://localhost:8081 |
| Redis Commander (dev) | 8082 | http://localhost:8082 |

---

## Tenant URLs (local dev)

| Tenant | Query param URL | Subdomain URL (needs /etc/hosts) |
|--------|----------------|----------------------------------|
| Demo | http://localhost:3000/dashboard?tenant=demo | http://demo.localhost:3000 |
| Idea-Vibes | http://localhost:3000/dashboard?tenant=idea-vibes | http://idea-vibes.localhost:3000 |

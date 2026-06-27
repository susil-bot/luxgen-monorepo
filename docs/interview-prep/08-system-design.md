# 08 — System Design

## High-level architecture

```mermaid
flowchart TB
  subgraph clients [Clients]
    Web[Next.js apps/web :3000]
    Mobile[Expo apps/mobile]
  end

  subgraph api_layer [API Layer]
    GQL[Apollo GraphQL :4000]
    REST[Express REST]
    WS[GraphQL Subscriptions]
  end

  subgraph workers [Workers]
    AW[agent-worker]
  end

  subgraph data [Data]
    Mongo[(MongoDB)]
    Redis[(Redis)]
  end

  subgraph external [External]
    Stripe[Stripe]
    Ollama[Ollama LLM]
  end

  Web --> GQL
  Web --> REST
  Web --> WS
  Mobile -.-> GQL
  GQL --> Mongo
  REST --> Mongo
  AW --> Redis
  AW --> Mongo
  REST --> Stripe
```

## Multi-tenancy design

```mermaid
flowchart LR
  Host[demo.localhost:3000] --> MW[middleware.ts]
  MW --> Query[?tenant=demo]
  Query --> Page[getTenantPageProps]
  Page --> GQL[GraphQL + x-tenant]
  GQL --> Resolver[tenantId filter]
  Resolver --> Mongo[(tenant-scoped data)]
```

**Critical:** JWT `tenant` claim is Mongo **ObjectId** — never compare to subdomain string directly.

## Auth flow

```mermaid
sequenceDiagram
  participant U as User
  participant W as Web
  participant A as API
  participant M as Mongo

  U->>W: login form
  W->>A: GraphQL login
  A->>M: verify user
  A-->>W: JWT + user
  W->>W: localStorage session
  W->>W: authSessionEpoch++
  Note over W: NavBar shows user menu
  U->>W: visit /dashboard
  W->>W: AuthGuard validateClientSession
```

## Component tree (typical admin page)

```mermaid
flowchart TD
  Page[dashboard.tsx] --> Layout[AdminDashboardLayout]
  Layout --> AppLayout[AppLayout from ui]
  AppLayout --> Nav[NavBar]
  AppLayout --> Side[Sidebar]
  AppLayout --> Main[AdminDashboard widgets]
```

## Database ER (simplified)

```mermaid
erDiagram
  Tenant ||--o{ User : has
  Tenant ||--o{ Course : has
  User ||--o{ Enrollment : has
  Course ||--o{ Enrollment : has
  Tenant ||--o{ Automation : has
  Tenant ||--|| TenantSubscription : billing
```

## Caching layers

| Layer | Technology |
|-------|------------|
| Browser | Apollo `InMemoryCache` |
| CDN | Static assets (Next) |
| API | Redis (agent queue, optional rate limits) |
| DB | Mongo indexes |

## CI/CD (`.github/workflows`)

- PR: build web + api
- Turborepo cache
- See `docs/deployment/` for cloud targets

## Design interview prompts

1. **Design a notification system** — use existing `notifications` routes + WebSocket
2. **Design multi-region tenancy** — shard by tenantId, read replicas
3. **Design rate limiting** — Redis sliding window per tenant
4. **Migrate Pages Router → App Router** — RSC boundaries, session cookies

## Scalability talking points

- Stateless API nodes behind load balancer
- WebSocket sticky sessions or Redis pub/sub for subscriptions
- Background jobs via `agent-worker` + Redis queue
- Mongo replica set for HA

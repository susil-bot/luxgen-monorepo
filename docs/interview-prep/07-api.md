# 07 — API Reference (Interview Edition)

## GraphQL endpoint

| Item | Value |
|------|-------|
| URL (dev) | `http://localhost:4000/graphql` |
| Playground | Same URL (Apollo) |
| Subscriptions | `ws://localhost:4000/graphql` |
| Web proxy | `/api/graphql` → API (next.config rewrites) |

## Authentication

| Header | Purpose |
|--------|---------|
| `Authorization: Bearer <JWT>` | User identity |
| `x-tenant` | Tenant context (with subdomain routing) |

JWT claims include `tenant` (Mongo **id**), `kid` for signing key rotation.

## Core GraphQL domains

| Domain | Typical operations |
|--------|-------------------|
| user | login, register, users, updateUser |
| course | courses, course, createCourse |
| enrollment | enrollments, orderRows |
| dashboard | getDashboardData |
| billing | tenantBilling, checkout |
| automation | automations, toggle, runs |
| listing | business listings lifecycle |

Full reference: [docs/API_REFERENCE.md](../API_REFERENCE.md)

## REST routes (Express)

### Health

```
GET /health → { status: 'OK', timestamp }
```

### Auth (`/api/auth`)

- Login, register — returns JWT
- **Interview:** password hashed with bcrypt (`@luxgen/auth`)

### Billing (`/api/billing`)

- Stripe checkout session
- `POST /api/billing/webhook` — raw body, signature verify

### Tenant (`/api/tenant`)

- Branding, regional settings, storefront config

## Next.js API routes (apps/web)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/users/me` | GET | Session user from JWT cookie/header |
| `/api/users/avatar` | POST | Avatar upload |
| `/api/search` | GET | Search redirect stub |
| `/api/agent/chat` | POST | SSE agent stream |
| `/api/health` | GET | Web health |

## Error codes (typical)

| Code | When |
|------|------|
| 401 | Missing/invalid JWT |
| 403 | Wrong tenant, insufficient role |
| 404 | Entity not found |
| 429 | Rate limit (`tenantRateLimitMiddleware`) |
| 500 | Unhandled resolver error |

## Example flow: Login

```mermaid
sequenceDiagram
  participant UI as LoginForm
  participant GQL as GraphQL login mutation
  participant API as apps/api
  participant DB as MongoDB

  UI->>GQL: LOGIN_MUTATION(email, password)
  GQL->>API: resolver
  API->>DB: User.findOne({ email, tenantId })
  API->>API: verifyPassword
  API-->>UI: { token, user }
  UI->>UI: persistSession()
  UI->>UI: luxgen-auth-change event
```

## Example flow: Orders list (optimized)

```mermaid
sequenceDiagram
  participant Page as orders/index
  participant GQL as orderRows query
  participant API as orderRowsService
  participant DB as MongoDB

  Page->>GQL: GET_ORDER_ROWS (cache-first)
  GQL->>API: single resolver
  API->>DB: pre-joined query
  API-->>Page: OrderRow[]
```

## Interview questions per API style

**REST:** Idempotency keys, versioning, HATEOAS (usually no in internal APIs)  
**GraphQL:** N+1, query depth limits, field-level auth, subscriptions scale

## Validation

- GraphQL input types + resolver checks
- Mongoose schema validation on write
- Never trust client-only `PlanGate` — API must enforce plans

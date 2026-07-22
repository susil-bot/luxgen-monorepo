# Skill: GraphQL Platform

**Domain:** New API domains, resolvers, client queries, mobile-ready contract.  
**Docs:** [GRAPHQL_PLATFORM.md](../../docs/GRAPHQL_PLATFORM.md), [API_REFERENCE.md](../../docs/API_REFERENCE.md)

---

## Principle

**One GraphQL API** for web, future mobile (Phase 8), and integrations. Avoid parallel REST unless webhooks, SSE, or file upload require it.

---

## Adding a domain

1. **Model** — `packages/db/src/<entity>.ts`, export from `index.ts`
2. **Service** — `apps/api/src/services/<entity>Service.ts` (business logic)
3. **Schema**
   - `apps/api/src/schema/<domain>/typeDefs.ts`
   - `apps/api/src/schema/<domain>/resolvers.ts`
4. **Register** — merge in `apps/api/src/schema/index.ts`
5. **Client** — `apps/web/graphql/queries/<domain>.ts`
6. **Doc** — add section to [API_REFERENCE.md](../../docs/API_REFERENCE.md)

---

## Resolver pattern

```ts
// Thin resolver — delegate to service
Mutation: {
  createThing: async (_, { input }, ctx) => {
    const plan = await getEffectivePlan(ctx.tenantId);
    assertFeature(plan, 'requiredFeature'); // if gated
    return thingService.create({ ...input, tenantId: ctx.tenantId });
  },
},
```

---

## Auth & tenant

- JWT in `Authorization: Bearer`
- Tenant: subdomain middleware or `x-tenant` header
- Always scope queries by `tenantId`

---

## Error extensions

Use GraphQL `extensions.code`:

- `PLAN_UPGRADE_REQUIRED`
- `USAGE_LIMIT_EXCEEDED`

Client can show upgrade UI on these codes.

---

## Existing domains

`tenant`, `user`, `course`, `group`, `dashboard`, `automation`, `billing`, `marketplace`, `listing`

See [ARCHITECTURE.md](../../docs/ARCHITECTURE.md) § GraphQL domains.

---

## Playground

`http://localhost:4000/graphql` when `APOLLO_INTROSPECTION=true`

---

## Do not

- Put Mongoose calls directly in resolvers for complex flows
- Break backward compatibility without mobile coordination (Phase 8)

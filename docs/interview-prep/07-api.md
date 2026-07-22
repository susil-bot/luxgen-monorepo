# 07 — API (GraphQL + REST)

> **Junior Q&A:** [15-junior-qa-mern.md](./15-junior-qa-mern.md) — sections **GRAPHQL** and **AUTH**.

## Dev URLs

| Service | URL |
|---------|-----|
| GraphQL HTTP | `http://localhost:4000/graphql` |
| GraphQL WS | `ws://localhost:4000/graphql` |
| Web app | `http://localhost:3000` |

## Headers (web → API)

| Header | Value |
|--------|--------|
| `Authorization` | `Bearer <JWT>` — `client.ts:74` |
| `x-tenant` | Subdomain from host — `client.ts:75` |

## Core domains (GraphQL)

`user`, `course`, `enrollment`, `dashboard`, `billing`, `automation` — see `apps/api/src/schema/index.ts`.

★ Deep dives: [apps-api-src-context-ts.md](../file-analysis/apps-api-src-context-ts.md) · [apps-web-graphql-client-ts.md](../file-analysis/apps-web-graphql-client-ts.md)

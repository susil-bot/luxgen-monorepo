# 05 — Node.js & Express (LuxGen)

> **Junior Q&A:** [15-junior-qa-mern.md](./15-junior-qa-mern.md) — sections **NODE & EXPRESS** and **GRAPHQL**.

## Hot files

| File | Lines to read |
|------|----------------|
| `apps/api/src/app.ts` | 43-50 helmet/cors; middleware imports 17-25 |
| `apps/api/src/index.ts` | Server start + Mongo connect |
| `apps/api/src/middleware/auth.ts` | JWT → `req.user` |
| `apps/api/src/middleware/tenantRouting.ts` | Subdomain → `req.tenantId` |

## Remember for interviews

1. Middleware order: security → body parser → tenant → auth → handler  
2. Express = `(req, res, next)` pipeline  
3. GraphQL context copies from `req` — `apps/api/src/context.ts:21-34`

★ Deep dive: [apps-api-src-app-ts.md](../file-analysis/apps-api-src-app-ts.md)

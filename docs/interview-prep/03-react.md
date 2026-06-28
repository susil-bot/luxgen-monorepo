# 03 — React (LuxGen)

> **Junior interview prep:** use the Q&A notebooks with file:line citations.

| Doc | Topics |
|-----|--------|
| **[14-junior-qa-react.md](./14-junior-qa-react.md)** | JSX, hooks, context, routing, Apollo, AuthGuard, NavBar |
| **[15-junior-qa-mern.md](./15-junior-qa-mern.md)** | Node, GraphQL, MongoDB, session, tenancy |

## Hot files (read in order)

1. `apps/web/pages/_app.tsx` — providers + AuthGuard  
2. `apps/web/components/auth/AuthGuard.tsx` — route protection  
3. `apps/web/graphql/client.ts` — Apollo auth link  
4. `packages/ui/src/NavBar/NavBar.tsx` — guest vs user menu  
5. `apps/web/lib/use-sidebar-sections.ts` — role-based nav  

## Senior-only

- Provider order diagram → [08-system-design.md](./08-system-design.md)  
- File deep dives → [file-analysis/](../file-analysis/) (★ hand-enriched)  
- Mock interviews → [11-mock-interviews.md](./11-mock-interviews.md)

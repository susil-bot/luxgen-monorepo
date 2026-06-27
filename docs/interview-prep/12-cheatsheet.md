# 12 — Live Interview Cheatsheet (One-Pager)

## React (30 sec each)

- **Virtual DOM:** JS representation; diff → patch real DOM  
- **Reconciliation:** Keys identify list items; avoid index keys when reordering  
- **useEffect deps:** All values from component scope that change behavior  
- **useMemo:** Cache expensive compute; not for every array `.filter`  
- **Context:** Prop drilling fix; re-renders all consumers on change  
- **Controlled input:** value + onChange in React state  

## JavaScript

- **Event loop:** call stack → microtasks (Promises) → macrotasks (setTimeout)  
- **Closure:** function + lexical env (router in `createHandleUserAction`)  
- **`==` vs `===`:** always `===`  
- **Spread:** shallow copy top level only  

## Node

- **Middleware:** `(req,res,next)` pipeline; order matters  
- **JWT:** header.payload.signature; verify server-side  
- **Cluster:** fork workers per CPU; shared nothing  

## MongoDB

- **Index:** B-tree; compound index left-prefix rule  
- **Embed vs ref:** embed 1:few, ref 1:many growing  
- **ObjectId:** 12 bytes, includes timestamp  

## LuxGen specifics (memorize)

| Topic | Fact |
|-------|------|
| Ports | Web 3000, API 4000 |
| Router | Next Pages Router |
| Session keys | authToken, currentUser, authSessionEpoch |
| Guest UI | `user={undefined}` on AppLayout |
| Tenant in JWT | Mongo id, not subdomain |
| Plan gates | client PlanGate + server enforcement |

## STAR opener

"In LuxGen, a multi-tenant LMS monorepo, I owned [X]. The constraint was [Y]. I [action]. Result: [metric]."

## Questions to ask them

1. How do you deploy frontend and API?  
2. GraphQL vs REST split on the team?  
3. On-call rotation for production Mongo/Redis?  

## Red flags to avoid

- Fabricating users when unauthenticated  
- Importing Mongoose in React client bundle  
- `fetchPolicy: 'network-only'` everywhere without reason  
- Index keys in dynamic lists  

## Night-before checklist

- [ ] Read [01-project-overview](./01-project-overview.md)  
- [ ] Skim [08-system-design](./08-system-design.md) diagrams  
- [ ] Rehearse login + tenant flow out loud  
- [ ] Open [file-analysis/INDEX.md](../file-analysis/INDEX.md) for file lookup  

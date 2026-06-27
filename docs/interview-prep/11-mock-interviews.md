# 11 — Mock Interviews

## Module A: React + Auth

**Interviewer:** Walk me through what happens when a user logs in on your dashboard.

**Strong answer:** LoginForm submits GraphQL mutation → API validates bcrypt → returns JWT → `persistSession` writes `authToken`, `currentUser`, expiry → `luxgen-auth-change` fires → LayoutUserProvider updates → NavBar switches from Login to user menu → AuthGuard allows `/dashboard`.

**Follow-up:** What if JWT expires while user is on the page?  
**Answer:** SessionMonitor / validateClientSession clears storage and redirects with `reason=session_expired`.

**Red flag:** "We store user in context only" without server validation.

---

## Module B: Multi-tenancy

**Interviewer:** How do you prevent tenant A from seeing tenant B's data?

**Strong answer:** Subdomain resolves tenant → JWT includes tenant Mongo id → every GraphQL resolver filters by `context.tenantId` → never trust client subdomain alone against JWT claim.

**Follow-up:** Super admin switching tenants?  
**Answer:** `SuperAdminTenantSwitchProvider` + full navigation to target subdomain URL.

---

## Module C: GraphQL vs REST

**Interviewer:** Why GraphQL for this product?

**Strong answer:** Single endpoint for web + mobile, typed schema, subscriptions for notifications, colocated queries per page; REST kept for webhooks and simple health/auth routes.

**Red flag:** "GraphQL is always better" without mentioning N+1, caching complexity.

---

## Module D: Performance

**Interviewer:** Orders page was slow. What did you do?

**Strong answer:** Replaced 3 client queries with `orderRows` server join; `cache-first` for stable data; virtualized rows with `@tanstack/react-virtual`; memoized row component.

---

## Module E: Debugging production

**Interviewer:** `OverwriteModelError: Cannot overwrite Tenant model`

**Strong answer:** Stale compiled `.js` alongside `.ts` double-registered Mongoose models + accidental `@luxgen/db` import in web bundle via auth; fixed by deleting stale JS, `mongoose.models` guard, decoupling roles enum.

---

## Module F: System design

**Interviewer:** Design real-time notifications for 100k users.

**Outline:** Event bus → Redis pub/sub → WS gateway per region → GraphQL subscription or SSE fallback → persist in Mongo → mark read API → rate limit per user.

---

## Behavioral

- **Conflict:** Feature vs bug PR policy — separate `feat/` and `fix/` branches.  
- **Mentoring:** UI audit checklist 200 items, incremental PRs.  
- **Failure:** Session bug → documented auth-session rules in `.cursor/rules`.

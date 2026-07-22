# MCP Apps — Interactive Chat UI for LuxGen

> **Type:** Feature Discovery Document  
> **Date:** 2026-06-20  
> **Status:** Feasibility approved — spike pending (no MCP server in repo yet)  
> **Scope:** Embed interactive HTML (progress dashboards, forms, analytics) inside MCP hosts (Cursor, Claude Desktop, etc.) instead of text-only tool results

Related: [AGENT_STUDIO_ARCHITECTURE.md](../docs/AGENT_STUDIO_ARCHITECTURE.md) · [GRAPHQL_PLATFORM.md](../docs/GRAPHQL_PLATFORM.md) · [PERSONA_PAGES.md](../docs/PERSONA_PAGES.md) · Sprint 1 PRs [#49–#52](https://github.com/susil-bot/luxgen-monorepo/pulls)

---

## 1. Executive summary

| Question                   | Answer                                                                                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What are MCP Apps?**     | MCP tools that declare a `ui://` resource; the host renders a sandboxed iframe in chat with bidirectional JSON-RPC over `postMessage`.                                                      |
| **Does LuxGen need them?** | **Optional enhancement** — not a Tier 1 blocker. Web routes (`/customers`, `/learn`, `/analytics`) remain the canonical product surface.                                                    |
| **When do they win?**      | Agent-driven workflows where context, tool calls, and host integrations must stay in-thread (e.g. “show my learning progress” → interactive chart → “mark complete” without opening a tab). |
| **Current repo state**     | No `@modelcontextprotocol/*` packages, no MCP server app, no `ui://` resources. GraphQL API at `apps/api` is ready to back apps.                                                            |
| **Recommended first app**  | **Learner progress dashboard** — reuses `studentEnrollments`, `markCourseComplete`, `studentCertificates` (Sprint 1 stack).                                                                 |
| **Effort (first app)**     | ~3–5 days spike: MCP server package + one tool + bundled HTML UI + Cursor config.                                                                                                           |

---

## 2. MCP App vs LuxGen web app

Text and links work for documentation; some user tasks need **interaction inside the conversation**.

| Property                | Web app (current)                                     | MCP App                                                          |
| ----------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| **Context**             | User navigates to `/customers`, `/learn/courses/[id]` | UI lives in the chat thread that triggered it                    |
| **Data**                | Apollo + GraphQL from Next.js                         | App calls MCP tools; host forwards to server (or pushes results) |
| **Auth**                | JWT in `localStorage`, tenant subdomain               | Host passes session / tool context; server validates per call    |
| **Deep links & mobile** | Full support (Phase 8 Expo)                           | Host-dependent; not a replacement for mobile                     |
| **Security**            | Same-origin Next.js + API                             | Sandboxed iframe; no parent DOM/cookie access                    |
| **Best for**            | Product UI, admin CRUD, storefront                    | Agent copilots, quick actions, exploratory data views            |

**Rule of thumb:** If the feature needs bookmarks, SEO, or a standalone mobile screen → **web page**. If the feature is “the agent showed me X and I acted on it in one thread” → **MCP App**.

---

## 3. How MCP Apps work (LuxGen mapping)

```
User          Host (Cursor)        MCP App iframe       LuxGen MCP Server      GraphQL API
  │                │                      │                      │                    │
  │ "show progress"│                      │                      │                    │
  │───────────────>│  tools/call        │                      │                    │
  │                │─────────────────────────────────────────>│  resolver/service  │
  │                │                      │                      │───────────────────>│
  │                │  tool result + UI    │                      │<───────────────────│
  │                │─────────────────────>│  render sandbox      │                    │
  │                │                      │  ui/initialize       │                    │
  │  clicks        │                      │  tools/call (progress)                    │
  │───────────────>│─────────────────────>│─────────────────────>│───────────────────>│
  │                │  fresh data push     │<─────────────────────│                    │
  │<───────────────│                      │                      │                    │
```

### Core primitives

1. **Tool** with `_meta.ui.resourceUri` (e.g. `ui://luxgen/learner-progress`)
2. **UI resource** — HTML + JS bundle served by the MCP server
3. **Host** — preloads UI, sandbox iframe, `postMessage` JSON-RPC (`ui/*` + shared `tools/call`)
4. **Server transport** — stdio (local) or Streamable HTTP (`/mcp`) for remote hosts

LuxGen already has the **backend contract** (GraphQL). MCP Apps add a **presentation layer for agents**, not a second API.

---

## 4. Candidate LuxGen MCP Apps (prioritized)

| Priority | App                       | MCP tool name              | Data source (existing)                      | User                |
| -------- | ------------------------- | -------------------------- | ------------------------------------------- | ------------------- |
| **P0**   | Learner progress          | `show_learner_progress`    | `studentEnrollments`, `studentCertificates` | Learner / student   |
| **P0**   | Mark course complete      | `mark_course_complete`     | `markCourseComplete` mutation               | Learner             |
| **P1**   | Enrollment summary        | `show_enrollment_status`   | `enrollment(courseId, studentId)`           | Learner             |
| **P1**   | Analytics snapshot        | `show_analytics_dashboard` | Dashboard GraphQL (Pro gate)                | Admin / analyst     |
| **P2**   | Order / enrollment review | `review_enrollment`        | `enrollments`, `updateOrder`                | Admin               |
| **P2**   | Automation status         | `show_automation_runs`     | Automation domain                           | Operator            |
| **P3**   | Storefront product picker | `browse_store_products`    | `storefrontProducts`                        | Learner (GPT Store) |
| **P3**   | Agent task diff viewer    | `show_agent_diff`          | `@luxgen/agent` staging                     | Developer           |

### P0 detail — Learner progress dashboard

**Trigger phrases:** “Show my courses”, “What’s my progress?”, “Am I done with X?”

**UI elements:**

- Progress bars per enrollment (reuse patterns from `/customers`)
- “Mark complete” / “+25% progress” buttons → `markCourseComplete` / `updateEnrollmentProgress`
- Certificate badge when `learningStatus === COMPLETED`
- Link-out button: `openLink` host capability → `https://demo.localhost:3000/customers` (optional)

**Why first:** Sprint 1 (#49–#52) already implements the GraphQL layer; this app proves end-to-end MCP value without new domain models.

---

## 5. Architecture proposal

### 5.1 New package (recommended)

```
packages/mcp-server/          # or apps/mcp-server/
├── src/
│   ├── index.ts              # startStreamableHTTPServer / stdio (user snippet pattern)
│   ├── server.ts             # McpServer factory, register tools + resources
│   ├── tools/
│   │   ├── learner-progress.ts
│   │   └── mark-complete.ts
│   ├── resources/
│   │   └── ui/
│   │       ├── learner-progress.html   # or Vite bundle → single HTML
│   │       └── learner-progress.js
│   └── graphql-client.ts     # Server-side GraphQL to apps/api (JWT from tool context)
├── package.json
└── tsconfig.json
```

**Dependencies:** `@modelcontextprotocol/sdk`, `@modelcontextprotocol/ext-apps` (optional `App` wrapper), existing `@luxgen/db` only if bypassing GraphQL for reads (prefer GraphQL for parity with web).

### 5.2 Auth & tenant

| Approach                                                    | Pros                            | Cons                                     |
| ----------------------------------------------------------- | ------------------------------- | ---------------------------------------- |
| **A. GraphQL with user JWT** passed in tool args / host env | Same auth as web; tenant-scoped | Host must supply token; never log tokens |
| **B. Service account + `studentId` in tool input**          | Simple for demos                | Weaker; admin-only                       |
| **C. OAuth via host** (future)                              | Production-grade                | Host-specific                            |

**Recommendation:** Start with **A** — MCP tool accepts optional `authToken`; server forwards `Authorization: Bearer` to `http://localhost:4000/graphql`. Document in Cursor `mcp.json` env vars for dev only.

### 5.3 Transport

| Mode                                      | Use case                                          |
| ----------------------------------------- | ------------------------------------------------- |
| **stdio**                                 | Local Cursor / Claude Desktop dev                 |
| **Streamable HTTP** (`PORT=3001`, `/mcp`) | Remote agents, CI smoke, future cloud MCP gateway |

User-provided bootstrap pattern (`createMcpExpressApp` + stateless `StreamableHTTPServerTransport`) fits LuxGen; wire `createServer()` to LuxGen tool registrations.

---

## 6. Security model (non-negotiable)

MCP Apps run in a **sandboxed iframe**. LuxGen server must still enforce:

1. **Tenant isolation** — every GraphQL call scoped by JWT tenant (same as [SECURITY_HARDENING.md](../docs/SECURITY_HARDENING.md))
2. **Tool authorization** — learners cannot call admin tools; resolvers already gate `studentEnrollments` / `markCourseComplete`
3. **CSP** — `_meta.ui.csp` whitelist for CDN scripts if not fully bundled
4. **No secrets in UI bundle** — API keys stay server-side; UI only gets session via host
5. **iframe permissions** — request microphone/camera only if needed (not for P0 apps)

---

## 7. Relationship to existing LuxGen surfaces

| Surface                     | Role after MCP Apps                                                     |
| --------------------------- | ----------------------------------------------------------------------- |
| `/customers`                | Canonical learner hub; MCP App is a **chat shortcut**                   |
| `/learn/courses/[id]`       | Full course detail + enroll; MCP App for **progress actions in thread** |
| `/developer`, `/agent`      | Agent Studio stays separate (coding agent, not MCP App host)            |
| `@luxgen/agent` automations | Can **invoke** MCP tools headlessly where host supports it (Phase 2+)   |
| Mobile (Phase 8)            | Native screens; no MCP iframe on device                                 |

MCP Apps **complement** Sprint 1 — they do not replace merged PRs #49–#52.

---

## 8. Phased rollout

| Phase                | Deliverable                                                            | Depends on                |
| -------------------- | ---------------------------------------------------------------------- | ------------------------- |
| **0 — Spike**        | `packages/mcp-server` with `show_learner_progress` + static HTML chart | Sprint 1 GraphQL merged   |
| **1 — Actions**      | Mark complete / bump progress from iframe                              | #52 patterns              |
| **2 — Admin**        | Analytics snapshot app (Pro gate)                                      | Plan gate in tool handler |
| **3 — GPT Store**    | Product browse + recommend in chat                                     | Storefront API            |
| **4 — Agent Studio** | Diff viewer MCP App for staged changes                                 | `@luxgen/agent`           |

### Phase 0 task list (spike)

- [ ] Add `packages/mcp-server` with SDK + stdio entry
- [ ] Register tool `show_learner_progress` with `_meta.ui.resourceUri: ui://luxgen/learner-progress`
- [ ] Register `ui://luxgen/learner-progress` resource (bundled HTML)
- [ ] Implement GraphQL client calling `studentEnrollments` on localhost API
- [ ] Document Cursor `.cursor/mcp.json` snippet
- [ ] Manual test: ask agent → iframe renders → data matches `/customers`

---

## 9. Framework & implementation notes

- **`@modelcontextprotocol/ext-apps` `App` class** — convenience wrapper for `ui/initialize`, `tools/call`; optional.
- **Raw postMessage** — valid for minimal spikes; more control, more boilerplate.
- **UI build** — Vite single-file bundle inlined in resource, or plain HTML + vanilla JS for P0.
- **React in iframe** — possible (e.g. `@modelcontextprotocol/server-basic-react` pattern); adds bundle size; consider for P1 analytics.

Example tool registration shape (illustrative):

```typescript
server.registerTool(
  'show_learner_progress',
  {
    description: "Show the learner's enrolled courses and progress as an interactive dashboard",
    inputSchema: { type: 'object', properties: { tenantId: { type: 'string' }, studentId: { type: 'string' } } },
    _meta: { ui: { resourceUri: 'ui://luxgen/learner-progress' } },
  },
  async (args) => {
    const enrollments = await gql(STUDENT_ENROLLMENTS, args);
    return { content: [{ type: 'text', text: `${enrollments.length} courses` }], structuredContent: { enrollments } };
  },
);
```

Host pushes `structuredContent` to the iframe when tool completes; app renders bars and buttons.

---

## 10. Risks & mitigations

| Risk                                                  | Mitigation                                                                                         |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Host support varies (not all clients render MCP Apps) | Keep web UI canonical; MCP as progressive enhancement                                              |
| Auth token exposure in chat logs                      | Server-side token exchange or short-lived MCP session tokens (future)                              |
| Duplicate UI logic (web + MCP)                        | Shared `@luxgen/types` + copy minimal presentation; extract chart components to `@luxgen/ui` later |
| GraphQL vs direct DB in MCP server                    | **Always GraphQL** for write paths; same validation as web                                         |
| Sprint 1 stack not merged                             | Spike can branch from `feat/web-mark-course-complete`; retarget after merge                        |

---

## 11. Decision log

| Date       | Decision                                           | Rationale                                                |
| ---------- | -------------------------------------------------- | -------------------------------------------------------- |
| 2026-06-20 | Document MCP Apps as **Phase 11 / agent UX** track | User exploration; not Tier 1 blocker                     |
| 2026-06-20 | First app = **learner progress**                   | Sprint 1 API ready; highest demo value                   |
| 2026-06-20 | New `packages/mcp-server`, not inside `apps/web`   | Separate transport lifecycle; no Next.js bundle coupling |
| 2026-06-20 | GraphQL-backed tools, not Mongoose in MCP server   | Tenant isolation + single source of truth                |

---

## 12. References

- [Model Context Protocol — Apps overview](https://modelcontextprotocol.io) (host rendering, `ui/*` protocol)
- `@modelcontextprotocol/sdk` — server, stdio, Streamable HTTP
- `@modelcontextprotocol/ext-apps` — iframe `App` helper
- LuxGen GraphQL enrollment/certificate fields — PRs #49, #51
- LuxGen learner web UX — PRs #50, #52

---

## 13. Open questions

1. **Product:** Should LuxGen ship a hosted MCP endpoint (`mcp.luxgen.app`) for tenants, or only document self-hosted stdio for Cursor?
2. **Billing:** Are MCP tool calls metered like automation runs (Phase 10 usage)?
3. **Mobile:** Any MCP-like embed for Expo, or web-only + native screens only?
4. **GPT Store:** Should the GPT sales assistant (`GptSalesAssistant`) eventually be an MCP App instead of inline React?

_Update this doc when Phase 0 spike lands or when a host integration is chosen for production._

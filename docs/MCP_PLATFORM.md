# LuxGen MCP Platform

> **Status:** Phase 5 (PRs 25–27) — HTTP transport, rate limits, Render deploy  
> **Audience:** Developers integrating AI clients with LuxGen GraphQL and Tower automations

---

## 1. What MCP is in LuxGen

**Model Context Protocol (MCP)** lets AI hosts (Cursor, Claude Desktop, custom agents) call **tools** exposed by a LuxGen MCP server. The server is a thin adapter over `apps/api` GraphQL — not a second backend.

| Layer           | Path                | Role                                                  |
| --------------- | ------------------- | ----------------------------------------------------- |
| MCP app         | `apps/mcp-server`   | Process entry, env, stdio (local) / HTTP (production) |
| MCP core        | `packages/mcp-core` | Tool registry, GraphQL client, error normalization    |
| Source of truth | `apps/api`          | GraphQL resolvers, tenant auth, plan gates            |

---

## 2. Local (Cursor) vs production

|                  | **Local stdio**                    | **Production HTTP** (Phase 5+) |
| ---------------- | ---------------------------------- | ------------------------------ |
| Transport        | Cursor spawns `apps/mcp-server`    | Hosted service on Render/Fly   |
| Config           | `.cursor/mcp.json`                 | API keys, TLS, rate limits     |
| Auth             | `LUXGEN_JWT` + `LUXGEN_TENANT` env | Per-tenant MCP API keys        |
| Filesystem tools | Never in LuxGen MCP                | Never                          |

**Same tool handlers** in `@luxgen/mcp-core`; only the transport adapter differs.

---

## 3. Phase 1 tools (shipped PRs 7–10)

| Tool                    | GraphQL                           | Description                              |
| ----------------------- | --------------------------------- | ---------------------------------------- |
| `list_automations`      | `automations(tenantId)`           | List tower automations for a tenant      |
| `get_automation`        | `automation(id)`                  | Single automation with flowDefinition    |
| `automation_runs`       | `automationRuns(tenantId, limit)` | Recent run history                       |
| `get_automation_schema` | `automationSchema`                | Trigger/action catalog for tower builder |

### Phase 2 tools (PRs 11–13)

| Tool               | GraphQL                 | Description                        |
| ------------------ | ----------------------- | ---------------------------------- |
| `get_tenant_usage` | `tenantUsage(tenantId)` | Plan limits, usage %, withinLimits |
| `list_enrollments` | `enrollments(tenantId)` | Read-only enrollment/order list    |
| `get_enrollment`   | `enrollmentById(id)`    | Single enrollment by id            |

### Phase 2 resources & prompts (PRs 14–15)

| Kind     | Name                    | URI / id                           |
| -------- | ----------------------- | ---------------------------------- |
| Resource | automation-flow-catalog | `luxgen://automation-flow/catalog` |
| Prompt   | tower-authoring         | Tower flowDefinition guide         |

### Phase 3 write tools (PRs 16–20)

| Tool                     | GraphQL            | Description                                |
| ------------------------ | ------------------ | ------------------------------------------ |
| `validate_tower_flow`    | local validation   | Validate flowDefinition before save        |
| `create_automation`      | `createAutomation` | Create tower from validated flowDefinition |
| `update_automation_flow` | `updateAutomation` | Replace flowDefinition + derived fields    |
| `toggle_automation`      | `toggleAutomation` | Enable or pause without editing flow       |
| `delete_automation`      | `deleteAutomation` | Delete (requires `confirm: true`)          |

### Phase 4 auth & audit (PRs 21–24)

| Capability | GraphQL / header                                   | Description                                      |
| ---------- | -------------------------------------------------- | ------------------------------------------------ |
| API keys   | `createMcpApiKey`, `revokeMcpApiKey`, `mcpApiKeys` | Business+ (`webhooks` gate); secret shown once   |
| Key auth   | Header `x-mcp-api-key`                             | Alternative to JWT for MCP server                |
| Scopes     | `read` / `write` on key                            | Write tools hidden/blocked without `write` scope |
| Audit      | `recordMcpToolAudit`, `mcpToolAuditLog`            | Append-only tool invocation log                  |

### Phase 5 HTTP transport (PRs 25–27)

| Capability       | Env / endpoint                                               | Description                                   |
| ---------------- | ------------------------------------------------------------ | --------------------------------------------- |
| Streamable HTTP  | `MCP_TRANSPORT=http`, `POST/GET/DELETE /mcp`                 | Stateful sessions via `mcp-session-id` header |
| Per-request auth | Headers `x-mcp-api-key` + `x-tenant`                         | No env JWT in production HTTP mode            |
| Rate limits      | `MCP_RATE_LIMIT_MAX` (default 120/min)                       | Per API key + IP; returns 429                 |
| Health           | `GET /health`                                                | Render / load-balancer probe                  |
| Deploy           | `apps/mcp-server/Dockerfile`, `deploy/platforms/render.yaml` | `luxgen-mcp` Render service                   |

---

## 4. Environment variables

| Variable                   | Required  | Example                                         |
| -------------------------- | --------- | ----------------------------------------------- |
| `LUXGEN_GRAPHQL_URL`       | Yes       | `http://localhost:4000/graphql`                 |
| `LUXGEN_JWT`               | One of    | Bearer token from login (dev)                   |
| `LUXGEN_MCP_API_KEY`       | One of    | `luxgen_mcp_…` from `createMcpApiKey`           |
| `LUXGEN_TENANT`            | Yes       | `demo` (subdomain for `x-tenant` header)        |
| `LUXGEN_MCP_SCOPES`        | No        | Override scopes (`read`, `write`) — stdio only  |
| `MCP_TRANSPORT`            | No        | `stdio` (default) or `http`                     |
| `MCP_HTTP_PORT`            | HTTP      | Default `3100` (falls back to `PORT` on Render) |
| `MCP_HTTP_HOST`            | HTTP      | Default `127.0.0.1` dev / `0.0.0.0` prod        |
| `MCP_HTTP_PATH`            | HTTP      | Default `/mcp`                                  |
| `MCP_RATE_LIMIT_MAX`       | HTTP      | Default `120` requests per window               |
| `MCP_RATE_LIMIT_WINDOW_MS` | HTTP      | Default `60000` (1 minute)                      |
| `MCP_ALLOWED_HOSTS`        | HTTP prod | Comma-separated Host header allowlist           |

---

## 5. Local development

```bash
# Terminal 1 — API
make dev-stack-api

# Terminal 2 — build and run MCP (stdio; Cursor connects)
npm run build:mcp
npm run dev:mcp
```

### HTTP mode (local smoke)

```bash
MCP_TRANSPORT=http MCP_HTTP_PORT=3100 npm run dev:mcp
curl -s http://127.0.0.1:3100/health
```

Production: deploy `luxgen-mcp` via [render.yaml](../deploy/platforms/render.yaml). Clients send `x-mcp-api-key` and `x-tenant` on the initialize request.

Cursor: copy `.cursor/mcp.json.example` → `.cursor/mcp.json`, set JWT from browser devtools / login.

---

## 6. Security invariants

1. GraphQL remains source of truth — MCP never writes to Mongo directly.
2. JWT or `x-mcp-api-key` + `x-tenant` on every GraphQL request.
3. No filesystem or repo tools on remote MCP (Agent Studio only, local dev).
4. Write tools (Phase 4+) require MCP API keys and plan gates.
5. Tool errors never leak stack traces when `NODE_ENV=production`.

---

## 7. Roadmap (30 PR plan)

| Phase | PRs   | Scope                                          |
| ----- | ----- | ---------------------------------------------- |
| **1** | 1–10  | Docs, scaffold, stdio, read automation tools   |
| **2** | 11–15 | Usage, enrollments, MCP resources/prompts ✅   |
| **3** | 16–20 | Write tools (tower flow persist) ✅            |
| **4** | 21–24 | API keys, scopes, audit log ✅                 |
| **5** | 25–27 | HTTP transport, rate limits, Render deploy ✅  |
| **6** | 28–30 | Enterprise `run_agent_task`, docs, smoke tests |

See [MCP_DEVELOPER_GUIDE.md](./MCP_DEVELOPER_GUIDE.md) for Cursor setup and troubleshooting.

---

## Related docs

- [GRAPHQL_PLATFORM.md](./GRAPHQL_PLATFORM.md) — headers and tenancy
- [AUTOMATION_FLOW_SCHEMA.md](./AUTOMATION_FLOW_SCHEMA.md) — tower flowDefinition
- [AGENT_STUDIO_ARCHITECTURE.md](./AGENT_STUDIO_ARCHITECTURE.md) — agent vs MCP boundary

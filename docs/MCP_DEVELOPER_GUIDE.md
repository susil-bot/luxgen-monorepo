# MCP Developer Guide

> Quick setup for LuxGen MCP in Cursor (Phase 1).

---

## Prerequisites

- API running: `make dev-stack-api`
- Valid JWT for a tenant user (login at `http://demo.localhost:3000/login`)
- Node 18+

---

## 1. Build MCP server

```bash
npm run build:mcp
```

---

## 2. Configure Cursor

Copy the example config:

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

Edit `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "luxgen": {
      "command": "node",
      "args": ["apps/mcp-server/dist/index.js"],
      "env": {
        "LUXGEN_GRAPHQL_URL": "http://localhost:4000/graphql",
        "LUXGEN_JWT": "<paste-token-without-Bearer-prefix>",
        "LUXGEN_TENANT": "demo"
      }
    }
  }
}
```

Reload Cursor MCP (Settings → MCP → restart `luxgen`).

---

## 3. Get a JWT

1. Log in to the web app for your tenant.
2. DevTools → Application → Local Storage → find auth token key used by the app, **or**
3. Network tab → any GraphQL request → copy `Authorization: Bearer …` value (without `Bearer `).

Token must match `LUXGEN_TENANT` subdomain or you will get `TENANT_MISMATCH`.

---

## 4. Smoke test (optional)

With API + env vars set:

```bash
make mcp-smoke
```

Uses `LUXGEN_JWT` or `LUXGEN_MCP_API_KEY`. Validates read tools, scope filtering, and optional agent task:

```bash
MCP_SMOKE_RUN_AGENT=1 make mcp-smoke   # requires Agent Studio plan
```

HTTP health (server must be running):

```bash
make mcp-http-smoke
# or: MCP_HTTP_URL=https://luxgen-mcp.onrender.com/health make mcp-http-smoke
```

---

## 5. Available tools

### Automations (Phase 1)

| Tool                    | Example prompt in Cursor                         |
| ----------------------- | ------------------------------------------------ |
| `list_automations`      | "List automations for tenant demo"               |
| `get_automation`        | "Get automation id abc123"                       |
| `automation_runs`       | "Show last 10 automation runs for demo"          |
| `get_automation_schema` | "What triggers and actions does LuxGen support?" |

### Commerce & usage (Phase 2)

| Tool               | Example prompt in Cursor                    |
| ------------------ | ------------------------------------------- |
| `get_tenant_usage` | "Show automation run usage for demo tenant" |
| `list_enrollments` | "List recent enrollments for demo"          |
| `get_enrollment`   | "Get enrollment id xyz"                     |

### Resources & prompts (Phase 2)

- **Resource:** `luxgen://automation-flow/catalog` — full compound catalog
- **Prompt:** `tower-authoring` — use when drafting `flowDefinition` JSON

### Tower writes (Phase 3)

| Tool                     | Example prompt in Cursor                               |
| ------------------------ | ------------------------------------------------------ |
| `validate_tower_flow`    | "Validate this flowDefinition JSON before I save it"   |
| `create_automation`      | "Create a tower from this flowDefinition"              |
| `update_automation_flow` | "Update automation {id} with this flowDefinition"      |
| `toggle_automation`      | "Pause automation {id}" / "Enable automation {id}"     |
| `delete_automation`      | "Delete automation {id}" (tool requires confirm: true) |

### Tower graph edits (incremental — prefer over full flow replace)

| Tool                     | Example prompt in Cursor                                       |
| ------------------------ | -------------------------------------------------------------- |
| `tower_insert_step`      | "After node t_abc, insert action commerce.order.update_fields" |
| `tower_move_step`        | "Move node a_xyz to follow node t_abc"                         |
| `tower_connect_nodes`    | "Connect condition c_1 true branch to action a_email"          |
| `tower_disconnect_nodes` | "Disconnect outgoing true edge from condition c_1"             |

All require **write** scope. Use `get_automation` first to read node ids from `flowDefinition`.

### Enterprise agent (Phase 6)

| Tool             | Example prompt in Cursor                            |
| ---------------- | --------------------------------------------------- |
| `run_agent_task` | "Run an agent task: summarize open automation runs" |

Requires **write** MCP scope and tenant **Agent Studio** plan (`agentStudio` feature). Returns `{ sessionId, status, jobId }`.

---

## 6. API keys (Phase 4)

Create a key via GraphQL (Business+ tenant, `webhooks` feature):

```graphql
mutation {
  createMcpApiKey(tenantId: "demo", name: "Cursor dev", scopes: [READ, WRITE]) {
    key {
      id
      keyPrefix
      scopes
    }
    secret
  }
}
```

Use in `.cursor/mcp.json`:

```json
"LUXGEN_MCP_API_KEY": "luxgen_mcp_…paste secret…"
```

Read-only keys (`scopes: [READ]`) cannot call write tools.

---

## 7. HTTP transport (Phase 5)

Run locally:

```bash
make dev-stack-api   # terminal 1
MCP_TRANSPORT=http npm run dev:mcp   # terminal 2 — listens on :3100/mcp
curl http://127.0.0.1:3100/health
```

Remote clients (Streamable HTTP) authenticate on the **initialize** request:

| Header          | Value                                                   |
| --------------- | ------------------------------------------------------- |
| `x-tenant`      | Tenant subdomain (`demo`)                               |
| `x-mcp-api-key` | `luxgen_mcp_…` secret                                   |
| `Accept`        | Must include `application/json` and `text/event-stream` |

Subsequent requests include `mcp-session-id` from the initialize response.

Rate limit: 120 requests/minute per key + IP (override with `MCP_RATE_LIMIT_MAX`).

Render deploy: see `deploy/platforms/render.yaml` service `luxgen-mcp`.

---

## 8. Tool summary (18 tools)

**Read:** `list_automations`, `get_automation`, `automation_runs`, `get_automation_schema`, `get_tenant_usage`, `list_enrollments`, `get_enrollment`, `validate_tower_flow`

**Write:** `create_automation`, `update_automation_flow`, `tower_insert_step`, `tower_move_step`, `tower_connect_nodes`, `tower_disconnect_nodes`, `toggle_automation`, `delete_automation`, `run_agent_task`

**Resource:** `luxgen://automation-flow/catalog` · **Prompt:** `tower-authoring`

---

## Troubleshooting

| Symptom                              | Fix                                                      |
| ------------------------------------ | -------------------------------------------------------- |
| `Authentication required`            | Set `LUXGEN_JWT` or `LUXGEN_MCP_API_KEY`                 |
| `Token is not valid for this tenant` | Align `LUXGEN_TENANT` with JWT tenant                    |
| `ECONNREFUSED`                       | Start API on port 4000                                   |
| HTTP `401` on `/mcp`                 | Send `x-tenant` + `x-mcp-api-key` on initialize          |
| HTTP `429`                           | Rate limit — wait or raise `MCP_RATE_LIMIT_MAX`          |
| MCP server not listed                | Check `apps/mcp-server/dist/index.js` exists after build |

---

## Next phases

The 30-PR MCP roadmap is complete. See [MCP_PLATFORM.md](./MCP_PLATFORM.md) § Roadmap for follow-ups (MCP Apps, OAuth).

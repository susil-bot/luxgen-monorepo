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

---

## 5. Available tools (Phase 1)

| Tool                    | Example prompt in Cursor                         |
| ----------------------- | ------------------------------------------------ |
| `list_automations`      | "List automations for tenant demo"               |
| `get_automation`        | "Get automation id abc123"                       |
| `automation_runs`       | "Show last 10 automation runs for demo"          |
| `get_automation_schema` | "What triggers and actions does LuxGen support?" |

---

## Troubleshooting

| Symptom                              | Fix                                                      |
| ------------------------------------ | -------------------------------------------------------- |
| `Authentication required`            | Set `LUXGEN_JWT`                                         |
| `Token is not valid for this tenant` | Align `LUXGEN_TENANT` with JWT tenant                    |
| `ECONNREFUSED`                       | Start API on port 4000                                   |
| MCP server not listed                | Check `apps/mcp-server/dist/index.js` exists after build |

---

## Next phases

HTTP production deploy and API keys: [MCP_PLATFORM.md](./MCP_PLATFORM.md) § Roadmap PRs 21–27.

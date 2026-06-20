# Skill: LuxGen MCP Platform

**Domain:** Model Context Protocol server, Cursor integration, GraphQL tool adapters.  
**Docs:** [docs/MCP_PLATFORM.md](../../docs/MCP_PLATFORM.md), [docs/MCP_DEVELOPER_GUIDE.md](../../docs/MCP_DEVELOPER_GUIDE.md)

---

## Key paths

| Layer       | Path                                                         |
| ----------- | ------------------------------------------------------------ |
| MCP app     | `apps/mcp-server/`                                           |
| Core        | `packages/mcp-core/`                                         |
| GraphQL ops | `packages/mcp-core/src/graphql/`                             |
| Tools       | `packages/mcp-core/src/tools/`                               |
| Resources   | `packages/mcp-core/src/resources/register.ts`                |
| Prompts     | `packages/mcp-core/src/prompts/register.ts`                  |
| API keys    | `apps/api/src/schema/mcp/`, `packages/db/src/mcp-api-key.ts` |
| Transport   | `packages/mcp-core/src/transport/`                           |
| Scopes      | `packages/mcp-core/src/tools/scopes.ts`                      |
| Rate limits | `packages/mcp-core/src/rate-limit.ts`                        |

---

## Rules

1. **GraphQL only** — MCP tools call `apps/api`, never Mongo directly.
2. **Auth** — `LUXGEN_JWT` or `LUXGEN_MCP_API_KEY` + `LUXGEN_TENANT` (`x-tenant` header).
3. **No filesystem tools** in MCP — Agent Studio `@luxgen/agent` tools stay separate.
4. **Errors** — use `formatToolError()` from `packages/mcp-core/src/errors.ts`.
5. **New tool** — add query in `graphql/`, handler in `tools/*-handlers.ts`, definition in `tools/definitions.ts`.

---

## Commands

```bash
npm run build:mcp    # build mcp-core + mcp-server
npm run dev:mcp      # stdio server (Cursor)
make mcp-smoke       # GraphQL + scope smoke test
make mcp-http-smoke  # HTTP /health check
```

---

## Tools (Phase 1–3)

**Automations (read):** `list_automations`, `get_automation`, `automation_runs`, `get_automation_schema`

**Automations (write):** `validate_tower_flow`, `create_automation`, `update_automation_flow`, `toggle_automation`, `delete_automation`

**Enterprise (write):** `run_agent_task` — GraphQL `runAgentTask`, Agent Studio plan gate

**Commerce (read-only):** `get_tenant_usage`, `list_enrollments`, `get_enrollment`

Write tools validate `flowDefinition` via `@luxgen/automation-flow` before GraphQL mutations.

## API keys & scopes (Phase 4)

- Create keys: GraphQL `createMcpApiKey(tenantId, name, scopes)` — Business+ plan
- MCP env: `LUXGEN_MCP_API_KEY` instead of JWT; scopes from `mcpKeyContext` query
- `read` scope: list/get tools only; `write` scope: create/update/toggle/delete automations
- Every tool call logs via `recordMcpToolAudit`; query `mcpToolAuditLog` for history

## HTTP transport (Phase 5)

- Set `MCP_TRANSPORT=http`; server listens on `MCP_HTTP_PORT` (default 3100), path `/mcp`
- Auth via request headers (`x-mcp-api-key`, `x-tenant`) — not env vars
- Rate limit: `MCP_RATE_LIMIT_MAX` / `MCP_RATE_LIMIT_WINDOW_MS`
- Deploy: `apps/mcp-server/Dockerfile`, Render service in `deploy/platforms/render.yaml`

## Resources & prompts (Phase 2)

- Resource `luxgen://automation-flow/catalog` — `@luxgen/automation-flow` catalog JSON
- Prompt `tower-authoring` — guide for flowDefinition JSON

HTTP transport is Phase 5 (shipped). Phase 6 adds `run_agent_task` and expanded smoke tests. Roadmap complete.

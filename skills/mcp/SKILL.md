# Skill: LuxGen MCP Platform

**Domain:** Model Context Protocol server, Cursor integration, GraphQL tool adapters.  
**Docs:** [docs/MCP_PLATFORM.md](../../docs/MCP_PLATFORM.md), [docs/MCP_DEVELOPER_GUIDE.md](../../docs/MCP_DEVELOPER_GUIDE.md)

---

## Key paths

| Layer         | Path                                          |
| ------------- | --------------------------------------------- |
| MCP app       | `apps/mcp-server/`                            |
| Core          | `packages/mcp-core/`                          |
| GraphQL ops   | `packages/mcp-core/src/graphql/`              |
| Tools         | `packages/mcp-core/src/tools/`                |
| Resources     | `packages/mcp-core/src/resources/register.ts` |
| Prompts       | `packages/mcp-core/src/prompts/register.ts`   |
| Cursor config | `.cursor/mcp.json.example`                    |

---

## Rules

1. **GraphQL only** — MCP tools call `apps/api`, never Mongo directly.
2. **Auth** — `LUXGEN_JWT` + `LUXGEN_TENANT` (`x-tenant` header), same as web client.
3. **No filesystem tools** in MCP — Agent Studio `@luxgen/agent` tools stay separate.
4. **Errors** — use `formatToolError()` from `packages/mcp-core/src/errors.ts`.
5. **New tool** — add query in `graphql/`, handler in `tools/*-handlers.ts`, definition in `tools/definitions.ts`.

---

## Commands

```bash
npm run build:mcp    # build mcp-core + mcp-server
npm run dev:mcp      # stdio server (Cursor)
make mcp-smoke       # read-tool smoke test
```

---

## Tools (Phase 1–2)

**Automations:** `list_automations`, `get_automation`, `automation_runs`, `get_automation_schema`

**Commerce (read-only):** `get_tenant_usage`, `list_enrollments`, `get_enrollment`

## Resources & prompts (Phase 2)

- Resource `luxgen://automation-flow/catalog` — `@luxgen/automation-flow` catalog JSON
- Prompt `tower-authoring` — guide for flowDefinition JSON

Write tools and HTTP transport are Phase 3–6 (not yet shipped).

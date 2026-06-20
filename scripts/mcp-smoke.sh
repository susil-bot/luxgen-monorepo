#!/usr/bin/env bash
# Smoke test LuxGen MCP GraphQL adapter (no stdio — direct client calls).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -z "${LUXGEN_GRAPHQL_URL:-}" ] || [ -z "${LUXGEN_TENANT:-}" ]; then
  echo "Set LUXGEN_GRAPHQL_URL and LUXGEN_TENANT (see docs/MCP_DEVELOPER_GUIDE.md)"
  exit 1
fi

if [ -z "${LUXGEN_JWT:-}" ] && [ -z "${LUXGEN_MCP_API_KEY:-}" ]; then
  echo "Set LUXGEN_JWT or LUXGEN_MCP_API_KEY"
  exit 1
fi

npm run build:mcp --silent

node - <<'NODE'
const {
  LuxgenGraphqlClient,
  loadLuxgenMcpConfig,
  LIST_AUTOMATIONS,
  AUTOMATION_SCHEMA,
  TENANT_USAGE,
  MCP_WRITE_TOOLS,
  filterToolsByScope,
  isToolAllowed,
} = require('./packages/mcp-core/dist/index.js');
const { allToolDefinitions } = require('./packages/mcp-core/dist/tools/definitions.js');

(async () => {
  const loaded = loadLuxgenMcpConfig();
  if (loaded.transport === 'http') {
    console.log('✓ config: HTTP transport (use make mcp-http-smoke for /health)');
    process.exit(0);
  }

  const client = new LuxgenGraphqlClient({
    graphqlUrl: loaded.graphqlUrl,
    tenant: loaded.tenant,
    jwt: loaded.jwt,
    mcpApiKey: loaded.mcpApiKey,
  });

  const list = await client.query(LIST_AUTOMATIONS, { tenantId: loaded.tenant });
  console.log('✓ list_automations:', list.automations.length, 'automations');

  const schema = await client.query(AUTOMATION_SCHEMA);
  console.log('✓ get_automation_schema: keys', Object.keys(schema.automationSchema || {}).join(', ') || '(object)');

  const usage = await client.query(TENANT_USAGE, { tenantId: loaded.tenant });
  console.log('✓ get_tenant_usage: plan', usage.tenantUsage.plan, 'runs', usage.tenantUsage.automationRuns);

  if (!MCP_WRITE_TOOLS.has('run_agent_task')) {
    throw new Error('run_agent_task must be a write tool');
  }
  console.log('✓ scopes: run_agent_task requires write');

  const readTools = filterToolsByScope(allToolDefinitions({ tenant: loaded.tenant }), ['read']);
  const readNames = new Set(readTools.map((t) => t.name));
  if (readNames.has('run_agent_task') || readNames.has('create_automation')) {
    throw new Error('write tools must not appear in read scope');
  }
  if (!isToolAllowed('list_automations', ['read'])) {
    throw new Error('list_automations should be allowed with read scope');
  }
  console.log('✓ scopes: read filter OK (' + readTools.length + ' tools)');

  if (process.env.MCP_SMOKE_RUN_AGENT === '1') {
    const { RUN_AGENT_TASK } = require('./packages/mcp-core/dist/graphql/automation-queries.js');
    const agent = await client.query(RUN_AGENT_TASK, {
      input: { tenantId: loaded.tenant, prompt: 'MCP smoke test — respond OK' },
    });
    console.log('✓ run_agent_task:', agent.runAgentTask.status, agent.runAgentTask.sessionId);
  }

  console.log('MCP smoke test passed.');
})().catch((err) => {
  console.error('✗ MCP smoke test failed:', err.message);
  process.exit(1);
});
NODE

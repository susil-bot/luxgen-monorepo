#!/usr/bin/env bash
# Smoke test LuxGen MCP GraphQL adapter (no stdio — direct client calls).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -z "${LUXGEN_GRAPHQL_URL:-}" ] || [ -z "${LUXGEN_JWT:-}" ] || [ -z "${LUXGEN_TENANT:-}" ]; then
  echo "Set LUXGEN_GRAPHQL_URL, LUXGEN_JWT, LUXGEN_TENANT (see docs/MCP_DEVELOPER_GUIDE.md)"
  exit 1
fi

npm run build:mcp --silent

node - <<'NODE'
const {
  LuxgenGraphqlClient,
  loadLuxgenMcpConfig,
} = require('./packages/mcp-core/dist/index.js');
const {
  LIST_AUTOMATIONS,
  AUTOMATION_SCHEMA,
} = require('./packages/mcp-core/dist/graphql/automation-queries.js');

(async () => {
  const config = loadLuxgenMcpConfig();
  const client = new LuxgenGraphqlClient(config);

  const list = await client.query(LIST_AUTOMATIONS, { tenantId: config.tenant });
  console.log('✓ list_automations:', list.automations.length, 'automations');

  const schema = await client.query(AUTOMATION_SCHEMA);
  console.log('✓ get_automation_schema: keys', Object.keys(schema.automationSchema || {}).join(', ') || '(object)');

  console.log('MCP smoke test passed.');
})().catch((err) => {
  console.error('✗ MCP smoke test failed:', err.message);
  process.exit(1);
});
NODE

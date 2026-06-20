import 'dotenv/config';
import { createLuxgenMcpServer, loadLuxgenMcpConfig, LuxgenGraphqlClient, runStdioServer } from '@luxgen/mcp-core';

async function main(): Promise<void> {
  const config = loadLuxgenMcpConfig();
  const client = new LuxgenGraphqlClient(config);
  const server = createLuxgenMcpServer(client, {
    tenant: config.tenant,
    production: config.production,
  });

  if (config.transport !== 'stdio') {
    console.error('[luxgen-mcp] HTTP transport is not implemented yet (Phase 6). Use MCP_TRANSPORT=stdio.');
    process.exit(1);
  }

  await runStdioServer(server);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[luxgen-mcp] Fatal: ${message}`);
  process.exit(1);
});

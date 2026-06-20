import 'dotenv/config';
import {
  createLuxgenMcpServer,
  loadLuxgenMcpConfig,
  LuxgenGraphqlClient,
  resolveMcpScopes,
  runStdioServer,
} from '@luxgen/mcp-core';

async function main(): Promise<void> {
  const partial = loadLuxgenMcpConfig();
  const client = new LuxgenGraphqlClient({
    graphqlUrl: partial.graphqlUrl,
    tenant: partial.tenant,
    jwt: partial.jwt,
    mcpApiKey: partial.mcpApiKey,
  });

  const config = await resolveMcpScopes(partial, client);
  const server = createLuxgenMcpServer(client, {
    tenant: config.tenant,
    production: config.production,
    scopes: config.scopes,
    keyId: config.keyId,
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

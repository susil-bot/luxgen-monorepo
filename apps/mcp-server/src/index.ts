import 'dotenv/config';
import {
  createLuxgenMcpServer,
  loadLuxgenMcpConfig,
  LuxgenGraphqlClient,
  resolveMcpScopes,
  runHttpServer,
  runStdioServer,
} from '@luxgen/mcp-core';

async function main(): Promise<void> {
  const loaded = loadLuxgenMcpConfig();

  if (loaded.transport === 'http') {
    await runHttpServer(loaded);
    return;
  }

  const client = new LuxgenGraphqlClient({
    graphqlUrl: loaded.graphqlUrl,
    tenant: loaded.tenant,
    jwt: loaded.jwt,
    mcpApiKey: loaded.mcpApiKey,
  });

  const config = await resolveMcpScopes(loaded, client);
  const server = createLuxgenMcpServer(client, {
    tenant: config.tenant,
    production: config.production,
    scopes: config.scopes,
    keyId: config.keyId,
  });

  await runStdioServer(server);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[luxgen-mcp] Fatal: ${message}`);
  process.exit(1);
});

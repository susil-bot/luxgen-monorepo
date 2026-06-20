import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { LuxgenGraphqlClient } from './graphql/client';
import type { LuxgenMcpConfig } from './config';
import { registerAutomationTools } from './tools/register';

export function createLuxgenMcpServer(
  client: LuxgenGraphqlClient,
  config: Pick<LuxgenMcpConfig, 'tenant' | 'production'>,
): McpServer {
  const server = new McpServer({
    name: 'luxgen',
    version: '1.0.0',
  });

  registerAutomationTools(server, client, config);

  return server;
}

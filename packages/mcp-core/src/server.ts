import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { LuxgenGraphqlClient } from './graphql/client';
import type { LuxgenMcpConfig } from './config';
import { registerPrompts } from './prompts/register';
import { registerResources } from './resources/register';
import { registerTools } from './tools/register';

export function createLuxgenMcpServer(
  client: LuxgenGraphqlClient,
  config: Pick<LuxgenMcpConfig, 'tenant' | 'production' | 'scopes' | 'keyId'>,
): McpServer {
  const server = new McpServer({
    name: 'luxgen',
    version: '1.3.0',
  });

  registerTools(server, client, config);
  registerResources(server);
  registerPrompts(server);

  return server;
}

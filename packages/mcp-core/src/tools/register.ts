import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { LuxgenGraphqlClient } from '../graphql/client';
import type { LuxgenMcpConfig } from '../config';
import { formatToolError } from '../errors';
import { handleAutomationTool } from './automation-handlers';
import { handleCommerceTool } from './commerce-handlers';
import { allToolDefinitions } from './definitions';

type ToolConfig = Pick<LuxgenMcpConfig, 'tenant' | 'production'>;

export function registerTools(server: McpServer, client: LuxgenGraphqlClient, config: ToolConfig): void {
  const tools = allToolDefinitions(config);

  server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
  }));

  server.server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = (request.params.arguments ?? {}) as Record<string, unknown>;

    const automationResult = await handleAutomationTool(name, args, client, config);
    if (automationResult) return automationResult;

    const commerceResult = await handleCommerceTool(name, args, client, config);
    if (commerceResult) return commerceResult;

    return formatToolError(new Error(`Unknown tool: ${name}`), config.production);
  });
}

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { LuxgenGraphqlClient } from '../graphql/client';
import type { LuxgenMcpConfig } from '../config';
import { formatToolError } from '../errors';
import { RECORD_MCP_TOOL_AUDIT } from '../graphql/mcp-queries';
import { handleAutomationTool } from './automation-handlers';
import { handleCommerceTool } from './commerce-handlers';
import { allToolDefinitions } from './definitions';
import { filterToolsByScope, isToolAllowed } from './scopes';

type RegisterConfig = Pick<LuxgenMcpConfig, 'tenant' | 'production' | 'keyId' | 'scopes'>;

async function recordAudit(
  client: LuxgenGraphqlClient,
  config: RegisterConfig,
  tool: string,
  success: boolean,
  durationMs: number,
  error?: string,
): Promise<void> {
  try {
    await client.query(RECORD_MCP_TOOL_AUDIT, {
      input: {
        tenantId: config.tenant,
        tool,
        success,
        durationMs,
        error,
      },
    });
  } catch {
    // Audit must not break tool execution
  }
}

export function registerTools(server: McpServer, client: LuxgenGraphqlClient, config: RegisterConfig): void {
  const tools = filterToolsByScope(allToolDefinitions(config), config.scopes);

  server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
  }));

  server.server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = (request.params.arguments ?? {}) as Record<string, unknown>;
    const started = Date.now();

    if (!isToolAllowed(name, config.scopes)) {
      return formatToolError(
        new Error(`Tool "${name}" is not allowed for current MCP scopes: ${config.scopes.join(', ')}`),
        config.production,
      );
    }

    let result;
    let success = true;
    let errorMessage: string | undefined;

    try {
      const automationResult = await handleAutomationTool(name, args, client, config);
      if (automationResult) {
        result = automationResult;
        success = !automationResult.isError;
      } else {
        const commerceResult = await handleCommerceTool(name, args, client, config);
        if (commerceResult) {
          result = commerceResult;
          success = !commerceResult.isError;
        } else {
          result = formatToolError(new Error(`Unknown tool: ${name}`), config.production);
          success = false;
        }
      }
      if (!success && result.content[0]?.text) {
        errorMessage = result.content[0].text.slice(0, 500);
      }
    } catch (err) {
      success = false;
      errorMessage = err instanceof Error ? err.message : String(err);
      result = formatToolError(err, config.production);
    }

    void recordAudit(client, config, name, success, Date.now() - started, errorMessage);
    return result;
  });
}

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exportAutomationSchema } from '@luxgen/automation-flow';
import type { LuxgenGraphqlClient } from '../graphql/client';
import type { LuxgenMcpConfig } from '../config';
import { formatToolError, formatToolSuccess } from '../errors';
import {
  AUTOMATION_RUNS,
  AUTOMATION_SCHEMA,
  GET_AUTOMATION,
  LIST_AUTOMATIONS,
  type AutomationRunsResult,
  type AutomationSchemaResult,
  type GetAutomationResult,
  type ListAutomationsResult,
} from '../graphql/automation-queries';

type ToolConfig = Pick<LuxgenMcpConfig, 'tenant' | 'production'>;

type JsonSchema = {
  type: 'object';
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
};

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JsonSchema;
}

type ToolContent = { content: { type: 'text'; text: string }[]; isError?: boolean };

async function runTool<T>(config: ToolConfig, fn: () => Promise<T>): Promise<ToolContent> {
  try {
    const data = await fn();
    return formatToolSuccess(data);
  } catch (error) {
    return formatToolError(error, config.production);
  }
}

function toolDefinitions(config: ToolConfig): ToolDefinition[] {
  return [
    {
      name: 'list_automations',
      description: `List tower automations for tenant "${config.tenant}".`,
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
    {
      name: 'get_automation',
      description: 'Fetch a single tower automation by id.',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Automation id' } },
        required: ['id'],
        additionalProperties: false,
      },
    },
    {
      name: 'automation_runs',
      description: `Recent automation runs for tenant "${config.tenant}".`,
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Max runs (1–100, default 20)' },
        },
        additionalProperties: false,
      },
    },
    {
      name: 'get_automation_schema',
      description: 'LuxGen trigger/action catalog for tower builder.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
  ];
}

export function registerAutomationTools(server: McpServer, client: LuxgenGraphqlClient, config: ToolConfig): void {
  const tools = toolDefinitions(config);

  server.server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
  }));

  server.server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name;
    const args = (request.params.arguments ?? {}) as Record<string, unknown>;

    switch (name) {
      case 'list_automations':
        return runTool(config, async () => {
          const data = await client.query<ListAutomationsResult>(LIST_AUTOMATIONS, { tenantId: config.tenant });
          return { tenantId: config.tenant, count: data.automations.length, automations: data.automations };
        });

      case 'get_automation': {
        const id = String(args.id ?? '');
        if (!id) throw new Error('id is required');
        return runTool(config, async () => {
          const data = await client.query<GetAutomationResult>(GET_AUTOMATION, { id });
          if (!data.automation) throw new Error(`Automation not found: ${id}`);
          return data.automation;
        });
      }

      case 'automation_runs': {
        const limitRaw = args.limit;
        const limit = typeof limitRaw === 'number' ? Math.min(100, Math.max(1, limitRaw)) : 20;
        return runTool(config, async () => {
          const data = await client.query<AutomationRunsResult>(AUTOMATION_RUNS, {
            tenantId: config.tenant,
            limit,
          });
          return { tenantId: config.tenant, count: data.automationRuns.length, runs: data.automationRuns };
        });
      }

      case 'get_automation_schema':
        return runTool(config, async () => {
          const data = await client.query<AutomationSchemaResult>(AUTOMATION_SCHEMA);
          return { apiSchema: data.automationSchema, flowCatalog: exportAutomationSchema() };
        });

      default:
        return formatToolError(new Error(`Unknown tool: ${name}`), config.production);
    }
  });
}

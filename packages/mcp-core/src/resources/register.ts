import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exportAutomationSchema } from '@luxgen/automation-flow';

export const AUTOMATION_FLOW_CATALOG_URI = 'luxgen://automation-flow/catalog';

export function registerResources(server: McpServer): void {
  server.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: AUTOMATION_FLOW_CATALOG_URI,
        name: 'automation-flow-catalog',
        description: '@luxgen/automation-flow compound catalog (triggers, conditions, actions, waits)',
        mimeType: 'application/json',
      },
    ],
  }));

  server.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    if (uri === AUTOMATION_FLOW_CATALOG_URI) {
      return {
        contents: [
          {
            uri: AUTOMATION_FLOW_CATALOG_URI,
            mimeType: 'application/json',
            text: JSON.stringify(exportAutomationSchema(), null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  });
}

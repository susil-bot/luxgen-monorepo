import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GetPromptRequestSchema, ListPromptsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const TOWER_AUTHORING_PROMPT = `You are helping author a LuxGen Tower automation (Shopify Flow style).

Use the automation-flow catalog resource (luxgen://automation-flow/catalog) or get_automation_schema tool for valid compound ids.

Flow document rules:
- version must be 1
- exactly one trigger node; entryNodeId must point to it
- nodes use kind: trigger | condition | action | wait
- each node has compoundId from the catalog and a config object matching compound fields
- edges connect nodes; condition branches use label "true" or "false"

When proposing a flow:
1. Start with a trigger matching the business event (e.g. commerce.order.created)
2. Add conditions only when needed
3. Chain actions in order
4. Return valid JSON matching TowerFlowDocument shape

Incremental edits (preferred over full flowDefinition rewrites):
- tower_insert_step — add action/condition/wait after a node
- tower_move_step — reorder a step in the default chain
- tower_connect_nodes / tower_disconnect_nodes — manual graph links
- update_automation_flow — bulk replace only when restructuring entire tower

Reference: docs/TOWER_BUILDER.md and docs/AUTOMATION_FLOW_SCHEMA.md in the LuxGen monorepo.`;

export function registerPrompts(server: McpServer): void {
  server.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: [
      {
        name: 'tower-authoring',
        description: 'Guide for authoring LuxGen Tower flowDefinition JSON',
        arguments: [],
      },
    ],
  }));

  server.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    if (request.params.name !== 'tower-authoring') {
      throw new Error(`Unknown prompt: ${request.params.name}`);
    }

    return {
      messages: [
        {
          role: 'user',
          content: { type: 'text', text: TOWER_AUTHORING_PROMPT },
        },
      ],
    };
  });
}

import type { ToolConfig, ToolDefinition } from './types';

const FLOW_DEF_SCHEMA = {
  description: 'TowerFlowDocument JSON object or string (see docs/AUTOMATION_FLOW_SCHEMA.md)',
};

const BRANCH_LABEL_SCHEMA = {
  type: 'string',
  description: 'Edge port on source node: default (next), true (yes), or false (no)',
  enum: ['default', 'true', 'false'],
};

const AUTOMATION_ID_SCHEMA = { type: 'string', description: 'Automation id' };

export function allToolDefinitions(config: ToolConfig): ToolDefinition[] {
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
        properties: { limit: { type: 'number', description: 'Max runs (1–100, default 20)' } },
        additionalProperties: false,
      },
    },
    {
      name: 'get_automation_schema',
      description: 'LuxGen trigger/action catalog for tower builder.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
    {
      name: 'validate_tower_flow',
      description: 'Validate a flowDefinition without persisting (same rules as create/update).',
      inputSchema: {
        type: 'object',
        properties: { flowDefinition: FLOW_DEF_SCHEMA },
        required: ['flowDefinition'],
        additionalProperties: false,
      },
    },
    {
      name: 'create_automation',
      description: `Create a tower automation for tenant "${config.tenant}" from a validated flowDefinition.`,
      inputSchema: {
        type: 'object',
        properties: {
          flowDefinition: FLOW_DEF_SCHEMA,
          enabled: { type: 'boolean', description: 'Override meta.enabled (default from flow meta)' },
        },
        required: ['flowDefinition'],
        additionalProperties: false,
      },
    },
    {
      name: 'update_automation_flow',
      description: 'Replace automation flowDefinition and derived trigger/actions fields.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Automation id' },
          flowDefinition: FLOW_DEF_SCHEMA,
          enabled: { type: 'boolean', description: 'Override meta.enabled' },
        },
        required: ['id', 'flowDefinition'],
        additionalProperties: false,
      },
    },
    {
      name: 'tower_insert_step',
      description: 'Insert an action, condition, or wait after a node (same as tower UI + button).',
      inputSchema: {
        type: 'object',
        properties: {
          id: AUTOMATION_ID_SCHEMA,
          afterNodeId: { type: 'string', description: 'Insert after this node id' },
          kind: { type: 'string', enum: ['action', 'condition', 'wait'], description: 'Step kind' },
          compoundId: { type: 'string', description: 'Catalog compound id (get_automation_schema)' },
          branchLabel: BRANCH_LABEL_SCHEMA,
        },
        required: ['id', 'afterNodeId', 'kind', 'compoundId'],
        additionalProperties: false,
      },
    },
    {
      name: 'tower_move_step',
      description: 'Move a non-trigger node to follow afterNodeId on the given port.',
      inputSchema: {
        type: 'object',
        properties: {
          id: AUTOMATION_ID_SCHEMA,
          nodeId: { type: 'string', description: 'Node to move' },
          afterNodeId: { type: 'string', description: 'Place immediately after this node' },
          branchLabel: BRANCH_LABEL_SCHEMA,
        },
        required: ['id', 'nodeId', 'afterNodeId'],
        additionalProperties: false,
      },
    },
    {
      name: 'tower_connect_nodes',
      description: 'Link from → to on a port (replaces existing edge on that port).',
      inputSchema: {
        type: 'object',
        properties: {
          id: AUTOMATION_ID_SCHEMA,
          from: { type: 'string', description: 'Source node id' },
          to: { type: 'string', description: 'Target node id' },
          branchLabel: BRANCH_LABEL_SCHEMA,
        },
        required: ['id', 'from', 'to'],
        additionalProperties: false,
      },
    },
    {
      name: 'tower_disconnect_nodes',
      description: 'Remove outgoing edge(s) from a node; narrow with to and/or branchLabel.',
      inputSchema: {
        type: 'object',
        properties: {
          id: AUTOMATION_ID_SCHEMA,
          from: { type: 'string', description: 'Source node id' },
          to: { type: 'string', description: 'Optional target node id' },
          branchLabel: BRANCH_LABEL_SCHEMA,
        },
        required: ['id', 'from'],
        additionalProperties: false,
      },
    },
    {
      name: 'toggle_automation',
      description: 'Enable or pause an automation without changing its flow.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Automation id' },
          enabled: { type: 'boolean', description: 'true = active, false = paused' },
        },
        required: ['id', 'enabled'],
        additionalProperties: false,
      },
    },
    {
      name: 'delete_automation',
      description: 'Permanently delete an automation (requires confirm: true).',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Automation id' },
          confirm: { type: 'boolean', description: 'Must be true to delete' },
        },
        required: ['id', 'confirm'],
        additionalProperties: false,
      },
    },
    {
      name: 'run_agent_task',
      description: `Enqueue a headless agent task for tenant "${config.tenant}" (requires Agent Studio / Business+ plan).`,
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Task prompt for the agent worker' },
          model: { type: 'string', description: 'Optional Ollama model override' },
        },
        required: ['prompt'],
        additionalProperties: false,
      },
    },
    {
      name: 'get_tenant_usage',
      description: `Plan usage and limits for tenant "${config.tenant}" (automation runs, learners, automations).`,
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
    {
      name: 'list_enrollments',
      description: `List enrollments/orders for tenant "${config.tenant}" (read-only).`,
      inputSchema: {
        type: 'object',
        properties: { limit: { type: 'number', description: 'Max rows (1–500, default 50)' } },
        additionalProperties: false,
      },
    },
    {
      name: 'get_enrollment',
      description: 'Fetch a single enrollment/order by id.',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Enrollment id' } },
        required: ['id'],
        additionalProperties: false,
      },
    },
    {
      name: 'list_customers',
      description: `List customers (STUDENT users) for tenant "${config.tenant}" (read-only).`,
      inputSchema: {
        type: 'object',
        properties: { limit: { type: 'number', description: 'Max rows (1–500, default 50)' } },
        additionalProperties: false,
      },
    },
    {
      name: 'get_learner_dashboard',
      description: `Learner progress and subscriptions for tenant "${config.tenant}" (defaults to authenticated user).`,
      inputSchema: {
        type: 'object',
        properties: { studentId: { type: 'string', description: 'Optional learner user id (staff only)' } },
        additionalProperties: false,
      },
    },
    {
      name: 'customer_segments',
      description: `Enrollment-based customer segment summaries for tenant "${config.tenant}" (staff).`,
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
    {
      name: 'customers_in_segment',
      description: `List customers in a segment for tenant "${config.tenant}" (staff).`,
      inputSchema: {
        type: 'object',
        properties: {
          segment: {
            type: 'string',
            description: 'ALL | ACTIVE_LEARNERS | AT_RISK | HIGH_VALUE | INACTIVE',
          },
        },
        required: ['segment'],
        additionalProperties: false,
      },
    },
  ];
}

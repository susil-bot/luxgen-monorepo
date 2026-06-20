import type { ToolConfig, ToolDefinition } from './types';

const FLOW_DEF_SCHEMA = {
  description: 'TowerFlowDocument JSON object or string (see docs/AUTOMATION_FLOW_SCHEMA.md)',
};

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
  ];
}

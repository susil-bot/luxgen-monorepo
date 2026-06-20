import type { ToolConfig, ToolDefinition } from './types';

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

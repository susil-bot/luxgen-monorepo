import { exportAutomationSchema } from '@luxgen/automation-flow';
import type { LuxgenGraphqlClient } from '../graphql/client';
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
import type { ToolConfig, ToolContent } from './types';
import { formatToolError, formatToolSuccess } from '../errors';

async function runTool<T>(config: ToolConfig, fn: () => Promise<T>): Promise<ToolContent> {
  try {
    return formatToolSuccess(await fn());
  } catch (error) {
    return formatToolError(error, config.production);
  }
}

export async function handleAutomationTool(
  name: string,
  args: Record<string, unknown>,
  client: LuxgenGraphqlClient,
  config: ToolConfig,
): Promise<ToolContent | null> {
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
      return null;
  }
}

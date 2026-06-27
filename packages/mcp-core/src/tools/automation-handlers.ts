import { exportAutomationSchema } from '@luxgen/automation-flow';
import type { LuxgenGraphqlClient } from '../graphql/client';
import {
  AUTOMATION_RUNS,
  AUTOMATION_SCHEMA,
  CREATE_AUTOMATION,
  DELETE_AUTOMATION,
  GET_AUTOMATION,
  LIST_AUTOMATIONS,
  TOGGLE_AUTOMATION,
  UPDATE_AUTOMATION,
  RUN_AGENT_TASK,
  type AutomationRunsResult,
  type AutomationSchemaResult,
  type CreateAutomationResult,
  type DeleteAutomationResult,
  type GetAutomationResult,
  type ListAutomationsResult,
  type ToggleAutomationResult,
  type UpdateAutomationResult,
  type RunAgentTaskResult,
} from '../graphql/automation-queries';
import {
  parseFlowDefinitionArg,
  parseTowerFlowFromAutomation,
  towerFlowToMutationInput,
  validateFlowDefinitionOnly,
} from '../flow/prepare-mutation';
import {
  applyTowerConnectNodes,
  applyTowerDisconnectNodes,
  applyTowerInsertStep,
  applyTowerMoveStep,
  parseBranchLabelArg,
  parseInsertKindArg,
  persistTowerFlowMutation,
} from '../flow/apply-mutation';
import type { ToolConfig, ToolContent } from './types';
import { formatToolError, formatToolSuccess } from '../errors';

async function runTool<T>(config: ToolConfig, fn: () => Promise<T>): Promise<ToolContent> {
  try {
    return formatToolSuccess(await fn());
  } catch (error) {
    return formatToolError(error, config.production);
  }
}

function validationErrorResult(config: ToolConfig, errors: string[]): ToolContent {
  return formatToolError(new Error(`flowDefinition validation failed:\n${errors.join('\n')}`), config.production);
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

    case 'validate_tower_flow': {
      const flowRaw = parseFlowDefinitionArg(args.flowDefinition);
      const result = validateFlowDefinitionOnly(flowRaw);
      if (!result.ok) return validationErrorResult(config, result.errors);
      return runTool(config, async () => ({
        valid: true,
        name: result.flow.meta.name,
        nodeCount: result.flow.nodes.length,
        edgeCount: result.flow.edges.length,
      }));
    }

    case 'create_automation': {
      const flowRaw = parseFlowDefinitionArg(args.flowDefinition);
      const enabled = typeof args.enabled === 'boolean' ? args.enabled : undefined;
      const prepared = towerFlowToMutationInput(flowRaw, { enabled });
      if (!prepared.ok) return validationErrorResult(config, prepared.errors);

      return runTool(config, async () => {
        const { input } = prepared;
        const data = await client.query<CreateAutomationResult>(CREATE_AUTOMATION, {
          input: {
            tenantId: config.tenant,
            name: input.name,
            triggerType: input.triggerType,
            triggerLabel: input.triggerLabel,
            actions: input.actions,
            enabled: input.enabled,
            flowDefinition: input.flowDefinition,
          },
        });
        return data.createAutomation;
      });
    }

    case 'update_automation_flow': {
      const id = String(args.id ?? '');
      if (!id) throw new Error('id is required');
      const flowRaw = parseFlowDefinitionArg(args.flowDefinition);
      const enabled = typeof args.enabled === 'boolean' ? args.enabled : undefined;
      const prepared = towerFlowToMutationInput(flowRaw, { enabled });
      if (!prepared.ok) return validationErrorResult(config, prepared.errors);

      return runTool(config, async () => {
        const { input } = prepared;
        const data = await client.query<UpdateAutomationResult>(UPDATE_AUTOMATION, {
          id,
          input: {
            name: input.name,
            triggerType: input.triggerType,
            triggerLabel: input.triggerLabel,
            actions: input.actions,
            enabled: input.enabled,
            flowDefinition: input.flowDefinition,
          },
        });
        if (!data.updateAutomation) throw new Error(`Automation not found: ${id}`);
        return data.updateAutomation;
      });
    }

    case 'tower_insert_step': {
      const id = String(args.id ?? '');
      const afterNodeId = String(args.afterNodeId ?? '');
      const compoundId = String(args.compoundId ?? '').trim();
      if (!id) throw new Error('id is required');
      if (!afterNodeId) throw new Error('afterNodeId is required');
      if (!compoundId) throw new Error('compoundId is required');
      const kind = parseInsertKindArg(args.kind);
      const branchLabel = parseBranchLabelArg(args.branchLabel);

      return runTool(config, async () => {
        const before = await client.query<GetAutomationResult>(GET_AUTOMATION, { id });
        if (!before.automation) throw new Error(`Automation not found: ${id}`);
        const beforeFlow = parseTowerFlowFromAutomation(before.automation.flowDefinition, before.automation.name);
        const beforeIds = new Set(beforeFlow.nodes.map((node) => node.id));

        const result = await persistTowerFlowMutation(client, id, (flow) =>
          applyTowerInsertStep(flow, afterNodeId, kind, compoundId, branchLabel),
        );

        const newNode = result.flowDefinition.nodes.find((node) => !beforeIds.has(node.id));

        return {
          automation: result.automation,
          nodeCount: result.nodeCount,
          edgeCount: result.edgeCount,
          insertedNodeId: newNode?.id ?? null,
          compoundId: newNode?.compoundId ?? compoundId,
        };
      });
    }

    case 'tower_move_step': {
      const id = String(args.id ?? '');
      const nodeId = String(args.nodeId ?? '');
      const afterNodeId = String(args.afterNodeId ?? '');
      if (!id) throw new Error('id is required');
      if (!nodeId) throw new Error('nodeId is required');
      if (!afterNodeId) throw new Error('afterNodeId is required');
      const branchLabel = parseBranchLabelArg(args.branchLabel);

      return runTool(config, async () => {
        const result = await persistTowerFlowMutation(client, id, (flow) =>
          applyTowerMoveStep(flow, nodeId, afterNodeId, branchLabel),
        );
        return {
          automation: result.automation,
          nodeCount: result.nodeCount,
          edgeCount: result.edgeCount,
          movedNodeId: nodeId,
        };
      });
    }

    case 'tower_connect_nodes': {
      const id = String(args.id ?? '');
      const from = String(args.from ?? '');
      const to = String(args.to ?? '');
      if (!id) throw new Error('id is required');
      if (!from) throw new Error('from is required');
      if (!to) throw new Error('to is required');
      const branchLabel = parseBranchLabelArg(args.branchLabel);

      return runTool(config, async () => {
        const result = await persistTowerFlowMutation(client, id, (flow) =>
          applyTowerConnectNodes(flow, from, to, branchLabel),
        );
        return {
          automation: result.automation,
          nodeCount: result.nodeCount,
          edgeCount: result.edgeCount,
          from,
          to,
          branchLabel: branchLabel ?? 'default',
        };
      });
    }

    case 'tower_disconnect_nodes': {
      const id = String(args.id ?? '');
      const from = String(args.from ?? '');
      if (!id) throw new Error('id is required');
      if (!from) throw new Error('from is required');
      const to = typeof args.to === 'string' && args.to.trim() ? args.to.trim() : undefined;
      const branchLabel = parseBranchLabelArg(args.branchLabel);

      return runTool(config, async () => {
        const result = await persistTowerFlowMutation(client, id, (flow) =>
          applyTowerDisconnectNodes(flow, from, to, branchLabel),
        );
        return {
          automation: result.automation,
          nodeCount: result.nodeCount,
          edgeCount: result.edgeCount,
          from,
          to: to ?? null,
          branchLabel: branchLabel ?? null,
        };
      });
    }

    case 'toggle_automation': {
      const id = String(args.id ?? '');
      if (!id) throw new Error('id is required');
      if (typeof args.enabled !== 'boolean') throw new Error('enabled (boolean) is required');

      return runTool(config, async () => {
        const data = await client.query<ToggleAutomationResult>(TOGGLE_AUTOMATION, {
          id,
          enabled: args.enabled,
        });
        if (!data.toggleAutomation) throw new Error(`Automation not found: ${id}`);
        return data.toggleAutomation;
      });
    }

    case 'delete_automation': {
      const id = String(args.id ?? '');
      if (!id) throw new Error('id is required');
      if (args.confirm !== true) {
        throw new Error('delete_automation requires confirm: true');
      }

      return runTool(config, async () => {
        const data = await client.query<DeleteAutomationResult>(DELETE_AUTOMATION, { id });
        return { id, deleted: data.deleteAutomation };
      });
    }

    case 'run_agent_task': {
      const prompt = String(args.prompt ?? '').trim();
      if (!prompt) throw new Error('prompt is required');
      const model = typeof args.model === 'string' && args.model.trim() ? args.model.trim() : undefined;

      return runTool(config, async () => {
        const data = await client.query<RunAgentTaskResult>(RUN_AGENT_TASK, {
          input: { tenantId: config.tenant, prompt, model },
        });
        return data.runAgentTask;
      });
    }

    default:
      return null;
  }
}

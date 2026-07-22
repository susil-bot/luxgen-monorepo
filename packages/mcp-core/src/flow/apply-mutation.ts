import {
  connectFlowEdge,
  disconnectFlowEdge,
  insertFlowNodeAfter,
  moveFlowNode,
  type FlowEdgeLabel,
  type FlowNodeKind,
  type TowerFlowDocument,
} from '@luxgen/automation-flow';
import type { LuxgenGraphqlClient } from '../graphql/client';
import {
  GET_AUTOMATION,
  UPDATE_AUTOMATION,
  type GetAutomationResult,
  type UpdateAutomationResult,
} from '../graphql/automation-queries';
import { parseTowerFlowFromAutomation, towerFlowToMutationInput, validateFlowDefinitionOnly } from './prepare-mutation';

export function parseBranchLabelArg(raw: unknown): FlowEdgeLabel | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  const label = String(raw);
  if (label === 'default' || label === 'true' || label === 'false') return label;
  throw new Error('branchLabel must be default, true, or false');
}

export function parseInsertKindArg(raw: unknown): FlowNodeKind {
  const kind = String(raw ?? '');
  if (kind === 'action' || kind === 'condition' || kind === 'wait') return kind;
  throw new Error('kind must be action, condition, or wait');
}

export interface PersistTowerFlowResult {
  automation: NonNullable<UpdateAutomationResult['updateAutomation']>;
  flowDefinition: TowerFlowDocument;
  nodeCount: number;
  edgeCount: number;
}

export async function persistTowerFlowMutation(
  client: LuxgenGraphqlClient,
  automationId: string,
  mutate: (flow: TowerFlowDocument) => TowerFlowDocument,
  options?: { enabled?: boolean },
): Promise<PersistTowerFlowResult> {
  const data = await client.query<GetAutomationResult>(GET_AUTOMATION, { id: automationId });
  if (!data.automation) {
    throw new Error(`Automation not found: ${automationId}`);
  }

  const current = parseTowerFlowFromAutomation(data.automation.flowDefinition, data.automation.name);
  const nextFlow = mutate(current);
  const validated = validateFlowDefinitionOnly(nextFlow);
  if (!validated.ok) {
    throw new Error(`flowDefinition validation failed:\n${validated.errors.join('\n')}`);
  }

  const enabled =
    typeof options?.enabled === 'boolean' ? options.enabled : (data.automation.enabled ?? current.meta.enabled);
  const prepared = towerFlowToMutationInput(validated.flow, { enabled });
  if (!prepared.ok) {
    throw new Error(`flowDefinition validation failed:\n${prepared.errors.join('\n')}`);
  }

  const { input } = prepared;
  const updated = await client.query<UpdateAutomationResult>(UPDATE_AUTOMATION, {
    id: automationId,
    input: {
      name: input.name,
      triggerType: input.triggerType,
      triggerLabel: input.triggerLabel,
      actions: input.actions,
      enabled: input.enabled,
      flowDefinition: input.flowDefinition,
    },
  });

  if (!updated.updateAutomation) {
    throw new Error(`Automation not found: ${automationId}`);
  }

  return {
    automation: updated.updateAutomation,
    flowDefinition: input.flowDefinition,
    nodeCount: input.flowDefinition.nodes.length,
    edgeCount: input.flowDefinition.edges.length,
  };
}

export function applyTowerInsertStep(
  flow: TowerFlowDocument,
  afterNodeId: string,
  kind: FlowNodeKind,
  compoundId: string,
  branchLabel?: FlowEdgeLabel,
): TowerFlowDocument {
  return insertFlowNodeAfter(flow, afterNodeId, kind, compoundId, branchLabel);
}

export function applyTowerMoveStep(
  flow: TowerFlowDocument,
  nodeId: string,
  afterNodeId: string,
  branchLabel?: FlowEdgeLabel,
): TowerFlowDocument {
  return moveFlowNode(flow, nodeId, afterNodeId, branchLabel);
}

export function applyTowerConnectNodes(
  flow: TowerFlowDocument,
  from: string,
  to: string,
  branchLabel?: FlowEdgeLabel,
): TowerFlowDocument {
  return connectFlowEdge(flow, from, to, branchLabel);
}

export function applyTowerDisconnectNodes(
  flow: TowerFlowDocument,
  from: string,
  to?: string,
  branchLabel?: FlowEdgeLabel,
): TowerFlowDocument {
  return disconnectFlowEdge(flow, from, to, branchLabel);
}

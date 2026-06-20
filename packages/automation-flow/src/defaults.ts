import { getFlowCompound } from './catalog';
import type { TowerFlowDocument, FlowStepView, FlowNode, LegacyAutomationSnapshot } from './types';

function nodeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Example: order created → wait → update fields → condition → email */
export function createOrderCreatedFlow(name = 'Order created'): TowerFlowDocument {
  const triggerId = nodeId('t');
  const waitId = nodeId('w');
  const actionId = nodeId('a');
  const conditionId = nodeId('c');
  const emailId = nodeId('a');

  const nodes: FlowNode[] = [
    {
      id: triggerId,
      kind: 'trigger',
      compoundId: 'commerce.order.created',
      title: 'Order created',
      config: { orderSource: 'any' },
    },
    {
      id: waitId,
      kind: 'wait',
      compoundId: 'core.wait.delay',
      title: 'Wait 10 seconds',
      config: { seconds: 10 },
    },
    {
      id: actionId,
      kind: 'action',
      compoundId: 'commerce.order.update_fields',
      title: 'Update order fields',
      config: { note: 'Processed by tower', tags: 'automation' },
    },
    {
      id: conditionId,
      kind: 'condition',
      compoundId: 'core.condition.field_equals',
      title: 'Order has subscription',
      config: { field: 'order.hasSubscription', operator: 'equals', value: 'true' },
    },
    {
      id: emailId,
      kind: 'action',
      compoundId: 'core.notification.send_email',
      title: 'Send confirmation email',
      config: { template: 'order_confirmation' },
    },
  ];

  return {
    version: 1,
    meta: { name, enabled: false, description: 'Sample commerce tower flow' },
    entryNodeId: triggerId,
    nodes,
    edges: [
      { from: triggerId, to: waitId },
      { from: waitId, to: actionId },
      { from: actionId, to: conditionId },
      { from: conditionId, to: emailId, label: 'true' },
    ],
  };
}

export function createEmptyFlow(name = 'New tower'): TowerFlowDocument {
  const triggerId = nodeId('t');
  return {
    version: 1,
    meta: { name, enabled: false },
    entryNodeId: triggerId,
    nodes: [
      {
        id: triggerId,
        kind: 'trigger',
        compoundId: 'commerce.order.created',
        title: 'Order created',
        config: {},
      },
    ],
    edges: [],
  };
}

export function flowNodeToStepView(node: FlowNode): FlowStepView {
  const compound = getFlowCompound(node.compoundId);
  return {
    id: node.id,
    kind: node.kind,
    compoundId: node.compoundId,
    title: node.title ?? compound?.label ?? node.compoundId,
    description: compound?.description ?? '',
    emoji: compound?.emoji,
    config: node.config,
  };
}

/** Walk the default edge chain from trigger for UI/editor display */
export function flowToOrderedSteps(flow: TowerFlowDocument): FlowStepView[] {
  const nodeMap = new Map(flow.nodes.map((n) => [n.id, n]));
  const defaultEdges = new Map<string, string>();
  for (const edge of flow.edges) {
    if (!edge.label || edge.label === 'default') {
      defaultEdges.set(edge.from, edge.to);
    }
  }

  const steps: FlowStepView[] = [];
  let currentId: string | undefined = flow.entryNodeId;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = nodeMap.get(currentId);
    if (!node) break;
    steps.push(flowNodeToStepView(node));
    currentId = defaultEdges.get(currentId);
  }

  return steps;
}

/** Flatten v1 linear flows into legacy Automation shape for GraphQL + bridge */
export function flowToLegacyAutomation(flow: TowerFlowDocument): LegacyAutomationSnapshot {
  const triggerNode = flow.nodes.find((n) => n.id === flow.entryNodeId && n.kind === 'trigger');
  const triggerCompound = triggerNode ? getFlowCompound(triggerNode.compoundId) : undefined;

  const actions = flow.nodes
    .filter((n) => n.kind === 'action')
    .map((n) => {
      const compound = getFlowCompound(n.compoundId);
      return {
        type: compound?.legacyActionType ?? 'CALL_WEBHOOK',
        label: n.title ?? compound?.label ?? n.compoundId,
        config: { ...n.config, _compoundId: n.compoundId },
      };
    });

  return {
    name: flow.meta.name,
    enabled: flow.meta.enabled,
    triggerType: triggerCompound?.legacyTriggerType ?? 'WEBHOOK',
    triggerLabel: triggerNode?.title ?? triggerCompound?.label ?? 'Webhook',
    actions,
  };
}

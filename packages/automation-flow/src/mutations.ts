import { getFlowCompound } from './catalog';
import { flowToOrderedSteps } from './defaults';
import type { FlowEdge, FlowNode, FlowNodeKind, TowerFlowDocument } from './types';

function nodeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function defaultEdgesFromChain(nodeIds: string[]): FlowEdge[] {
  const edges: FlowEdge[] = [];
  for (let i = 0; i < nodeIds.length - 1; i += 1) {
    edges.push({ from: nodeIds[i]!, to: nodeIds[i + 1]! });
  }
  return edges;
}

function orderedNodeIds(flow: TowerFlowDocument): string[] {
  return flowToOrderedSteps(flow).map((step) => step.id);
}

export function insertFlowStepAfter(
  flow: TowerFlowDocument,
  afterNodeId: string,
  kind: FlowNodeKind,
  compoundId: string,
): TowerFlowDocument {
  const compound = getFlowCompound(compoundId);
  if (!compound || compound.kind !== kind) return flow;

  const newNode: FlowNode = {
    id: nodeId(kind.slice(0, 1)),
    kind,
    compoundId,
    title: compound.label,
    config: {},
  };

  const chain = orderedNodeIds(flow);
  const afterIndex = chain.indexOf(afterNodeId);
  if (afterIndex === -1) return flow;

  const nextChain = [...chain.slice(0, afterIndex + 1), newNode.id, ...chain.slice(afterIndex + 1)];
  const conditionalEdges = flow.edges.filter((edge) => edge.label && edge.label !== 'default');

  return {
    ...flow,
    nodes: [...flow.nodes, newNode],
    edges: [...defaultEdgesFromChain(nextChain), ...conditionalEdges],
  };
}

export function removeFlowStep(flow: TowerFlowDocument, nodeId: string): TowerFlowDocument {
  if (nodeId === flow.entryNodeId) return flow;

  const chain = orderedNodeIds(flow);
  if (!chain.includes(nodeId) || chain.length <= 1) return flow;

  const nextChain = chain.filter((id) => id !== nodeId);
  const conditionalEdges = flow.edges.filter(
    (edge) => edge.label && edge.label !== 'default' && edge.from !== nodeId && edge.to !== nodeId,
  );

  return {
    ...flow,
    nodes: flow.nodes.filter((node) => node.id !== nodeId),
    edges: [...defaultEdgesFromChain(nextChain), ...conditionalEdges],
  };
}

export function moveFlowStep(flow: TowerFlowDocument, nodeId: string, direction: 'up' | 'down'): TowerFlowDocument {
  if (nodeId === flow.entryNodeId) return flow;

  const chain = orderedNodeIds(flow);
  const index = chain.indexOf(nodeId);
  if (index <= 0) return flow;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex <= 0 || targetIndex >= chain.length) return flow;

  const nextChain = [...chain];
  [nextChain[index], nextChain[targetIndex]] = [nextChain[targetIndex]!, nextChain[index]!];

  const conditionalEdges = flow.edges.filter((edge) => edge.label && edge.label !== 'default');

  return {
    ...flow,
    edges: [...defaultEdgesFromChain(nextChain), ...conditionalEdges],
  };
}

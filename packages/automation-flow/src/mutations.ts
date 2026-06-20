import { flowToOrderedSteps } from './defaults';
import { insertFlowNodeAfter, moveFlowNode, removeFlowNode } from './graph';
import type { FlowNodeKind, TowerFlowDocument } from './types';

export {
  connectFlowEdge,
  disconnectFlowEdge,
  flowToGraphSteps,
  getNode,
  getOutgoingEdge,
  insertFlowNodeAfter,
  listIncomingEdges,
  listOutgoingEdges,
  moveFlowNode,
  normalizeEdgeLabel,
  removeFlowNode,
  spliceNodeAfter,
} from './graph';

/** @deprecated Use `insertFlowNodeAfter` — kept for existing tower UI imports. */
export function insertFlowStepAfter(
  flow: TowerFlowDocument,
  afterNodeId: string,
  kind: FlowNodeKind,
  compoundId: string,
): TowerFlowDocument {
  return insertFlowNodeAfter(flow, afterNodeId, kind, compoundId);
}

/** @deprecated Use `removeFlowNode`. */
export function removeFlowStep(flow: TowerFlowDocument, nodeId: string): TowerFlowDocument {
  return removeFlowNode(flow, nodeId);
}

export function moveFlowStep(flow: TowerFlowDocument, nodeId: string, direction: 'up' | 'down'): TowerFlowDocument {
  if (nodeId === flow.entryNodeId) return flow;

  const chain = flowToOrderedSteps(flow).map((step) => step.id);
  const index = chain.indexOf(nodeId);
  if (index <= 0) return flow;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex <= 0 || targetIndex >= chain.length) return flow;

  const afterNodeId = chain[targetIndex - 1]!;
  return moveFlowNode(flow, nodeId, afterNodeId);
}

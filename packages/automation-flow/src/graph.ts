import { getFlowCompound } from './catalog';
import { flowNodeToStepView } from './defaults';
import type {
  FlowEdge,
  FlowEdgeLabel,
  FlowGraphBranchView,
  FlowGraphStepView,
  FlowNode,
  FlowNodeKind,
  FlowStepView,
  TowerFlowDocument,
} from './types';

function newNodeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Treat missing label and `default` as the same port. */
export function normalizeEdgeLabel(label?: FlowEdgeLabel): FlowEdgeLabel {
  if (!label || label === 'default') return 'default';
  return label;
}

function edgePortKey(edge: FlowEdge): string {
  return `${edge.from}:${normalizeEdgeLabel(edge.label)}`;
}

function edgesOnPort(edges: FlowEdge[], from: string, label?: FlowEdgeLabel): FlowEdge[] {
  const port = normalizeEdgeLabel(label);
  return edges.filter((edge) => edge.from === from && normalizeEdgeLabel(edge.label) === port);
}

export function getNode(flow: TowerFlowDocument, nodeId: string): FlowNode | undefined {
  return flow.nodes.find((node) => node.id === nodeId);
}

export function listOutgoingEdges(flow: TowerFlowDocument, nodeId: string): FlowEdge[] {
  return flow.edges.filter((edge) => edge.from === nodeId);
}

export function listIncomingEdges(flow: TowerFlowDocument, nodeId: string): FlowEdge[] {
  return flow.edges.filter((edge) => edge.to === nodeId);
}

export function getOutgoingEdge(flow: TowerFlowDocument, from: string, label?: FlowEdgeLabel): FlowEdge | undefined {
  return edgesOnPort(flow.edges, from, label)[0];
}

function allowedOutgoingLabels(node: FlowNode): FlowEdgeLabel[] {
  if (node.kind === 'condition') return ['true', 'false'];
  return ['default'];
}

function isValidOutgoingLabel(node: FlowNode, label: FlowEdgeLabel): boolean {
  return allowedOutgoingLabels(node).includes(label);
}

function makeEdge(from: string, to: string, label: FlowEdgeLabel): FlowEdge {
  if (label === 'default') return { from, to };
  return { from, to, label };
}

function removeEdgesOnPort(edges: FlowEdge[], from: string, label?: FlowEdgeLabel): FlowEdge[] {
  const port = normalizeEdgeLabel(label);
  return edges.filter((edge) => !(edge.from === from && normalizeEdgeLabel(edge.label) === port));
}

function removeEdgesTouchingNode(edges: FlowEdge[], nodeId: string): FlowEdge[] {
  return edges.filter((edge) => edge.from !== nodeId && edge.to !== nodeId);
}

function dedupeEdges(edges: FlowEdge[]): FlowEdge[] {
  const seen = new Set<string>();
  const next: FlowEdge[] = [];
  for (const edge of edges) {
    const key = `${edgePortKey(edge)}->${edge.to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(edge);
  }
  return next;
}

/**
 * Add or replace an outgoing edge from `from` on the given port.
 * Conditions use `true` / `false`; all other nodes use the default port.
 */
export function connectFlowEdge(
  flow: TowerFlowDocument,
  from: string,
  to: string,
  label?: FlowEdgeLabel,
): TowerFlowDocument {
  if (from === to) return flow;

  const fromNode = getNode(flow, from);
  const toNode = getNode(flow, to);
  if (!fromNode || !toNode) return flow;

  const port = normalizeEdgeLabel(label);
  if (!isValidOutgoingLabel(fromNode, port)) return flow;

  const withoutPort = removeEdgesOnPort(flow.edges, from, port);
  return {
    ...flow,
    edges: dedupeEdges([...withoutPort, makeEdge(from, to, port)]),
  };
}

/**
 * Remove outgoing edge(s) from `from`. Narrow with `to` and/or `label` when provided.
 */
export function disconnectFlowEdge(
  flow: TowerFlowDocument,
  from: string,
  to?: string,
  label?: FlowEdgeLabel,
): TowerFlowDocument {
  const port = label === undefined ? undefined : normalizeEdgeLabel(label);

  return {
    ...flow,
    edges: flow.edges.filter((edge) => {
      if (edge.from !== from) return true;
      if (to !== undefined && edge.to !== to) return true;
      if (port !== undefined && normalizeEdgeLabel(edge.label) !== port) return true;
      return false;
    }),
  };
}

/** Reconnect predecessors to the primary successor when removing a node from a chain. */
function bypassNode(flow: TowerFlowDocument, nodeId: string): TowerFlowDocument {
  const incoming = listIncomingEdges(flow, nodeId);
  const outgoing = listOutgoingEdges(flow, nodeId);
  let next: TowerFlowDocument = { ...flow, edges: removeEdgesTouchingNode(flow.edges, nodeId) };

  if (incoming.length === 0 || outgoing.length === 0) return next;

  const primaryOut = outgoing.find((edge) => normalizeEdgeLabel(edge.label) === 'default') ?? outgoing[0]!;

  for (const inEdge of incoming) {
    next = connectFlowEdge(next, inEdge.from, primaryOut.to, inEdge.label);
  }

  return next;
}

/** Insert an existing node after `afterNodeId`, splicing into the chosen outgoing port. */
export function spliceNodeAfter(
  flow: TowerFlowDocument,
  afterNodeId: string,
  nodeId: string,
  branchLabel?: FlowEdgeLabel,
): TowerFlowDocument {
  if (afterNodeId === nodeId) return flow;
  if (!getNode(flow, afterNodeId) || !getNode(flow, nodeId)) return flow;

  const existing = getOutgoingEdge(flow, afterNodeId, branchLabel);
  let next = flow;

  if (existing) {
    next = disconnectFlowEdge(next, afterNodeId, existing.to, branchLabel);
    next = connectFlowEdge(next, afterNodeId, nodeId, branchLabel);
    next = connectFlowEdge(next, nodeId, existing.to);
  } else {
    next = connectFlowEdge(next, afterNodeId, nodeId, branchLabel);
  }

  return next;
}

export function insertFlowNodeAfter(
  flow: TowerFlowDocument,
  afterNodeId: string,
  kind: FlowNodeKind,
  compoundId: string,
  branchLabel?: FlowEdgeLabel,
): TowerFlowDocument {
  const compound = getFlowCompound(compoundId);
  if (!compound || compound.kind !== kind) return flow;
  if (!getNode(flow, afterNodeId)) return flow;

  const newNode: FlowNode = {
    id: newNodeId(kind.slice(0, 1)),
    kind,
    compoundId,
    title: compound.label,
    config: {},
  };

  const withNode: TowerFlowDocument = {
    ...flow,
    nodes: [...flow.nodes, newNode],
  };

  return spliceNodeAfter(withNode, afterNodeId, newNode.id, branchLabel);
}

/** Move a non-trigger node to immediately follow `afterNodeId` on the given port. */
export function moveFlowNode(
  flow: TowerFlowDocument,
  nodeId: string,
  afterNodeId: string,
  branchLabel?: FlowEdgeLabel,
): TowerFlowDocument {
  if (nodeId === flow.entryNodeId || nodeId === afterNodeId) return flow;
  if (!getNode(flow, nodeId) || !getNode(flow, afterNodeId)) return flow;

  const bypassed = bypassNode(flow, nodeId);
  return spliceNodeAfter(bypassed, afterNodeId, nodeId, branchLabel);
}

export function removeFlowNode(flow: TowerFlowDocument, nodeId: string): TowerFlowDocument {
  if (nodeId === flow.entryNodeId) return flow;
  if (!getNode(flow, nodeId)) return flow;

  return {
    ...bypassNode(flow, nodeId),
    nodes: flow.nodes.filter((node) => node.id !== nodeId),
  };
}

function walkLinearSteps(flow: TowerFlowDocument, startId: string | undefined, visited: Set<string>): FlowStepView[] {
  const steps: FlowStepView[] = [];
  let currentId = startId;

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = getNode(flow, currentId);
    if (!node) break;
    steps.push(flowNodeToStepView(node));
    currentId = getOutgoingEdge(flow, currentId)?.to;
  }

  return steps;
}

/**
 * Graph-aware step tree for the tower canvas.
 * Linear nodes expose `next`; condition nodes expose `branches` with true/false paths.
 */
export function flowToGraphSteps(flow: TowerFlowDocument): FlowGraphStepView[] {
  const visited = new Set<string>();
  const rootSteps = walkLinearSteps(flow, flow.entryNodeId, visited);
  return rootSteps.map((step) => enrichGraphStep(flow, step, visited));
}

function enrichGraphStep(flow: TowerFlowDocument, step: FlowStepView, visited: Set<string>): FlowGraphStepView {
  const node = getNode(flow, step.id);
  if (!node) return { ...step };

  if (node.kind === 'condition') {
    const branches: FlowGraphBranchView[] = [];
    for (const label of ['true', 'false'] as const) {
      const edge = getOutgoingEdge(flow, node.id, label);
      if (!edge) continue;
      const branchSteps = walkLinearSteps(flow, edge.to, visited).map((branchStep) =>
        enrichGraphStep(flow, branchStep, visited),
      );
      if (branchSteps.length > 0) {
        branches.push({ label, steps: branchSteps });
      }
    }
    return branches.length > 0 ? { ...step, branches } : { ...step };
  }

  const nextEdge = getOutgoingEdge(flow, step.id);
  if (!nextEdge || visited.has(nextEdge.to)) return { ...step };

  const nextNode = getNode(flow, nextEdge.to);
  if (!nextNode) return { ...step };

  visited.add(nextEdge.to);
  const nextStep = enrichGraphStep(flow, flowNodeToStepView(nextNode), visited);
  return { ...step, next: nextStep };
}

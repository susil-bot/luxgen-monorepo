import { getFlowCompound } from './catalog';
import { TOWER_FLOW_VERSION } from './types';
import type { FlowValidationError, TowerFlowDocument, FlowNode, FlowEdge } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateNode(raw: unknown, index: number, errors: FlowValidationError[], ids: Set<string>): FlowNode | null {
  if (!isRecord(raw)) {
    errors.push({ path: `nodes[${index}]`, message: 'Node must be an object' });
    return null;
  }

  const id = typeof raw.id === 'string' ? raw.id.trim() : '';
  const kind = raw.kind;
  const compoundId = typeof raw.compoundId === 'string' ? raw.compoundId.trim() : '';

  if (!id) errors.push({ path: `nodes[${index}].id`, message: 'id is required' });
  if (ids.has(id)) errors.push({ path: `nodes[${index}].id`, message: `duplicate id: ${id}` });
  if (id) ids.add(id);

  if (kind !== 'trigger' && kind !== 'condition' && kind !== 'action' && kind !== 'wait') {
    errors.push({ path: `nodes[${index}].kind`, message: 'kind must be trigger, condition, action, or wait' });
  }

  if (!compoundId) {
    errors.push({ path: `nodes[${index}].compoundId`, message: 'compoundId is required' });
  } else {
    const compound = getFlowCompound(compoundId);
    if (!compound) {
      errors.push({ path: `nodes[${index}].compoundId`, message: `unknown compound: ${compoundId}` });
    } else if (compound.kind !== kind) {
      errors.push({
        path: `nodes[${index}].compoundId`,
        message: `compound ${compoundId} is kind ${compound.kind}, not ${String(kind)}`,
      });
    }
  }

  const config = isRecord(raw.config) ? raw.config : {};
  const title = typeof raw.title === 'string' ? raw.title : undefined;

  if (!id || !compoundId || (kind !== 'trigger' && kind !== 'condition' && kind !== 'action' && kind !== 'wait')) {
    return null;
  }

  return { id, kind, compoundId, config, ...(title ? { title } : {}) } as FlowNode;
}

function validateEdge(raw: unknown, index: number, errors: FlowValidationError[]): FlowEdge | null {
  if (!isRecord(raw)) {
    errors.push({ path: `edges[${index}]`, message: 'Edge must be an object' });
    return null;
  }
  const from = typeof raw.from === 'string' ? raw.from : '';
  const to = typeof raw.to === 'string' ? raw.to : '';
  if (!from) errors.push({ path: `edges[${index}].from`, message: 'from is required' });
  if (!to) errors.push({ path: `edges[${index}].to`, message: 'to is required' });
  const label = raw.label;
  if (label !== undefined && label !== 'default' && label !== 'true' && label !== 'false') {
    errors.push({ path: `edges[${index}].label`, message: 'label must be default, true, or false' });
  }
  if (!from || !to) return null;
  return { from, to, ...(label ? { label: label as FlowEdge['label'] } : {}) };
}

export function validateTowerFlowDocument(
  raw: unknown,
): { ok: true; data: TowerFlowDocument } | { ok: false; errors: FlowValidationError[] } {
  const errors: FlowValidationError[] = [];

  if (!isRecord(raw)) {
    return { ok: false, errors: [{ path: 'root', message: 'Flow must be a JSON object' }] };
  }

  if (raw.version !== TOWER_FLOW_VERSION) {
    errors.push({ path: 'version', message: `version must be ${TOWER_FLOW_VERSION}` });
  }

  const meta = isRecord(raw.meta) ? raw.meta : null;
  const name = meta && typeof meta.name === 'string' ? meta.name.trim() : '';
  if (!name) errors.push({ path: 'meta.name', message: 'meta.name is required' });
  const enabled = meta && typeof meta.enabled === 'boolean' ? meta.enabled : false;
  const description = meta && typeof meta.description === 'string' ? meta.description : undefined;

  const entryNodeId = typeof raw.entryNodeId === 'string' ? raw.entryNodeId.trim() : '';
  if (!entryNodeId) errors.push({ path: 'entryNodeId', message: 'entryNodeId is required' });

  const nodeIds = new Set<string>();
  const nodes: FlowNode[] = [];
  if (!Array.isArray(raw.nodes)) {
    errors.push({ path: 'nodes', message: 'nodes must be an array' });
  } else {
    raw.nodes.forEach((node, i) => {
      const parsed = validateNode(node, i, errors, nodeIds);
      if (parsed) nodes.push(parsed);
    });
  }

  const edges: FlowEdge[] = [];
  if (!Array.isArray(raw.edges)) {
    errors.push({ path: 'edges', message: 'edges must be an array' });
  } else {
    raw.edges.forEach((edge, i) => {
      const parsed = validateEdge(edge, i, errors);
      if (parsed) edges.push(parsed);
    });
  }

  const entryNode = nodes.find((n) => n.id === entryNodeId);
  if (entryNodeId && !entryNode) {
    errors.push({ path: 'entryNodeId', message: 'entryNodeId must reference a node in nodes' });
  }
  if (entryNode && entryNode.kind !== 'trigger') {
    errors.push({ path: 'entryNodeId', message: 'entry node must be kind trigger' });
  }

  const triggerCount = nodes.filter((n) => n.kind === 'trigger').length;
  if (triggerCount !== 1) {
    errors.push({ path: 'nodes', message: 'flow must contain exactly one trigger node' });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      version: TOWER_FLOW_VERSION,
      meta: { name, enabled, ...(description ? { description } : {}) },
      entryNodeId,
      nodes,
      edges,
    },
  };
}

export function parseTowerFlowDocument(raw: unknown): TowerFlowDocument | null {
  const result = validateTowerFlowDocument(raw);
  return result.ok ? result.data : null;
}

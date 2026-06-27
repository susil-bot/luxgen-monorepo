import { getFlowCompound } from './catalog';
import { getNode, getOutgoingEdge } from './graph';
import { parseTowerFlowDocument } from './validate';
import type { FlowConditionNode, FlowNode, TowerFlowDocument } from './types';

export type FlowExecutionStep =
  | { kind: 'wait'; nodeId: string; seconds: number; title: string }
  | {
      kind: 'action';
      nodeId: string;
      action: { type: string; label: string; config: Record<string, unknown> };
    };

const MAX_EXECUTION_STEPS = 200;

/** Resolve a dot-path field on the trigger payload (e.g. `order.total`). */
export function getPayloadValue(payload: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.').filter(Boolean);
  let current: unknown = payload;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function stringifyPayloadValue(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function payloadTagsInclude(payload: Record<string, unknown>, tag: string): boolean {
  const tagsRaw = payload.tags ?? payload.orderTags;
  if (Array.isArray(tagsRaw)) return tagsRaw.map(String).includes(tag);
  if (typeof tagsRaw === 'string') {
    return tagsRaw
      .split(',')
      .map((t) => t.trim())
      .includes(tag);
  }
  return false;
}

/** Evaluate a condition node against the trigger payload. Unknown compounds default to false. */
export function evaluateFlowCondition(node: FlowConditionNode, payload: Record<string, unknown>): boolean {
  const config = node.config ?? {};

  switch (node.compoundId) {
    case 'core.condition.field_equals': {
      const field = String(config.field ?? '');
      const operator = String(config.operator ?? 'equals');
      const expected = String(config.value ?? '');
      const actual = stringifyPayloadValue(getPayloadValue(payload, field));
      return operator === 'not_equals' ? actual !== expected : actual === expected;
    }
    case 'core.condition.field_contains': {
      const field = String(config.field ?? '');
      const needle = String(config.value ?? '');
      const actual = stringifyPayloadValue(getPayloadValue(payload, field));
      return actual.includes(needle);
    }
    case 'commerce.condition.order_tag': {
      const tag = String(config.tag ?? '').trim();
      return tag ? payloadTagsInclude(payload, tag) : false;
    }
    case 'commerce.condition.order_total': {
      const operator = String(config.operator ?? 'gte');
      const amountCents = Number(config.amountCents ?? 0);
      const total = Number(payload.totalCents ?? payload.orderTotalCents ?? payload.amountCents ?? 0);
      return operator === 'lte' ? total <= amountCents : total >= amountCents;
    }
    default:
      return false;
  }
}

export function flowActionNodeToLegacyAction(node: FlowNode): {
  type: string;
  label: string;
  config: Record<string, unknown>;
} {
  if (node.kind !== 'action') {
    throw new Error(`Expected action node, got ${node.kind}`);
  }
  const compound = getFlowCompound(node.compoundId);
  return {
    type: compound?.legacyActionType ?? 'CALL_WEBHOOK',
    label: node.title ?? compound?.label ?? node.compoundId,
    config: { ...node.config, _compoundId: node.compoundId },
  };
}

/**
 * Walk the flow graph from `entryNodeId`, following condition branches and default edges.
 * Returns ordered wait + action steps for the automation bridge to execute.
 */
export function planFlowExecution(flow: TowerFlowDocument, payload: Record<string, unknown>): FlowExecutionStep[] {
  const steps: FlowExecutionStep[] = [];
  const visited = new Set<string>();

  function walk(nodeId: string): void {
    if (visited.has(nodeId) || steps.length >= MAX_EXECUTION_STEPS) return;
    visited.add(nodeId);

    const node = getNode(flow, nodeId);
    if (!node) return;

    switch (node.kind) {
      case 'trigger': {
        const next = getOutgoingEdge(flow, node.id);
        if (next) walk(next.to);
        break;
      }
      case 'wait': {
        const seconds = Math.max(0, Number(node.config?.seconds ?? 0));
        const compound = getFlowCompound(node.compoundId);
        steps.push({
          kind: 'wait',
          nodeId: node.id,
          seconds,
          title: node.title ?? compound?.label ?? 'Wait',
        });
        const next = getOutgoingEdge(flow, node.id);
        if (next) walk(next.to);
        break;
      }
      case 'condition': {
        const branch = evaluateFlowCondition(node, payload) ? 'true' : 'false';
        const edge = getOutgoingEdge(flow, node.id, branch);
        if (edge) walk(edge.to);
        break;
      }
      case 'action': {
        steps.push({
          kind: 'action',
          nodeId: node.id,
          action: flowActionNodeToLegacyAction(node),
        });
        const next = getOutgoingEdge(flow, node.id);
        if (next) walk(next.to);
        break;
      }
      default:
        break;
    }
  }

  walk(flow.entryNodeId);
  return steps;
}

/** Parse `flowDefinition` and plan execution steps, or null when invalid/missing. */
export function planFlowExecutionFromDefinition(
  flowDefinition: unknown,
  payload: Record<string, unknown>,
): FlowExecutionStep[] | null {
  const flow = parseTowerFlowDocument(flowDefinition);
  if (!flow) return null;
  return planFlowExecution(flow, payload);
}

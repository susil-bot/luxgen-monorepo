import { FLOW_COMPOUND_CATALOG } from './compounds';
import type { FlowCompoundDefinition, FlowNodeKind, AutomationSchemaExport } from '../types';

const byId = new Map(FLOW_COMPOUND_CATALOG.map((c) => [c.id, c]));

export function getFlowCompound(compoundId: string): FlowCompoundDefinition | undefined {
  return byId.get(compoundId);
}

export function listFlowCompounds(kind?: FlowNodeKind): FlowCompoundDefinition[] {
  if (!kind) return [...FLOW_COMPOUND_CATALOG];
  return FLOW_COMPOUND_CATALOG.filter((c) => c.kind === kind);
}

export function exportAutomationSchema(): AutomationSchemaExport {
  const triggers = listFlowCompounds('trigger');
  const conditions = listFlowCompounds('condition');
  const actions = listFlowCompounds('action');
  const waits = listFlowCompounds('wait');
  return {
    version: 1,
    compounds: FLOW_COMPOUND_CATALOG,
    triggers,
    conditions,
    actions,
    waits,
  };
}

export { FLOW_COMPOUND_CATALOG };

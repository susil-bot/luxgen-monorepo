import { flowToLegacyAutomation, validateTowerFlowDocument, type TowerFlowDocument } from './automation-flow';

export interface TowerFlowMutationInput {
  name: string;
  triggerType: string;
  triggerLabel: string;
  actions: { type: string; label: string; config?: Record<string, unknown> }[];
  enabled: boolean;
  flowDefinition: TowerFlowDocument;
}

export function towerFlowToMutationInput(
  flow: TowerFlowDocument,
): { ok: true; input: TowerFlowMutationInput } | { ok: false; errors: string[] } {
  const validated = validateTowerFlowDocument(flow);
  if (!validated.ok) {
    return { ok: false, errors: validated.errors.map((e) => `${e.path}: ${e.message}`) };
  }

  const legacy = flowToLegacyAutomation(validated.data);
  return {
    ok: true,
    input: {
      name: legacy.name,
      triggerType: legacy.triggerType,
      triggerLabel: legacy.triggerLabel,
      actions: legacy.actions.map((a) => ({
        type: a.type,
        label: a.label,
        config: a.config,
      })),
      enabled: legacy.enabled,
      flowDefinition: validated.data,
    },
  };
}

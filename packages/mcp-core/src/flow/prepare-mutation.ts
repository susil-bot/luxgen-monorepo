import { flowToLegacyAutomation, validateTowerFlowDocument, type TowerFlowDocument } from '@luxgen/automation-flow';

export interface TowerFlowMutationInput {
  name: string;
  triggerType: string;
  triggerLabel: string;
  actions: { type: string; label: string; config?: Record<string, unknown> }[];
  enabled: boolean;
  flowDefinition: TowerFlowDocument;
}

export function parseFlowDefinitionArg(raw: unknown): unknown {
  if (raw === undefined || raw === null) {
    throw new Error('flowDefinition is required');
  }
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      throw new Error('flowDefinition string must be valid JSON');
    }
  }
  if (typeof raw === 'object') {
    return raw;
  }
  throw new Error('flowDefinition must be a JSON object or string');
}

export function towerFlowToMutationInput(
  flowRaw: unknown,
  options?: { enabled?: boolean },
): { ok: true; input: TowerFlowMutationInput } | { ok: false; errors: string[] } {
  const validated = validateTowerFlowDocument(flowRaw);
  if (!validated.ok) {
    return { ok: false, errors: validated.errors.map((e) => `${e.path}: ${e.message}`) };
  }

  const flow = validated.data;
  const enabled = typeof options?.enabled === 'boolean' ? options.enabled : flow.meta.enabled;
  const flowWithEnabled: TowerFlowDocument = {
    ...flow,
    meta: { ...flow.meta, enabled },
  };

  const legacy = flowToLegacyAutomation(flowWithEnabled);
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
      flowDefinition: flowWithEnabled,
    },
  };
}

export function validateFlowDefinitionOnly(
  flowRaw: unknown,
): { ok: true; flow: TowerFlowDocument } | { ok: false; errors: string[] } {
  const validated = validateTowerFlowDocument(flowRaw);
  if (!validated.ok) {
    return { ok: false, errors: validated.errors.map((e) => `${e.path}: ${e.message}`) };
  }
  return { ok: true, flow: validated.data };
}

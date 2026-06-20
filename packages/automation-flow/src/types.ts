/** @luxgen/automation-flow — Tower flow document types (v1) */

export const TOWER_FLOW_VERSION = 1 as const;
export type TowerFlowVersion = typeof TOWER_FLOW_VERSION;

export type FlowNodeKind = 'trigger' | 'condition' | 'action' | 'wait';

export type FlowCompoundCategory = 'commerce' | 'learner' | 'core' | 'developer';

export type FlowConfigFieldType = 'string' | 'number' | 'boolean' | 'select' | 'json' | 'cron' | 'duration';

export interface FlowConfigField {
  key: string;
  label: string;
  type: FlowConfigFieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: unknown;
}

/** Registry entry for triggers, conditions, actions, and waits */
export interface FlowCompoundDefinition {
  id: string;
  kind: FlowNodeKind;
  label: string;
  description: string;
  category: FlowCompoundCategory;
  emoji?: string;
  configFields: FlowConfigField[];
  /** Maps to @luxgen/db AutomationTriggerType when kind === trigger */
  legacyTriggerType?: string;
  /** Maps to @luxgen/db AutomationActionType when kind === action */
  legacyActionType?: string;
}

export interface FlowNodeBase {
  id: string;
  kind: FlowNodeKind;
  compoundId: string;
  title?: string;
  config: Record<string, unknown>;
}

export type FlowTriggerNode = FlowNodeBase & { kind: 'trigger' };
export type FlowConditionNode = FlowNodeBase & { kind: 'condition' };
export type FlowActionNode = FlowNodeBase & { kind: 'action' };
export type FlowWaitNode = FlowNodeBase & { kind: 'wait' };

export type FlowNode = FlowTriggerNode | FlowConditionNode | FlowActionNode | FlowWaitNode;

export type FlowEdgeLabel = 'default' | 'true' | 'false';

export interface FlowEdge {
  from: string;
  to: string;
  label?: FlowEdgeLabel;
}

/** Canonical persisted tower flow — store as JSON on Automation.flowDefinition */
export interface TowerFlowDocument {
  version: TowerFlowVersion;
  meta: {
    name: string;
    enabled: boolean;
    description?: string;
  };
  /** ID of the trigger node inside `nodes` */
  entryNodeId: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface FlowValidationError {
  path: string;
  message: string;
}

export interface LegacyAutomationSnapshot {
  name: string;
  enabled: boolean;
  triggerType: string;
  triggerLabel: string;
  actions: Array<{ type: string; label: string; config?: Record<string, unknown> }>;
}

/** UI-ready ordered step (trigger + downstream linear path) */
export interface FlowStepView {
  id: string;
  kind: FlowNodeKind;
  compoundId: string;
  title: string;
  description: string;
  emoji?: string;
  config: Record<string, unknown>;
}

/** Condition branch for graph-aware tower canvas. */
export interface FlowGraphBranchView {
  label: 'true' | 'false';
  steps: FlowGraphStepView[];
}

/** Tree node for tower canvas — linear `next` chain plus condition `branches`. */
export interface FlowGraphStepView extends FlowStepView {
  next?: FlowGraphStepView;
  branches?: FlowGraphBranchView[];
}

/** Non-fatal graph issues (unreachable nodes, open condition ports, etc.). */
export interface FlowGraphWarning {
  path: string;
  message: string;
}

export interface AutomationSchemaExport {
  version: number;
  compounds: FlowCompoundDefinition[];
  triggers: FlowCompoundDefinition[];
  conditions: FlowCompoundDefinition[];
  actions: FlowCompoundDefinition[];
  waits: FlowCompoundDefinition[];
}

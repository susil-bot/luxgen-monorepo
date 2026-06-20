/** Re-export @luxgen/automation-flow for tower UI and API consumers in apps/web */
export {
  TOWER_FLOW_VERSION,
  FLOW_COMPOUND_CATALOG,
  getFlowCompound,
  listFlowCompounds,
  exportAutomationSchema,
  createOrderCreatedFlow,
  createEmptyFlow,
  flowToOrderedSteps,
  flowToLegacyAutomation,
  flowNodeToStepView,
  validateTowerFlowDocument,
  parseTowerFlowDocument,
  insertFlowStepAfter,
  removeFlowStep,
  moveFlowStep,
} from '@luxgen/automation-flow';

export type {
  TowerFlowDocument,
  FlowNode,
  FlowEdge,
  FlowStepView,
  FlowCompoundDefinition,
  FlowConfigField,
  FlowNodeKind,
  AutomationSchemaExport,
} from '@luxgen/automation-flow';

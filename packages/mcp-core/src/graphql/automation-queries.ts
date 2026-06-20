/** GraphQL documents for automation domain — mirrors apps/web/graphql/queries/automations.ts */

export const LIST_AUTOMATIONS = `
  query ListAutomations($tenantId: String!) {
    automations(tenantId: $tenantId) {
      id
      name
      enabled
      triggerType
      triggerLabel
      actions {
        type
        label
        config
      }
      flowDefinition
      runCount
      lastRunAt
      createdAt
    }
  }
`;

export const GET_AUTOMATION = `
  query GetAutomation($id: ID!) {
    automation(id: $id) {
      id
      tenantId
      name
      enabled
      triggerType
      triggerLabel
      flowDefinition
      actions {
        type
        label
        config
      }
      runCount
      lastRunAt
      createdAt
      updatedAt
    }
  }
`;

export const AUTOMATION_RUNS = `
  query AutomationRuns($tenantId: String!, $limit: Int) {
    automationRuns(tenantId: $tenantId, limit: $limit) {
      id
      automationId
      automationName
      tenantId
      triggerType
      status
      durationMs
      error
      triggeredAt
    }
  }
`;

export const AUTOMATION_SCHEMA = `
  query AutomationSchema {
    automationSchema
  }
`;

export interface AutomationAction {
  type: string;
  label: string;
  config?: Record<string, unknown> | null;
}

export interface AutomationRecord {
  id: string;
  tenantId?: string;
  name: string;
  enabled: boolean;
  triggerType: string;
  triggerLabel: string;
  actions: AutomationAction[];
  flowDefinition?: unknown;
  runCount?: number;
  lastRunAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AutomationRunRecord {
  id: string;
  automationId: string;
  automationName: string;
  tenantId: string;
  triggerType: string;
  status: string;
  durationMs: number;
  error?: string | null;
  triggeredAt: string;
}

export interface ListAutomationsResult {
  automations: AutomationRecord[];
}

export interface GetAutomationResult {
  automation: AutomationRecord | null;
}

export interface AutomationRunsResult {
  automationRuns: AutomationRunRecord[];
}

export interface AutomationSchemaResult {
  automationSchema: unknown;
}

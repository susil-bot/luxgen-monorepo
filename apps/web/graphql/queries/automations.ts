import { gql } from '@apollo/client';

export const GET_AUTOMATIONS = gql`
  query GetAutomations($tenantId: String!) {
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

export const GET_AUTOMATION = gql`
  query GetAutomation($id: ID!) {
    automation(id: $id) {
      id
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
    }
  }
`;

export const GET_AUTOMATION_RUNS = gql`
  query GetAutomationRuns($tenantId: String!, $limit: Int) {
    automationRuns(tenantId: $tenantId, limit: $limit) {
      id
      automationName
      triggeredAt
      status
      durationMs
      error
    }
  }
`;

export const TOGGLE_AUTOMATION = gql`
  mutation ToggleAutomation($id: ID!, $enabled: Boolean!) {
    toggleAutomation(id: $id, enabled: $enabled) {
      id
      enabled
    }
  }
`;

export const CREATE_AUTOMATION = gql`
  mutation CreateAutomation($input: CreateAutomationInput!) {
    createAutomation(input: $input) {
      id
      name
      enabled
      triggerType
      triggerLabel
      flowDefinition
      actions {
        type
        label
      }
      runCount
      lastRunAt
      createdAt
    }
  }
`;

export const UPDATE_AUTOMATION = gql`
  mutation UpdateAutomation($id: ID!, $input: UpdateAutomationInput!) {
    updateAutomation(id: $id, input: $input) {
      id
      name
      enabled
      triggerType
      triggerLabel
      flowDefinition
      actions {
        type
        label
      }
    }
  }
`;

export const DELETE_AUTOMATION = gql`
  mutation DeleteAutomation($id: ID!) {
    deleteAutomation(id: $id)
  }
`;

export const RUN_AGENT_TASK = gql`
  mutation RunAgentTask($input: RunAgentTaskInput!) {
    runAgentTask(input: $input) {
      sessionId
      status
      jobId
    }
  }
`;

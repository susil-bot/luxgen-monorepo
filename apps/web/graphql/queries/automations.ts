import { gql } from '@apollo/client';

export const GET_AUTOMATIONS = gql`
  query GetAutomations($tenantId: String!) {
    automations(tenantId: $tenantId) {
      id
      name
      enabled
      status
      publishedAt
      archivedAt
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
      status
      publishedAt
      archivedAt
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
  query GetAutomationRuns($tenantId: String!, $limit: Int, $automationId: ID) {
    automationRuns(tenantId: $tenantId, limit: $limit, automationId: $automationId) {
      id
      automationId
      automationName
      triggerType
      triggeredAt
      startedAt
      completedAt
      status
      durationMs
      error
    }
  }
`;

export const GET_AUTOMATION_RUN = gql`
  query GetAutomationRun($id: ID!) {
    automationRun(id: $id) {
      id
      automationId
      automationName
      triggerType
      triggeredAt
      startedAt
      completedAt
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
      status
      publishedAt
      archivedAt
    }
  }
`;

export const PUBLISH_AUTOMATION = gql`
  mutation PublishAutomation($id: ID!) {
    publishAutomation(id: $id) {
      id
      enabled
      status
      publishedAt
      archivedAt
      flowDefinition
    }
  }
`;

export const PAUSE_AUTOMATION = gql`
  mutation PauseAutomation($id: ID!) {
    pauseAutomation(id: $id) {
      id
      enabled
      status
      publishedAt
      archivedAt
      flowDefinition
    }
  }
`;

export const ARCHIVE_AUTOMATION = gql`
  mutation ArchiveAutomation($id: ID!) {
    archiveAutomation(id: $id) {
      id
      enabled
      status
      publishedAt
      archivedAt
      flowDefinition
    }
  }
`;

export const CREATE_AUTOMATION = gql`
  mutation CreateAutomation($input: CreateAutomationInput!) {
    createAutomation(input: $input) {
      id
      name
      enabled
      status
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
      status
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

export const DUPLICATE_AUTOMATION = gql`
  mutation DuplicateAutomation($id: ID!, $name: String) {
    duplicateAutomation(id: $id, name: $name) {
      id
      name
      enabled
      status
      triggerType
      triggerLabel
      flowDefinition
      actions {
        type
        label
      }
      runCount
      createdAt
    }
  }
`;

export const TEST_AUTOMATION = gql`
  mutation TestAutomation($id: ID!, $testData: JSON) {
    testAutomation(id: $id, testData: $testData) {
      run {
        id
        automationId
        automationName
        status
        startedAt
        completedAt
        durationMs
        error
      }
      errors
    }
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

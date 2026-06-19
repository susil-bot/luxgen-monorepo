export const automationTypeDefs = `
  enum AutomationTriggerType {
    COURSE_COMPLETED
    USER_ENROLLED
    GROUP_JOINED
    CERTIFICATE_ISSUED
    SCHEDULE
    WEBHOOK
    CODE_CHANGE_STAGED
    CODE_CHANGE_COMMITTED
    CODE_CHANGE_MERGED
    CODE_CHANGE_FAILED
  }

  enum AutomationActionType {
    SEND_EMAIL
    ADD_TO_GROUP
    REMOVE_FROM_GROUP
    ENROLL_IN_COURSE
    ISSUE_CERTIFICATE
    CALL_WEBHOOK
    NOTIFY_SLACK
    TAG_USER
    RUN_AGENT_TASK
  }

  enum AutomationRunStatus {
    success
    error
    running
  }

  type AutomationAction {
    type: AutomationActionType!
    label: String!
    config: JSON
  }

  type Automation {
    id: ID!
    tenantId: String!
    name: String!
    enabled: Boolean!
    triggerType: AutomationTriggerType!
    triggerLabel: String!
    actions: [AutomationAction!]!
    runCount: Int!
    lastRunAt: Date
    createdAt: Date!
    updatedAt: Date!
  }

  type AutomationRun {
    id: ID!
    automationId: ID!
    automationName: String!
    tenantId: String!
    triggerType: AutomationTriggerType!
    status: AutomationRunStatus!
    durationMs: Int!
    error: String
    triggeredAt: Date!
  }

  type AgentTaskResult {
    sessionId: ID!
    status: String!
    jobId: String
  }

  input AutomationActionInput {
    type: AutomationActionType!
    label: String!
    config: JSON
  }

  input CreateAutomationInput {
    tenantId: String!
    name: String!
    triggerType: AutomationTriggerType!
    triggerLabel: String!
    actions: [AutomationActionInput!]!
    enabled: Boolean
  }

  input UpdateAutomationInput {
    name: String
    triggerType: AutomationTriggerType
    triggerLabel: String
    actions: [AutomationActionInput!]
    enabled: Boolean
  }

  input RunAgentTaskInput {
    tenantId: String!
    prompt: String!
    model: String
  }

  extend type Query {
    automations(tenantId: String!): [Automation!]!
    automation(id: ID!): Automation
    automationRuns(tenantId: String!, limit: Int): [AutomationRun!]!
    automationSchema: JSON!
  }

  extend type Mutation {
    createAutomation(input: CreateAutomationInput!): Automation!
    updateAutomation(id: ID!, input: UpdateAutomationInput!): Automation
    toggleAutomation(id: ID!, enabled: Boolean!): Automation
    deleteAutomation(id: ID!): Boolean!
    runAgentTask(input: RunAgentTaskInput!): AgentTaskResult!
  }
`;

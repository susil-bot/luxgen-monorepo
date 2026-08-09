export const automationTypeDefs = `
  enum AutomationTriggerType {
    COURSE_COMPLETED
    USER_ENROLLED
    GROUP_JOINED
    CERTIFICATE_ISSUED
    CERTIFICATE_EXPIRING_SOON
    SCHEDULE
    WEBHOOK
    ORDER_CREATED
    ORDER_DRAFTED
    ORDER_UPDATED
    PAYMENT_SENT
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
    UPDATE_ORDER_FIELDS
  }

  enum AutomationRunStatus {
    success
    error
    running
  }

  """TODO WorkflowStatus — draft / live / paused / archived (enabled mirrors live)."""
  enum AutomationStatus {
    draft
    live
    paused
    archived
  }

  type AutomationAction {
    type: AutomationActionType!
    label: String!
    config: JSON
  }

  type AutomationNotifySettings {
    onFailure: Boolean!
    onSuccess: Boolean!
  }

  # Both fields optional so updateAutomation can patch just one flag at a time (service merges with the existing value).
  input AutomationNotifySettingsInput {
    onFailure: Boolean
    onSuccess: Boolean
  }

  type Automation {
    id: ID!
    tenantId: String!
    name: String!
    enabled: Boolean!
    status: AutomationStatus!
    publishedAt: Date
    archivedAt: Date
    triggerType: AutomationTriggerType!
    triggerLabel: String!
    actions: [AutomationAction!]!
    flowDefinition: JSON
    runCount: Int!
    lastRunAt: Date
    notifySettings: AutomationNotifySettings
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
    """Alias of triggeredAt — when the run started."""
    startedAt: Date!
    triggeredAt: Date!
    """Null while status=running; otherwise startedAt + durationMs."""
    completedAt: Date
  }

  type AgentTaskResult {
    sessionId: ID!
    status: String!
    jobId: String
  }

  type TestAutomationResult {
    run: AutomationRun!
    errors: [String!]!
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
    flowDefinition: JSON
    notifySettings: AutomationNotifySettingsInput
  }

  input UpdateAutomationInput {
    name: String
    triggerType: AutomationTriggerType
    triggerLabel: String
    actions: [AutomationActionInput!]
    enabled: Boolean
    flowDefinition: JSON
    notifySettings: AutomationNotifySettingsInput
  }

  input RunAgentTaskInput {
    tenantId: String!
    prompt: String!
    model: String
  }

  extend type Query {
    automations(tenantId: String!, limit: Int, offset: Int): [Automation!]!
    automation(id: ID!): Automation
    """Tenant-scoped run history. Optional automationId filters to one workflow."""
    automationRuns(tenantId: String!, limit: Int, automationId: ID): [AutomationRun!]!
    """Single run detail — tenant-scoped via context."""
    automationRun(id: ID!): AutomationRun
    automationSchema: JSON!
  }

  extend type Mutation {
    createAutomation(input: CreateAutomationInput!): Automation!
    updateAutomation(id: ID!, input: UpdateAutomationInput!): Automation
    toggleAutomation(id: ID!, enabled: Boolean!): Automation
    """TODO §12 PublishWorkflow — status=live, enabled=true."""
    publishAutomation(id: ID!): Automation
    """TODO §12 PauseWorkflow — status=paused, enabled=false."""
    pauseAutomation(id: ID!): Automation
    """TODO §12 ArchiveWorkflow — soft archive; stops runs."""
    archiveAutomation(id: ID!): Automation
    deleteAutomation(id: ID!): Boolean!
    """TODO §12 DuplicateWorkflow — clone automation config; new row starts disabled."""
    duplicateAutomation(id: ID!, name: String): Automation
    """TODO §12 TestWorkflow — create a run with sample payload (no live trigger)."""
    testAutomation(id: ID!, testData: JSON): TestAutomationResult!
    runAgentTask(input: RunAgentTaskInput!): AgentTaskResult!
  }
`;

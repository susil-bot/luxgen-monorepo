export const todoTypeDefs = `
  enum TaskStatus {
    DRAFT
    OPEN
    TODO
    IN_PROGRESS
    BLOCKED
    READY_FOR_REVIEW
    COMPLETED
    DONE
    CANCELLED
    ARCHIVED
  }

  enum TaskPriority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  type TodoList {
    id: ID!
    tenantId: String!
    name: String!
    taskCount: Int!
    createdById: String
    createdAt: Date!
    updatedAt: Date!
  }

  type Task {
    id: ID!
    tenantId: String!
    todoListId: String!
    title: String!
    notes: String
    status: TaskStatus!
    priority: TaskPriority!
    sortOrder: Int!
    teamId: ID
    assigneeId: ID
    followerIds: [ID!]!
    startDate: Date
    dueDate: Date
    timezone: String
    completedAt: Date
    templateId: ID
    createdById: String
    createdAt: Date!
    updatedAt: Date!
  }

  type TaskActivity {
    id: ID!
    taskId: ID!
    message: String!
    actorId: String
    actorName: String
    field: String
    oldValue: String
    newValue: String
    source: String!
    createdAt: Date!
  }

  enum ReminderStatus {
    scheduled
    fired
    snoozed
    cancelled
  }

  type TaskReminder {
    id: ID!
    taskId: ID!
    fireAt: Date!
    offsetPreset: String
    channelPrefs: [String!]!
    status: ReminderStatus!
    snoozeUntil: Date
    lastFiredAt: Date
    createdAt: Date!
    updatedAt: Date!
  }

  type AppNotification {
    id: ID!
    category: String!
    title: String!
    body: String!
    taskId: ID
    reminderId: ID
    readAt: Date
    createdAt: Date!
  }

  enum TaskFieldType {
    text
    number
    currency
    date
    datetime
    select
    multi
    person
    team
    file
    url
    checkbox
    richtext
  }

  type TaskFieldDefinition {
    id: ID!
    name: String!
    type: TaskFieldType!
    required: Boolean!
    options: [String!]!
    helpText: String
  }

  type TaskTemplate {
    id: ID!
    tenantId: String!
    teamId: ID
    name: String!
    description: String
    fields: [TaskFieldDefinition!]!
    createdById: String
    createdAt: Date!
    updatedAt: Date!
  }

  type TaskFieldValue {
    id: ID!
    taskId: ID!
    fieldDefinitionId: ID!
    value: JSON
    updatedAt: Date!
  }

  input TaskFieldDefinitionInput {
    id: ID
    name: String!
    type: TaskFieldType!
    required: Boolean
    options: [String!]
    helpText: String
  }

  input CreateTaskTemplateInput {
    tenantId: String!
    name: String!
    description: String
    teamId: ID
    fields: [TaskFieldDefinitionInput!]
  }

  input UpdateTaskTemplateInput {
    name: String
    description: String
    teamId: ID
    fields: [TaskFieldDefinitionInput!]
  }

  input CreateReminderInput {
    fireAt: Date
    offsetPreset: String
    channelPrefs: [String!]
  }

  input UpdateReminderInput {
    fireAt: Date
    offsetPreset: String
    channelPrefs: [String!]
    status: ReminderStatus
  }

  input CreateTodoListInput {
    tenantId: String!
    name: String!
  }

  input UpdateTodoListInput {
    name: String
  }

  input CreateTaskInput {
    tenantId: String!
    todoListId: String!
    title: String!
    notes: String
    status: TaskStatus
    priority: TaskPriority
    teamId: ID
    assigneeId: ID
    followerIds: [ID!]
    startDate: Date
    dueDate: Date
    timezone: String
    templateId: ID
  }

  input UpdateTaskInput {
    title: String
    notes: String
    status: TaskStatus
    priority: TaskPriority
    teamId: ID
    assigneeId: ID
    followerIds: [ID!]
    startDate: Date
    dueDate: Date
    timezone: String
    templateId: ID
  }

  extend type Query {
    """A tenant's named todo lists. Auto-creates a default "My Tasks" list (and adopts any
    pre-multi-list tasks into it) the first time a tenant with no lists calls this."""
    todoLists(tenantId: String!): [TodoList!]!
    todoList(id: ID!, tenantId: String!): TodoList
    tasks(tenantId: String!, todoListId: String, status: TaskStatus): [Task!]!
    task(id: ID!, tenantId: String!): Task
    taskActivity(taskId: ID!, tenantId: String!, limit: Int): [TaskActivity!]!
    taskReminders(taskId: ID!, tenantId: String!): [TaskReminder!]!
    myNotifications(tenantId: String!, unreadOnly: Boolean): [AppNotification!]!
    taskTemplates(tenantId: String!, teamId: ID): [TaskTemplate!]!
    taskTemplate(id: ID!, tenantId: String!): TaskTemplate
    taskFieldValues(taskId: ID!, tenantId: String!): [TaskFieldValue!]!
  }

  extend type Mutation {
    createTodoList(input: CreateTodoListInput!): TodoList!
    updateTodoList(id: ID!, tenantId: String!, input: UpdateTodoListInput!): TodoList
    """Deletes the list and every task in it."""
    deleteTodoList(id: ID!, tenantId: String!): Boolean!

    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, tenantId: String!, input: UpdateTaskInput!): Task
    toggleTask(id: ID!, tenantId: String!): Task
    """Marks COMPLETED; fails with REQUIRED_FIELDS_INCOMPLETE when required values missing."""
    completeTask(id: ID!, tenantId: String!): Task
    deleteTask(id: ID!, tenantId: String!): Boolean!
    """Persists new sortOrder for each id, in the order given — used by drag-reorder in the To Do list and Board."""
    reorderTasks(tenantId: String!, todoListId: String, orderedIds: [ID!]!): [Task!]!

    createTaskReminder(taskId: ID!, tenantId: String!, input: CreateReminderInput!): TaskReminder!
    updateTaskReminder(id: ID!, tenantId: String!, input: UpdateReminderInput!): TaskReminder
    snoozeTaskReminder(id: ID!, tenantId: String!, until: Date!): TaskReminder
    deleteTaskReminder(id: ID!, tenantId: String!): Boolean!

    createTaskTemplate(input: CreateTaskTemplateInput!): TaskTemplate!
    updateTaskTemplate(id: ID!, tenantId: String!, input: UpdateTaskTemplateInput!): TaskTemplate
    deleteTaskTemplate(id: ID!, tenantId: String!): Boolean!
    applyTaskTemplate(taskId: ID!, tenantId: String!, templateId: ID!): Task!
    upsertTaskFieldValue(taskId: ID!, tenantId: String!, fieldId: ID!, value: JSON!): TaskFieldValue!
  }
`;

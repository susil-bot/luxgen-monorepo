# Todo Engine — API

> LuxGen is **GraphQL-first** (`apps/api`). Prefer GraphQL equivalents of the REST shapes in the product prompt. Job triggers remain REST (`/api/jobs`) for cron.

---

## 1. Existing GraphQL (keep / extend)

```graphql
# Already shipped — apps/api/src/schema/todo/typeDefs.ts
todoLists(tenantId: String!): [TodoList!]!
todoList(id: ID!, tenantId: String!): TodoList
tasks(tenantId: String!, todoListId: String, status: TaskStatus): [Task!]!
task(id: ID!, tenantId: String!): Task

createTodoList / updateTodoList / deleteTodoList
createTask / updateTask / toggleTask / deleteTask / reorderTasks
```

**Conventions to preserve**

- `tenantId` args + `scopedTenantId(ctx, tenantId)`
- Authenticated mutations (not public)
- Return GraphQL types via `*Service.toGraphQL`

---

## 2. Phase 1 — Task enrichment

Extend `Task` / inputs:

```graphql
enum TaskStatus {
  DRAFT
  OPEN
  IN_PROGRESS
  BLOCKED
  READY_FOR_REVIEW
  COMPLETED
  CANCELLED
  ARCHIVED
  # deprecate aliases if needed: TODO, DONE mapped in resolvers
}

enum TaskPriority { LOW MEDIUM HIGH CRITICAL }

extend type Task {
  priority: TaskPriority
  teamId: ID
  assigneeId: ID
  followerIds: [ID!]
  startDate: Date
  timezone: String
  completedAt: Date
}

extend input CreateTaskInput { ... }
extend input UpdateTaskInput { ... }

extend type Query {
  taskActivity(taskId: ID!, tenantId: String!, limit: Int): [TaskActivity!]!
}
```

---

## 3. Phase 2 — Reminders & notifications

```graphql
type TaskReminder {
  id: ID!
  taskId: ID!
  fireAt: Date!
  offsetPreset: String
  status: ReminderStatus!
  snoozeUntil: Date
}

extend type Mutation {
  createTaskReminder(taskId: ID!, tenantId: String!, input: CreateReminderInput!): TaskReminder!
  updateTaskReminder(id: ID!, tenantId: String!, input: UpdateReminderInput!): TaskReminder
  snoozeTaskReminder(id: ID!, tenantId: String!, until: Date!): TaskReminder
  deleteTaskReminder(id: ID!, tenantId: String!): Boolean!
}

extend type Query {
  taskReminders(taskId: ID!, tenantId: String!): [TaskReminder!]!
  myNotifications(tenantId: String!, unreadOnly: Boolean): [AppNotification!]!
}

extend type Mutation {
  markNotificationRead(id: ID!, tenantId: String!): AppNotification
}
```

### Jobs (REST)

```
POST /api/jobs/task-reminders   Header: x-jobs-key
Body: { tenantId?: string }
→ { processed, enqueued, skipped }

POST /api/jobs/task-overdue
POST /api/jobs/task-recurrence
```

Same auth pattern as `certificate-reminders`.

---

## 4. Phase 3 — Required fields

```graphql
type TaskTemplate { id, teamId, name, fields: [TaskFieldDefinition!]! }
type TaskFieldDefinition { id, name, type, required, validation, ... }
type TaskFieldValue { fieldId, value: JSON }

extend type Mutation {
  upsertTaskFieldValue(taskId: ID!, tenantId: String!, fieldId: ID!, value: JSON!): TaskFieldValue!
  # completeTask fails with REQUIRED_FIELDS_INCOMPLETE + missing[]
  completeTask(id: ID!, tenantId: String!): Task!
}
```

---

## 5. Phase 5–6 — Task automations

```graphql
type TaskAutomation {
  id: ID!
  name: String!
  enabled: Boolean!
  trigger: JSON!      # typed later
  conditions: JSON!
  actions: JSON!
}

type TaskAutomationExecution {
  id: ID!
  automationId: ID!
  taskId: ID!
  status: ExecutionStatus!
  steps: [JSON!]!
  startedAt: Date!
  finishedAt: Date
  error: String
}

extend type Query {
  taskAutomations(tenantId: String!, todoListId: ID): [TaskAutomation!]!
  taskAutomationExecutions(automationId: ID!, tenantId: String!): [TaskAutomationExecution!]!
}

extend type Mutation {
  createTaskAutomation(input: CreateTaskAutomationInput!): TaskAutomation!
  updateTaskAutomation(id: ID!, tenantId: String!, input: UpdateTaskAutomationInput!): TaskAutomation
  enableTaskAutomation / disableTaskAutomation
  testTaskAutomation(id: ID!, tenantId: String!, sampleTaskId: ID!): TaskAutomationExecution!
  deleteTaskAutomation(id: ID!, tenantId: String!): Boolean!
}
```

**Relationship to platform `Automation`:**  
Task automations are **Todo-scoped** documents first. Optional Phase 8 bridge: emit `emitAutomationEvent({ triggerType: 'TASK_COMPLETED', ... })` so Tower workflows can react — do not force all task rules through Tower in Phase 5.

---

## 6. Phase 7 — AI (mutations with preview)

```graphql
extend type Mutation {
  analyzeTask(taskId: ID!, tenantId: String!): TaskAiAnalysis! # suggestions only
  draftTaskAutomation(taskId: ID!, tenantId: String!, prompt: String!): TaskAutomationDraft!
  # applyDraftTaskAutomation requires explicit confirm + createTaskAutomation
}
```

---

## 7. Error codes

| Code                         | Meaning                               |
| ---------------------------- | ------------------------------------- |
| `BAD_USER_INPUT`             | validation                            |
| `REQUIRED_FIELDS_INCOMPLETE` | cannot complete                       |
| `FORBIDDEN`                  | RBAC / tenant                         |
| `NOT_FOUND`                  | missing task                          |
| `AUTOMATION_FAILED`          | action error (execution still logged) |
| `IDEMPOTENT_REPLAY`          | safe no-op                            |

---

## 8. Client ops location

Continue `apps/web/graphql/queries/todo.ts` (or split `taskReminders.ts` / `taskAutomations.ts` when large).

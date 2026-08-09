import { gql } from '@apollo/client';

export const TASK_FIELDS = gql`
  fragment TaskFields on Task {
    id
    todoListId
    title
    notes
    status
    priority
    sortOrder
    teamId
    assigneeId
    followerIds
    startDate
    dueDate
    timezone
    completedAt
    templateId
    createdById
    createdAt
    updatedAt
  }
`;

export const GET_TODO_LISTS = gql`
  query GetTodoLists($tenantId: String!) {
    todoLists(tenantId: $tenantId) {
      id
      name
      taskCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_TODO_LIST = gql`
  query GetTodoList($id: ID!, $tenantId: String!) {
    todoList(id: $id, tenantId: $tenantId) {
      id
      name
      taskCount
    }
  }
`;

export const CREATE_TODO_LIST = gql`
  mutation CreateTodoList($input: CreateTodoListInput!) {
    createTodoList(input: $input) {
      id
      name
      taskCount
      createdAt
      updatedAt
    }
  }
`;

export const RENAME_TODO_LIST = gql`
  mutation RenameTodoList($id: ID!, $tenantId: String!, $input: UpdateTodoListInput!) {
    updateTodoList(id: $id, tenantId: $tenantId, input: $input) {
      id
      name
      updatedAt
    }
  }
`;

export const DELETE_TODO_LIST = gql`
  mutation DeleteTodoList($id: ID!, $tenantId: String!) {
    deleteTodoList(id: $id, tenantId: $tenantId)
  }
`;

export const GET_TASKS = gql`
  query GetTasks($tenantId: String!, $todoListId: String, $status: TaskStatus) {
    tasks(tenantId: $tenantId, todoListId: $todoListId, status: $status) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`;

export const GET_TASK_ACTIVITY = gql`
  query GetTaskActivity($taskId: ID!, $tenantId: String!, $limit: Int) {
    taskActivity(taskId: $taskId, tenantId: $tenantId, limit: $limit) {
      id
      taskId
      message
      actorId
      actorName
      field
      oldValue
      newValue
      source
      createdAt
    }
  }
`;

export const GET_TASK_REMINDERS = gql`
  query GetTaskReminders($taskId: ID!, $tenantId: String!) {
    taskReminders(taskId: $taskId, tenantId: $tenantId) {
      id
      taskId
      fireAt
      offsetPreset
      channelPrefs
      status
      snoozeUntil
      lastFiredAt
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_TASK_REMINDER = gql`
  mutation CreateTaskReminder($taskId: ID!, $tenantId: String!, $input: CreateReminderInput!) {
    createTaskReminder(taskId: $taskId, tenantId: $tenantId, input: $input) {
      id
      fireAt
      offsetPreset
      status
      snoozeUntil
    }
  }
`;

export const SNOOZE_TASK_REMINDER = gql`
  mutation SnoozeTaskReminder($id: ID!, $tenantId: String!, $until: Date!) {
    snoozeTaskReminder(id: $id, tenantId: $tenantId, until: $until) {
      id
      fireAt
      status
      snoozeUntil
    }
  }
`;

export const DELETE_TASK_REMINDER = gql`
  mutation DeleteTaskReminder($id: ID!, $tenantId: String!) {
    deleteTaskReminder(id: $id, tenantId: $tenantId)
  }
`;

export const GET_TASK_TEMPLATES = gql`
  query GetTaskTemplates($tenantId: String!, $teamId: ID) {
    taskTemplates(tenantId: $tenantId, teamId: $teamId) {
      id
      name
      description
      teamId
      fields {
        id
        name
        type
        required
        options
        helpText
      }
    }
  }
`;

export const GET_TASK_FIELD_VALUES = gql`
  query GetTaskFieldValues($taskId: ID!, $tenantId: String!) {
    taskFieldValues(taskId: $taskId, tenantId: $tenantId) {
      id
      fieldDefinitionId
      value
      updatedAt
    }
  }
`;

export const CREATE_TASK_TEMPLATE = gql`
  mutation CreateTaskTemplate($input: CreateTaskTemplateInput!) {
    createTaskTemplate(input: $input) {
      id
      name
      fields {
        id
        name
        type
        required
      }
    }
  }
`;

export const APPLY_TASK_TEMPLATE = gql`
  mutation ApplyTaskTemplate($taskId: ID!, $tenantId: String!, $templateId: ID!) {
    applyTaskTemplate(taskId: $taskId, tenantId: $tenantId, templateId: $templateId) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`;

export const UPSERT_TASK_FIELD_VALUE = gql`
  mutation UpsertTaskFieldValue($taskId: ID!, $tenantId: String!, $fieldId: ID!, $value: JSON!) {
    upsertTaskFieldValue(taskId: $taskId, tenantId: $tenantId, fieldId: $fieldId, value: $value) {
      id
      fieldDefinitionId
      value
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $tenantId: String!, $input: UpdateTaskInput!) {
    updateTask(id: $id, tenantId: $tenantId, input: $input) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`;

export const TOGGLE_TASK = gql`
  mutation ToggleTask($id: ID!, $tenantId: String!) {
    toggleTask(id: $id, tenantId: $tenantId) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!, $tenantId: String!) {
    deleteTask(id: $id, tenantId: $tenantId)
  }
`;

export const REORDER_TASKS = gql`
  mutation ReorderTasks($tenantId: String!, $todoListId: String, $orderedIds: [ID!]!) {
    reorderTasks(tenantId: $tenantId, todoListId: $todoListId, orderedIds: $orderedIds) {
      id
      sortOrder
    }
  }
`;

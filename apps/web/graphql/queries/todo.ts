import { gql } from '@apollo/client';

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
      id
      todoListId
      title
      notes
      status
      sortOrder
      dueDate
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      todoListId
      title
      notes
      status
      sortOrder
      dueDate
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $tenantId: String!, $input: UpdateTaskInput!) {
    updateTask(id: $id, tenantId: $tenantId, input: $input) {
      id
      title
      notes
      status
      sortOrder
      dueDate
      updatedAt
    }
  }
`;

export const TOGGLE_TASK = gql`
  mutation ToggleTask($id: ID!, $tenantId: String!) {
    toggleTask(id: $id, tenantId: $tenantId) {
      id
      status
      updatedAt
    }
  }
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

import { gql } from '@apollo/client';

export const GET_TASKS = gql`
  query GetTasks($tenantId: String!, $status: TaskStatus) {
    tasks(tenantId: $tenantId, status: $status) {
      id
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
  mutation ReorderTasks($tenantId: String!, $orderedIds: [ID!]!) {
    reorderTasks(tenantId: $tenantId, orderedIds: $orderedIds) {
      id
      sortOrder
    }
  }
`;

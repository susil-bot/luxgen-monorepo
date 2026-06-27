import { gql } from '@apollo/client';

export const GET_PROJECT_ITEMS = gql`
  query GetProjectItems(
    $tenantId: String!
    $iteration: ProjectItemIteration
    $status: ProjectItemStatus
    $priority: ProjectItemPriority
    $assigneeId: ID
    $search: String
  ) {
    projectItems(
      tenantId: $tenantId
      iteration: $iteration
      status: $status
      priority: $priority
      assigneeId: $assigneeId
      search: $search
    ) {
      id
      tenantId
      title
      description
      status
      iteration
      priority
      assigneeName
      assigneeId
      startDate
      endDate
      estimate
      labels
      courseId
      sortOrder
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROJECT_ITEM = gql`
  query GetProjectItem($id: ID!, $tenantId: String!) {
    projectItem(id: $id, tenantId: $tenantId) {
      id
      tenantId
      title
      description
      status
      iteration
      priority
      assigneeName
      assigneeId
      startDate
      endDate
      estimate
      labels
      courseId
      sortOrder
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_PROJECT_ITEM = gql`
  mutation CreateProjectItem($input: CreateProjectItemInput!) {
    createProjectItem(input: $input) {
      id
      title
      status
      iteration
      priority
    }
  }
`;

export const UPDATE_PROJECT_ITEM = gql`
  mutation UpdateProjectItem($id: ID!, $tenantId: String!, $input: UpdateProjectItemInput!) {
    updateProjectItem(id: $id, tenantId: $tenantId, input: $input) {
      id
      title
      status
      iteration
      priority
      assigneeName
      startDate
      endDate
      estimate
      labels
      updatedAt
    }
  }
`;

export const MOVE_PROJECT_ITEM = gql`
  mutation MoveProjectItem($id: ID!, $tenantId: String!, $status: ProjectItemStatus!) {
    moveProjectItem(id: $id, tenantId: $tenantId, status: $status) {
      id
      status
      sortOrder
      updatedAt
    }
  }
`;

export const DELETE_PROJECT_ITEM = gql`
  mutation DeleteProjectItem($id: ID!, $tenantId: String!) {
    deleteProjectItem(id: $id, tenantId: $tenantId)
  }
`;

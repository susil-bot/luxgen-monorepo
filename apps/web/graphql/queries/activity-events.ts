import { gql } from '@apollo/client';

export const GET_ACTIVITY_EVENTS = gql`
  query GetActivityEvents(
    $tenantId: ID!
    $subjectType: ActivitySubjectType!
    $subjectId: String!
    $first: Int
    $after: String
  ) {
    activityEvents(
      tenantId: $tenantId
      subjectType: $subjectType
      subjectId: $subjectId
      first: $first
      after: $after
    ) {
      edges {
        cursor
        node {
          id
          subjectType
          subjectId
          kind
          eventType
          message
          createdAt
          actorType
          actorName
          field
          oldValue
          newValue
          metadata
          criticalAlert
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const ACTIVITY_EVENT_ADDED = gql`
  subscription ActivityEventAdded($tenantId: ID!, $subjectType: ActivitySubjectType!, $subjectId: String!) {
    activityEventAdded(tenantId: $tenantId, subjectType: $subjectType, subjectId: $subjectId) {
      id
      subjectType
      subjectId
      kind
      eventType
      message
      createdAt
      actorType
      actorName
      field
      oldValue
      newValue
      metadata
      criticalAlert
    }
  }
`;

export const ADD_ACTIVITY_COMMENT = gql`
  mutation AddActivityComment($input: AddActivityCommentInput!) {
    addActivityComment(input: $input) {
      id
      message
      createdAt
      kind
      actorName
      metadata
      criticalAlert
    }
  }
`;

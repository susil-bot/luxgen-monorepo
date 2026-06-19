import { gql } from '@apollo/client';

export const GET_ACTIVITY_EVENTS = gql`
  query GetActivityEvents(
    $tenantId: ID!
    $subjectType: ActivitySubjectType!
    $subjectId: String!
    $first: Int
  ) {
    activityEvents(
      tenantId: $tenantId
      subjectType: $subjectType
      subjectId: $subjectId
      first: $first
    ) {
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
    }
  }
`;

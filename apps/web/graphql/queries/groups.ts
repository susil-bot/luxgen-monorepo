import { gql } from '@apollo/client';

export const GET_GROUPS = gql`
  query GetGroups($first: Int, $search: String, $isActive: Boolean) {
    groups(first: $first, search: $search, isActive: $isActive) {
      edges {
        node {
          id
          name
          description
          color
          icon
          memberCount
          isActive
          settings {
            maxMembers
          }
          createdAt
        }
        cursor
      }
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_GROUP = gql`
  query GetGroup($id: ID!) {
    group(id: $id) {
      id
      name
      description
      color
      icon
      memberCount
      isActive
      settings {
        maxMembers
        allowSelfJoin
        requireApproval
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_GROUP_MEMBERS = gql`
  query GetGroupMembers($groupId: ID!, $first: Int) {
    groupMembers(groupId: $groupId, first: $first) {
      edges {
        node {
          id
          role
          joinedAt
          isActive
          user {
            id
            firstName
            lastName
            email
          }
        }
      }
      totalCount
    }
  }
`;

export const UPDATE_GROUP = gql`
  mutation UpdateGroup($input: UpdateGroupInput!) {
    updateGroup(input: $input) {
      id
      name
      description
      isActive
      settings {
        maxMembers
      }
    }
  }
`;

export const CREATE_GROUP = gql`
  mutation CreateGroup($input: CreateGroupInput!) {
    createGroup(input: $input) {
      id
      name
      description
      memberCount
    }
  }
`;

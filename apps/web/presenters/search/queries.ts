import { gql } from '@apollo/client';
import { getCourseSearchFieldFragment, getUserSearchFieldFragment } from '../_shared/queries';

export const getSearchCoursesDocument = /* GraphQL */ `
  ${getCourseSearchFieldFragment()}

  query getSearchCourses($tenantId: ID!) {
    courses(tenantId: $tenantId) {
      ...courseSearchField
    }
  }
`;

export const getSearchUsersDocument = /* GraphQL */ `
  ${getUserSearchFieldFragment()}

  query getSearchUsers($tenantId: ID!) {
    users(tenantId: $tenantId) {
      ...userSearchField
    }
  }
`;

/** Apollo-ready documents */
export const GET_SEARCH_COURSES = gql(getSearchCoursesDocument);
export const GET_SEARCH_USERS = gql(getSearchUsersDocument);

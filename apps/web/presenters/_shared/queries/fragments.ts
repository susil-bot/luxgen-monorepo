/**
 * Shared GraphQL fragments for presenters.
 * Each export returns a fragment definition string (VERSO-style).
 */

export function getCourseSearchFieldFragment(): string {
  return /* GraphQL */ `
    fragment courseSearchField on Course {
      id
      title
      description
      status
    }
  `;
}

export function getUserSearchFieldFragment(): string {
  return /* GraphQL */ `
    fragment userSearchField on User {
      id
      email
      firstName
      lastName
      role
    }
  `;
}

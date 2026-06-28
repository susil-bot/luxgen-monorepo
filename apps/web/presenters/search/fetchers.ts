import { fetcher } from '../../lib/fetcher';
import { GET_SEARCH_COURSES, GET_SEARCH_USERS } from './queries';
import type { SearchCourseRaw, SearchUserRaw } from './transformers';

export interface SearchCoursesResponse {
  courses: SearchCourseRaw[];
}

export interface SearchUsersResponse {
  users: SearchUserRaw[];
}

/** Fetch courses for search (SSR or imperative client). */
export async function fetchSearchCourses(tenantId: string): Promise<SearchCoursesResponse> {
  return fetcher<SearchCoursesResponse>(GET_SEARCH_COURSES, { tenantId });
}

/** Fetch users for search (SSR or imperative client). */
export async function fetchSearchUsers(tenantId: string): Promise<SearchUsersResponse> {
  return fetcher<SearchUsersResponse>(GET_SEARCH_USERS, { tenantId });
}

/** Parallel fetch for both search domains. */
export async function fetchSearchData(tenantId: string): Promise<{
  courses: SearchCoursesResponse;
  users: SearchUsersResponse;
}> {
  const [courses, users] = await Promise.all([fetchSearchCourses(tenantId), fetchSearchUsers(tenantId)]);
  return { courses, users };
}

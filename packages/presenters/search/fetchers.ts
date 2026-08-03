import type { DocumentNode } from 'graphql';
import { GET_SEARCH_COURSES, GET_SEARCH_USERS } from './queries';
import type { SearchCourseRaw, SearchUserRaw } from './transformers';

export interface SearchCoursesResponse {
  courses: SearchCourseRaw[];
}

export interface SearchUsersResponse {
  users: SearchUserRaw[];
}

/**
 * Generic query-execution function, injected by the consuming app.
 *
 * This presenter package is shared between apps/web and apps/mobile
 * (see docs/CROSS_PLATFORM_RESTRUCTURE.md), so it cannot import a concrete
 * Apollo client singleton from either app — each platform has its own
 * (`apps/web/graphql/client.ts`, `apps/mobile/lib/apollo.ts`). Callers pass
 * in whatever query-execution function their platform already uses (e.g.
 * apps/web's `lib/fetcher.ts#fetcher`, or an equivalent wrapping
 * apps/mobile's client).
 *
 * Note: these SSR/imperative helpers currently have no callers anywhere in
 * the app — the actually-used path is `client.entry.ts`'s
 * `useSearchPresenter()`, which uses Apollo's `useQuery` and gets its client
 * from React context (already platform-agnostic, no injection needed).
 * Kept here for the imperative/SSR use case these were originally written
 * for, now with the platform coupling removed.
 */
export type QueryFn = <T>(query: DocumentNode, variables?: Record<string, unknown>) => Promise<T>;

/** Fetch courses for search (SSR or imperative client). */
export async function fetchSearchCourses(fetcher: QueryFn, tenantId: string): Promise<SearchCoursesResponse> {
  return fetcher<SearchCoursesResponse>(GET_SEARCH_COURSES, { tenantId });
}

/** Fetch users for search (SSR or imperative client). */
export async function fetchSearchUsers(fetcher: QueryFn, tenantId: string): Promise<SearchUsersResponse> {
  return fetcher<SearchUsersResponse>(GET_SEARCH_USERS, { tenantId });
}

/** Parallel fetch for both search domains. */
export async function fetchSearchData(
  fetcher: QueryFn,
  tenantId: string,
): Promise<{
  courses: SearchCoursesResponse;
  users: SearchUsersResponse;
}> {
  const [courses, users] = await Promise.all([
    fetchSearchCourses(fetcher, tenantId),
    fetchSearchUsers(fetcher, tenantId),
  ]);
  return { courses, users };
}

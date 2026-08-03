import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SEARCH_COURSES, GET_SEARCH_USERS } from './queries';
import { transformSearchResults, type SearchViewModel } from './transformers';

export interface UseSearchPresenterOptions {
  query: string;
  tenantId: string | null | undefined;
  tenant: string;
}

export interface UseSearchPresenterResult {
  viewModel: SearchViewModel;
  loading: boolean;
  error: string | null;
}

/**
 * Client entry for /search + global overlay — tenant-scoped courses + learners.
 */
export function useSearchPresenter({ query, tenantId, tenant }: UseSearchPresenterOptions): UseSearchPresenterResult {
  const enabled = Boolean(query.trim() && tenantId);

  const {
    data: coursesData,
    loading: coursesLoading,
    error: coursesError,
  } = useQuery(GET_SEARCH_COURSES, {
    variables: { tenantId: tenantId ?? '' },
    skip: !enabled,
    fetchPolicy: 'cache-first',
  });

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery(GET_SEARCH_USERS, {
    variables: { tenantId: tenantId ?? '' },
    skip: !enabled,
    fetchPolicy: 'cache-first',
  });

  const viewModel = useMemo(
    () => transformSearchResults(query, tenant, coursesData?.courses ?? [], usersData?.users ?? []),
    [query, tenant, coursesData?.courses, usersData?.users],
  );

  const gqlError = coursesError ?? usersError;
  const errorMessage = !tenantId && query.trim()
    ? 'Sign in to search this tenant'
    : gqlError
      ? gqlError.message || 'Search temporarily unavailable'
      : null;

  return {
    viewModel,
    loading: enabled && (coursesLoading || usersLoading),
    error: errorMessage,
  };
}

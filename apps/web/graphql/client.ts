import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { buildLoginRedirect } from '../lib/auth-routes';
import type { AuthRedirectReason } from '../lib/auth-notices';
import { getGraphqlUrl } from '../lib/urls';
import { AUTH_STORAGE_KEYS, clearStoredSession, isStoredSessionExpired } from '../lib/session';

const httpLink = createHttpLink({
  uri: getGraphqlUrl(),
});

const authLink = setContext((_, { headers }) => {
  if (typeof window === 'undefined') {
    return { headers };
  }

  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  const tenant = localStorage.getItem(AUTH_STORAGE_KEYS.tenant);

  if (token && isStoredSessionExpired()) {
    clearStoredSession();
    return { headers };
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-tenant': tenant || 'demo',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (typeof window === 'undefined') return;

  const isAuthGraphqlError = graphQLErrors?.some(
    (err) =>
      err.extensions?.code === 'UNAUTHENTICATED' ||
      err.extensions?.code === 'FORBIDDEN' ||
      /unauthorized|not authenticated|invalid token/i.test(err.message),
  );

  const statusCode =
    networkError && 'statusCode' in networkError
      ? (networkError as { statusCode?: number }).statusCode
      : undefined;
  const isAuthNetworkError = statusCode === 401 || statusCode === 403;

  if (!isAuthGraphqlError && !isAuthNetworkError) return;

  clearStoredSession();
  const returnPath = `${window.location.pathname}${window.location.search}`;
  const reason: AuthRedirectReason =
    graphQLErrors?.some((err) => err.extensions?.code === 'FORBIDDEN') ? 'unauthorized' : 'session_expired';
  window.location.href = buildLoginRedirect(returnPath, reason);
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

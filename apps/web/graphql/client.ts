import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

import { buildLoginRedirect } from '../lib/auth-routes';
import { getClientGraphqlUrl, getClientGraphqlWsUrl } from '../lib/urls';
import { AUTH_STORAGE_KEYS, clearStoredSession, getStoredUser, isStoredSessionExpired } from '../lib/session';
import { resolveAuthRedirectReason } from '../lib/session-guard';
import { getHostTenantSubdomain, isSessionTenantMismatch } from '../lib/tenant-auth';

const httpLink = createHttpLink({
  uri: getClientGraphqlUrl(),
});

// connectionParams is a function so it re-reads storage on every reconnect,
// ensuring rotated or refreshed tokens are always sent correctly.
function createWsLink(): GraphQLWsLink | null {
  if (typeof window === 'undefined') return null;
  return new GraphQLWsLink(
    createClient({
      url: getClientGraphqlWsUrl(),
      connectionParams: () => {
        const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
        const tenant = localStorage.getItem(AUTH_STORAGE_KEYS.tenant);
        return {
          authorization: token ? `Bearer ${token}` : '',
          'x-tenant': tenant || getHostTenantSubdomain() || '',
        };
      },
    }),
  );
}

const wsLink = createWsLink();

const splitLink =
  wsLink &&
  split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    httpLink,
  );

const authLink = setContext((_, { headers }) => {
  if (typeof window === 'undefined') return { headers };

  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  const tenant = localStorage.getItem(AUTH_STORAGE_KEYS.tenant);

  if (token && isStoredSessionExpired()) {
    clearStoredSession();
    return { headers };
  }

  if (token && isSessionTenantMismatch(getStoredUser())) {
    clearStoredSession();
    // Redirect immediately rather than silently dropping auth and letting the
    // next request fail with a generic UNAUTHENTICATED error.
    if (typeof window !== 'undefined') {
      const returnPath = `${window.location.pathname}${window.location.search}`;
      window.location.href = buildLoginRedirect(returnPath, 'tenant_mismatch');
    }
    return { headers };
  }

  const hostTenant = getHostTenantSubdomain();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-tenant': tenant || hostTenant,
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (typeof window === 'undefined') return;

  const statusCode =
    networkError && 'statusCode' in networkError ? (networkError as { statusCode?: number }).statusCode : undefined;

  const reason = resolveAuthRedirectReason(graphQLErrors, statusCode);
  if (!reason) return;

  clearStoredSession();
  const returnPath = `${window.location.pathname}${window.location.search}`;
  window.location.href = buildLoginRedirect(returnPath, reason);
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, splitLink || httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
  },
});

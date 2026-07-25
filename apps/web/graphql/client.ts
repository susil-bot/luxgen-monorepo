import { ApolloClient, InMemoryCache, Observable, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

import { buildLoginRedirect, isAuthPage } from '../lib/auth-routes';
import { getClientGraphqlUrl, getClientGraphqlWsUrl } from '../lib/urls';
import { AUTH_STORAGE_KEYS, clearStoredSession, getStoredUser, isStoredSessionExpired } from '../lib/session';
import { resolveAuthRedirectReason } from '../lib/session-guard';
import { isSessionTenantMismatch, resolveRequestTenant } from '../lib/tenant-auth';
import { refreshAccessToken } from '../lib/token-refresh';

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
        return {
          authorization: token ? `Bearer ${token}` : '',
          'x-tenant': resolveRequestTenant(),
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

function redirectToLogin(reason: Parameters<typeof buildLoginRedirect>[1]): void {
  const returnPath = `${window.location.pathname}${window.location.search}`;
  if (isAuthPage(window.location.pathname)) return;
  window.location.href = buildLoginRedirect(returnPath, reason);
}

const authLink = setContext((_, { headers }) => {
  if (typeof window === 'undefined') return { headers };

  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);

  if (token && isStoredSessionExpired()) {
    clearStoredSession();
    return { headers };
  }

  if (token && isSessionTenantMismatch(getStoredUser())) {
    clearStoredSession();
    redirectToLogin('tenant_mismatch');
    return { headers };
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-tenant': resolveRequestTenant(),
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (typeof window === 'undefined') return;

  if (graphQLErrors?.some((e) => e.extensions?.code === 'PLAN_UPGRADE_REQUIRED')) {
    return;
  }

  const opName = operation.operationName;
  if (opName === 'Login' || opName === 'Register') {
    return;
  }

  const statusCode =
    networkError && 'statusCode' in networkError ? (networkError as { statusCode?: number }).statusCode : undefined;

  const reason = resolveAuthRedirectReason(graphQLErrors, statusCode);
  if (!reason) return;

  // Only "session_expired" (an actually-expired/invalid access token) is
  // worth a silent-refresh attempt. tenant_mismatch/unauthorized are real
  // authorization failures, not expiry — retrying won't fix those, and
  // retrying would mask a permissions bug as a login redirect.
  const alreadyRetried = operation.getContext().__refreshRetried;
  if (reason === 'session_expired' && !alreadyRetried) {
    return new Observable((observer) => {
      refreshAccessToken().then((newToken) => {
        if (!newToken) {
          clearStoredSession();
          redirectToLogin(reason);
          observer.complete();
          return;
        }

        operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
          headers: { ...headers, authorization: `Bearer ${newToken}` },
          __refreshRetried: true,
        }));

        forward(operation).subscribe({
          next: (result) => observer.next(result),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
      });
    });
  }

  clearStoredSession();
  redirectToLogin(reason);
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, splitLink || httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
  },
});

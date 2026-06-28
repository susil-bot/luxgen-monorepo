import { ApolloClient, InMemoryCache, createHttpLink, type NormalizedCacheObject } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistCache } from 'apollo3-cache-persist';

import { API } from '../constants/api';
import { getToken } from './auth';
import { resolveRequestTenant } from './tenant-auth';

let client: ApolloClient<NormalizedCacheObject> | null = null;

async function buildAuthLink() {
  return setContext(async (_, { headers }) => {
    const token = await getToken();
    const tenant = await resolveRequestTenant();

    return {
      headers: {
        ...headers,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        'x-tenant': tenant,
      },
    };
  });
}

export async function initApolloClient(): Promise<ApolloClient<NormalizedCacheObject>> {
  if (client) return client;

  const cache = new InMemoryCache();
  await persistCache({
    cache,
    storage: AsyncStorage,
    maxSize: 1048576,
  });

  const authLink = await buildAuthLink();
  const httpLink = createHttpLink({ uri: API.graphqlUrl });

  client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache,
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network' },
      query: { fetchPolicy: 'cache-first' },
    },
  });

  return client;
}

/** Resolved after {@link initApolloClient} — use in hooks that run post-bootstrap. */
export function getApolloClient(): ApolloClient<NormalizedCacheObject> {
  if (!client) {
    throw new Error('Apollo client not initialized — wrap app in ApolloPersistProvider');
  }
  return client;
}

/** @deprecated Use getApolloClient() after bootstrap */
export const apolloClient = new Proxy({} as ApolloClient<NormalizedCacheObject>, {
  get(_target, prop) {
    return getApolloClient()[prop as keyof ApolloClient<NormalizedCacheObject>];
  },
});

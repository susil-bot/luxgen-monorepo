import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { API } from '../constants/api';
import { getTenantSubdomain, getToken } from './auth';

const httpLink = createHttpLink({
  uri: API.graphqlUrl,
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getToken();
  const tenant = (await getTenantSubdomain()) ?? API.defaultTenant;

  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      'x-tenant': tenant,
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

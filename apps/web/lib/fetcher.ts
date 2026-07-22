import type { DocumentNode } from 'graphql';

/** Typed GraphQL variables helper (UI-93). */
export type GraphQLVariables = Record<string, unknown>;

export const fetcher = async <T>(query: DocumentNode, variables?: GraphQLVariables): Promise<T> => {
  const { client } = await import('../graphql/client');
  const result = await client.query({ query, variables });
  return result.data as T;
};

export const mutation = async <T>(mutationDoc: DocumentNode, variables?: GraphQLVariables): Promise<T> => {
  const { client } = await import('../graphql/client');
  const result = await client.mutate({ mutation: mutationDoc, variables });
  return result.data as T;
};

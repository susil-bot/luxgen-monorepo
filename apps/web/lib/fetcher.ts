import { client } from '../graphql/client';
import { DocumentNode } from 'graphql';

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

export const fetcher = async <T = any>(
  query: DocumentNode,
  variables?: Record<string, any>
): Promise<T> => {
  try {
    const result = await client.query({
      query,
      variables,
      errorPolicy: 'all',
    });

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL query error:', error);
    throw error;
  }
};

export const mutation = async <T = any>(
  mutation: DocumentNode,
  variables?: Record<string, any>
): Promise<T> => {
  try {
    const result = await client.mutate({
      mutation,
      variables,
      errorPolicy: 'all',
    });

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  } catch (error) {
    console.error('GraphQL mutation error:', error);
    throw error;
  }
};

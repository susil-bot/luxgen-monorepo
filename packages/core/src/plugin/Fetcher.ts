import { WorkflowContext } from './WorkflowContext';

/**
 * Fetcher defines network interactions.
 * They have two members: path and fetch.
 * The path defines where the result of the fetch function will be stored.
 */
export interface Fetcher {
  path: string;
  fetch: (workflowContext: WorkflowContext) => Promise<any>;
}

/**
 * Create a fetcher with the given path and fetch function
 * @param path - The path where the result will be stored
 * @param fetch - The fetch function
 * @returns Fetcher instance
 */
export function createFetcher(
  path: string,
  fetch: (workflowContext: WorkflowContext) => Promise<any>
): Fetcher {
  return {
    path,
    fetch,
  };
}

/**
 * Create a fetcher that fetches data from an API endpoint
 * @param path - The path where the result will be stored
 * @param url - The API endpoint URL
 * @param options - Fetch options
 * @returns Fetcher instance
 */
export function createApiFetcher(
  path: string,
  url: string,
  options: RequestInit = {}
): Fetcher {
  return createFetcher(path, async (workflowContext) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    return response.json();
  });
}

/**
 * Create a fetcher that fetches data from a GraphQL endpoint
 * @param path - The path where the result will be stored
 * @param query - The GraphQL query
 * @param variables - GraphQL variables
 * @param endpoint - The GraphQL endpoint URL
 * @returns Fetcher instance
 */
export function createGraphQLFetcher(
  path: string,
  query: string,
  variables: Record<string, any> = {},
  endpoint: string = '/graphql'
): Fetcher {
  return createFetcher(path, async (workflowContext) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  });
}

/**
 * Create a fetcher that fetches data from a database
 * @param path - The path where the result will be stored
 * @param query - The database query
 * @param params - Query parameters
 * @returns Fetcher instance
 */
export function createDatabaseFetcher(
  path: string,
  query: string,
  params: any[] = []
): Fetcher {
  return createFetcher(path, async (workflowContext) => {
    // This would typically use a database connection
    // For now, we'll simulate a database query
    console.log(`Executing database query: ${query}`, params);
    
    // Simulate database response
    return {
      rows: [],
      count: 0,
    };
  });
}

/**
 * Create a fetcher that fetches data from a file
 * @param path - The path where the result will be stored
 * @param filePath - The file path to read
 * @returns Fetcher instance
 */
export function createFileFetcher(
  path: string,
  filePath: string
): Fetcher {
  return createFetcher(path, async (workflowContext) => {
    const fs = await import('fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  });
}

/**
 * Create a fetcher that fetches data from environment variables
 * @param path - The path where the result will be stored
 * @param envVar - The environment variable name
 * @param defaultValue - Default value if env var is not set
 * @returns Fetcher instance
 */
export function createEnvFetcher(
  path: string,
  envVar: string,
  defaultValue: any = null
): Fetcher {
  return createFetcher(path, async (workflowContext) => {
    return process.env[envVar] ?? defaultValue;
  });
}

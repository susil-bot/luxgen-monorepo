import type { LuxgenMcpConfig } from '../config';

export interface GraphqlErrorBody {
  message: string;
  extensions?: { code?: string; [key: string]: unknown };
}

export interface GraphqlResponse<T> {
  data?: T;
  errors?: GraphqlErrorBody[];
}

export class LuxgenGraphqlError extends Error {
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'LuxgenGraphqlError';
    this.code = code;
    this.details = details;
  }
}

export class LuxgenGraphqlClient {
  constructor(private readonly config: Pick<LuxgenMcpConfig, 'graphqlUrl' | 'jwt' | 'tenant'>) {}

  async query<TData, TVariables extends Record<string, unknown> = Record<string, unknown>>(
    document: string,
    variables?: TVariables,
  ): Promise<TData> {
    const response = await fetch(this.config.graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.jwt}`,
        'x-tenant': this.config.tenant,
      },
      body: JSON.stringify({ query: document, variables: variables ?? {} }),
    });

    if (!response.ok) {
      throw new LuxgenGraphqlError(`GraphQL HTTP ${response.status}: ${response.statusText}`, 'HTTP_ERROR');
    }

    const body = (await response.json()) as GraphqlResponse<TData>;

    if (body.errors?.length) {
      const first = body.errors[0];
      throw new LuxgenGraphqlError(first.message, first.extensions?.code, body.errors);
    }

    if (body.data === undefined) {
      throw new LuxgenGraphqlError('GraphQL response missing data', 'INVALID_RESPONSE');
    }

    return body.data;
  }
}

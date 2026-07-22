import { GraphQLError } from 'graphql';
import type { IUser } from '@luxgen/db';
import type { GraphQLContext } from '../context';
import type { AuthErrorCode } from '../types/auth';

/** GraphQL operations that do not require a valid JWT */
export const PUBLIC_QUERIES = new Set([
  '_empty',
  'publishedListings',
  'publishedListing',
  'pricingPlans',
  'currentUser',
  'tenant',
  'tenantBySubdomain',
  'courses',
  'course',
  'storefrontProducts',
  'storefrontProduct',
  'storefrontCollections',
  'storefrontCollection',
  'storefrontBundles',
  'storefrontBundle',
]);

/** MCP key context — auth via x-mcp-api-key middleware */
export const MCP_PUBLIC_QUERIES = new Set(['mcpKeyContext']);

/** MCP audit from server — auth via JWT or x-mcp-api-key */
export const MCP_PUBLIC_MUTATIONS = new Set(['recordMcpToolAudit']);

export const PUBLIC_MUTATIONS = new Set([
  '_empty',
  'login',
  'register',
  'createListingDraft',
  'updateListingDraft',
  'createListingCheckoutSession',
]);

export function assertAuthenticated(context: GraphQLContext): asserts context is GraphQLContext & { user: IUser } {
  const authError = context.authError;

  if (authError === 'ACCOUNT_DEACTIVATED') {
    throw new GraphQLError('Account is deactivated', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  if (authError === 'TENANT_MISMATCH') {
    throw new GraphQLError('Token is not valid for this tenant', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  if (authError === 'INVALID_TOKEN') {
    throw new GraphQLError('Invalid or expired token', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
}

type ResolverFn = (parent: unknown, args: unknown, context: GraphQLContext, info: unknown) => unknown;

/** Wrap Query/Mutation resolvers — public allowlist, everything else requires auth */
export function secureResolvers<T extends Record<string, unknown>>(resolvers: T): T {
  const secured = { ...resolvers } as T;

  for (const typeName of ['Query', 'Mutation', 'Subscription'] as const) {
    const typeResolvers = resolvers[typeName] as Record<string, ResolverFn> | undefined;
    if (!typeResolvers) continue;

    const publicSet =
      typeName === 'Query'
        ? new Set([...PUBLIC_QUERIES, ...MCP_PUBLIC_QUERIES])
        : typeName === 'Mutation'
          ? new Set([...PUBLIC_MUTATIONS, ...MCP_PUBLIC_MUTATIONS])
          : new Set<string>();
    const wrapped: Record<string, ResolverFn> = {};

    for (const [fieldName, resolver] of Object.entries(typeResolvers)) {
      if (publicSet.has(fieldName)) {
        wrapped[fieldName] = resolver;
        continue;
      }

      wrapped[fieldName] = (parent, args, context, info) => {
        assertAuthenticated(context);
        return resolver(parent, args, context, info);
      };
    }

    (secured as Record<string, unknown>)[typeName] = wrapped;
  }

  return secured;
}

export type { AuthErrorCode };

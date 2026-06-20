import { GraphQLError } from 'graphql';
import { McpApiKey, type McpApiKeyScope } from '@luxgen/db';
import { mcpApiKeyService } from '../../services/mcpApiKeyService';
import { requireFeature } from '../../middleware/planGate';
import type { GraphQLContext } from '../../context';
import { assertTenantScope, scopedTenantId } from '../../graphql/tenantScope';
import { assertAuthenticated } from '../../graphql/authPolicy';

function parseScopes(scopes: string[]): McpApiKeyScope[] {
  const parsed = scopes.map((s) => s.toLowerCase() as McpApiKeyScope);
  for (const s of parsed) {
    if (s !== 'read' && s !== 'write') {
      throw new GraphQLError('Invalid MCP scope', { extensions: { code: 'BAD_USER_INPUT' } });
    }
  }
  if (parsed.length === 0) {
    throw new GraphQLError('At least one scope required', { extensions: { code: 'BAD_USER_INPUT' } });
  }
  return parsed;
}

export const mcpResolvers = {
  Query: {
    mcpApiKeys: async (_: unknown, { tenantId }: { tenantId: string }, ctx: GraphQLContext) => {
      assertAuthenticated(ctx);
      await requireFeature(ctx, 'webhooks');
      const scoped = scopedTenantId(ctx, tenantId);
      const keys = await mcpApiKeyService.listKeys(scoped);
      return keys.map((k) => mcpApiKeyService.toGraphQL(k));
    },
    mcpKeyContext: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const key = ctx.mcpApiKey;
      if (!key) return null;
      return {
        keyId: key.id,
        tenantId: key.tenantId,
        name: key.name,
        scopes: key.scopes.map((s) => s.toUpperCase()),
      };
    },
    mcpToolAuditLog: async (
      _: unknown,
      { tenantId, limit }: { tenantId: string; limit?: number },
      ctx: GraphQLContext,
    ) => {
      assertAuthenticated(ctx);
      await requireFeature(ctx, 'webhooks');
      const scoped = scopedTenantId(ctx, tenantId);
      return mcpApiKeyService.listAuditLog(scoped, limit ?? 50);
    },
  },
  Mutation: {
    createMcpApiKey: async (
      _: unknown,
      { tenantId, name, scopes }: { tenantId: string; name: string; scopes: string[] },
      ctx: GraphQLContext,
    ) => {
      assertAuthenticated(ctx);
      await requireFeature(ctx, 'webhooks');
      const scoped = scopedTenantId(ctx, tenantId);
      const parsedScopes = parseScopes(scopes);
      const { key, secret } = await mcpApiKeyService.createKey(scoped, name, parsedScopes, String(ctx.user!._id));
      return { key: mcpApiKeyService.toGraphQL(key), secret };
    },
    revokeMcpApiKey: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      assertAuthenticated(ctx);
      await requireFeature(ctx, 'webhooks');
      const existing = await McpApiKey.findById(id).lean();
      if (!existing) return null;
      assertTenantScope(ctx, existing.tenantId);
      const revoked = await mcpApiKeyService.revokeKey(id, existing.tenantId);
      if (!revoked) return null;
      return mcpApiKeyService.toGraphQL(revoked);
    },
    recordMcpToolAudit: async (
      _: unknown,
      { input }: { input: { tenantId: string; tool: string; success: boolean; durationMs: number; error?: string } },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user && !ctx.mcpApiKey) {
        throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const scoped = scopedTenantId(ctx, input.tenantId);
      return mcpApiKeyService.recordToolAudit({
        tenantId: scoped,
        keyId: ctx.mcpApiKey?.id,
        userId: ctx.user ? String(ctx.user._id) : undefined,
        tool: input.tool,
        success: input.success,
        durationMs: input.durationMs,
        error: input.error,
      });
    },
  },
};

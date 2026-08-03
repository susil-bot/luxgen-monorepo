import { exportAutomationSchema } from '@luxgen/automation-flow';
import { randomUUID } from 'crypto';
import { automationService } from '../../services/automationService';
import { requireFeature } from '../../middleware/planGate';
import { usageService, UsageLimitError } from '../../services/usageService';
import type { GraphQLContext } from '../../context';
import { GraphQLError } from 'graphql';
import { scopedTenantId } from '../../graphql/tenantScope';

const AUTOMATION_SCHEMA = exportAutomationSchema();

async function runAgentTaskViaQueue(
  tenantId: string,
  userId: string,
  prompt: string,
  model?: string,
): Promise<{ sessionId: string; status: string; jobId: string | null }> {
  const sessionId = randomUUID();
  const { getOllamaUrl } = await import('@luxgen/config');
  const ollamaHost = getOllamaUrl();

  try {
    const { enqueueHeadlessTask } = await import('@luxgen/agent');
    const job = await enqueueHeadlessTask({
      sessionId,
      tenantId,
      userId,
      messages: [{ role: 'user', content: prompt }],
      ollamaHost,
      model,
    });

    return {
      sessionId,
      status: job ? 'enqueued' : 'created',
      jobId: job?.id ?? null,
    };
  } catch {
    return { sessionId, status: 'created', jobId: null };
  }
}

export const automationResolvers = {
  Query: {
    automations: async (
      _: unknown,
      { tenantId, limit, offset }: { tenantId: string; limit?: number; offset?: number },
      ctx: GraphQLContext,
    ) => {
      const scoped = scopedTenantId(ctx, tenantId);
      const items = await automationService.getAutomations(scoped, limit ?? 50, offset ?? 0);
      return items.map((a) => automationService.toGraphQL(a));
    },
    automation: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.tenantId) return null;
      const item = await automationService.getAutomationById(id, ctx.tenantId);
      return item ? automationService.toGraphQL(item) : null;
    },
    automationRuns: async (
      _: unknown,
      { tenantId, limit, automationId }: { tenantId: string; limit?: number; automationId?: string },
      ctx: GraphQLContext,
    ) => {
      const scoped = scopedTenantId(ctx, tenantId);
      const runs = await automationService.getAutomationRuns(scoped, limit ?? 20, automationId);
      return runs.map((r) => automationService.runToGraphQL(r));
    },
    automationRun: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.tenantId) return null;
      const run = await automationService.getAutomationRunById(id, ctx.tenantId);
      return run ? automationService.runToGraphQL(run) : null;
    },
    automationSchema: () => AUTOMATION_SCHEMA,
  },
  Mutation: {
    createAutomation: async (
      _: unknown,
      { input }: { input: Parameters<typeof automationService.createAutomation>[0] },
      ctx: GraphQLContext,
    ) => {
      await requireFeature(ctx, 'automations');
      const scoped = scopedTenantId(ctx, input.tenantId);
      try {
        await usageService.assertAutomationCreateAllowed(scoped);
      } catch (e) {
        if (e instanceof UsageLimitError) {
          const { code: _code, ...rest } = e.toJSON();
          throw new GraphQLError(e.message, { extensions: { code: e.code, ...rest } });
        }
        throw e;
      }
      const created = await automationService.createAutomation({ ...input, tenantId: scoped });
      return automationService.toGraphQL(created);
    },
    updateAutomation: async (
      _: unknown,
      { id, input }: { id: string; input: Parameters<typeof automationService.updateAutomation>[1] },
      ctx: GraphQLContext,
    ) => {
      await requireFeature(ctx, 'automations');
      if (!ctx.tenantId) throw new GraphQLError('Tenant context required');
      const updated = await automationService.updateAutomation(id, ctx.tenantId, input);
      return updated ? automationService.toGraphQL(updated) : null;
    },
    toggleAutomation: async (_: unknown, { id, enabled }: { id: string; enabled: boolean }, ctx: GraphQLContext) => {
      await requireFeature(ctx, 'automations');
      if (!ctx.tenantId) throw new GraphQLError('Tenant context required');
      const updated = await automationService.toggleAutomation(id, ctx.tenantId, enabled);
      return updated ? automationService.toGraphQL(updated) : null;
    },
    publishAutomation: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      await requireFeature(ctx, 'automations');
      if (!ctx.tenantId) throw new GraphQLError('Tenant context required');
      const updated = await automationService.publishAutomation(id, ctx.tenantId);
      return updated ? automationService.toGraphQL(updated) : null;
    },
    pauseAutomation: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      await requireFeature(ctx, 'automations');
      if (!ctx.tenantId) throw new GraphQLError('Tenant context required');
      const updated = await automationService.pauseAutomation(id, ctx.tenantId);
      return updated ? automationService.toGraphQL(updated) : null;
    },
    archiveAutomation: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      await requireFeature(ctx, 'automations');
      if (!ctx.tenantId) throw new GraphQLError('Tenant context required');
      const updated = await automationService.archiveAutomation(id, ctx.tenantId);
      return updated ? automationService.toGraphQL(updated) : null;
    },
    deleteAutomation: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      await requireFeature(ctx, 'automations');
      if (!ctx.tenantId) throw new GraphQLError('Tenant context required');
      return automationService.deleteAutomation(id, ctx.tenantId);
    },
    duplicateAutomation: async (
      _: unknown,
      { id, name }: { id: string; name?: string | null },
      ctx: GraphQLContext,
    ) => {
      await requireFeature(ctx, 'automations');
      if (!ctx.tenantId) throw new GraphQLError('Tenant context required');
      try {
        await usageService.assertAutomationCreateAllowed(ctx.tenantId);
      } catch (e) {
        if (e instanceof UsageLimitError) {
          const { code: _code, ...rest } = e.toJSON();
          throw new GraphQLError(e.message, { extensions: { code: e.code, ...rest } });
        }
        throw e;
      }
      const created = await automationService.duplicateAutomation(id, ctx.tenantId, name ?? undefined);
      return created ? automationService.toGraphQL(created) : null;
    },
    testAutomation: async (
      _: unknown,
      { id, testData }: { id: string; testData?: Record<string, unknown> | null },
      ctx: GraphQLContext,
    ) => {
      await requireFeature(ctx, 'automations');
      if (!ctx.tenantId) throw new GraphQLError('Tenant context required');
      try {
        const run = await automationService.testAutomation(
          id,
          ctx.tenantId,
          testData && typeof testData === 'object' ? testData : {},
        );
        const errors = run.error ? [run.error] : [];
        return { run: automationService.runToGraphQL(run), errors };
      } catch (e) {
        if (e instanceof UsageLimitError) {
          const { code: _code, ...rest } = e.toJSON();
          throw new GraphQLError(e.message, { extensions: { code: e.code, ...rest } });
        }
        const message = e instanceof Error ? e.message : String(e);
        throw new GraphQLError(message);
      }
    },
    runAgentTask: async (
      _: unknown,
      { input }: { input: { tenantId: string; prompt: string; model?: string } },
      ctx: GraphQLContext,
    ) => {
      await requireFeature(ctx, 'agentStudio');
      const userId = ctx.user?._id?.toString() || ctx.user?.id || 'system';
      const scoped = scopedTenantId(ctx, input.tenantId);
      return runAgentTaskViaQueue(scoped, userId, input.prompt, input.model);
    },
  },
};

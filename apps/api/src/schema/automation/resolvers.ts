import { randomUUID } from 'crypto';
import { automationService } from '../../services/automationService';
import { requireFeature } from '../../middleware/planGate';
import { usageService, UsageLimitError } from '../../services/usageService';
import type { GraphQLContext } from '../../context';
import { GraphQLError } from 'graphql';

const AUTOMATION_SCHEMA = {
  triggers: [
    'COURSE_COMPLETED',
    'USER_ENROLLED',
    'GROUP_JOINED',
    'CERTIFICATE_ISSUED',
    'SCHEDULE',
    'WEBHOOK',
    'CODE_CHANGE_STAGED',
    'CODE_CHANGE_COMMITTED',
    'CODE_CHANGE_MERGED',
    'CODE_CHANGE_FAILED',
  ],
  actions: [
    'SEND_EMAIL',
    'ADD_TO_GROUP',
    'REMOVE_FROM_GROUP',
    'ENROLL_IN_COURSE',
    'ISSUE_CERTIFICATE',
    'CALL_WEBHOOK',
    'NOTIFY_SLACK',
    'TAG_USER',
    'RUN_AGENT_TASK',
  ],
};

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
    automations: async (_: unknown, { tenantId }: { tenantId: string }) => {
      const items = await automationService.getAutomations(tenantId);
      return items.map((a) => automationService.toGraphQL(a));
    },
    automation: async (_: unknown, { id }: { id: string }) => {
      const item = await automationService.getAutomationById(id);
      return item ? automationService.toGraphQL(item) : null;
    },
    automationRuns: async (_: unknown, { tenantId, limit }: { tenantId: string; limit?: number }) => {
      const runs = await automationService.getAutomationRuns(tenantId, limit ?? 20);
      return runs.map((r) => automationService.runToGraphQL(r));
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
      try {
        await usageService.assertAutomationCreateAllowed(input.tenantId);
      } catch (e) {
        if (e instanceof UsageLimitError) {
          const { code: _code, ...rest } = e.toJSON();
          throw new GraphQLError(e.message, { extensions: { code: e.code, ...rest } });
        }
        throw e;
      }
      const created = await automationService.createAutomation(input);
      return automationService.toGraphQL(created);
    },
    updateAutomation: async (
      _: unknown,
      { id, input }: { id: string; input: Parameters<typeof automationService.updateAutomation>[1] },
      ctx: GraphQLContext,
    ) => {
      await requireFeature(ctx, 'automations');
      const updated = await automationService.updateAutomation(id, input);
      return updated ? automationService.toGraphQL(updated) : null;
    },
    toggleAutomation: async (_: unknown, { id, enabled }: { id: string; enabled: boolean }, ctx: GraphQLContext) => {
      await requireFeature(ctx, 'automations');
      const updated = await automationService.toggleAutomation(id, enabled);
      return updated ? automationService.toGraphQL(updated) : null;
    },
    deleteAutomation: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      await requireFeature(ctx, 'automations');
      return automationService.deleteAutomation(id);
    },
    runAgentTask: async (
      _: unknown,
      { input }: { input: { tenantId: string; prompt: string; model?: string } },
      ctx: GraphQLContext,
    ) => {
      await requireFeature(ctx, 'agentStudio');
      const userId = ctx.user?._id?.toString() || ctx.user?.id || 'system';
      return runAgentTaskViaQueue(input.tenantId, userId, input.prompt, input.model);
    },
  },
};

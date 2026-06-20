import type { ProjectItemIteration, ProjectItemPriority, ProjectItemStatus } from '@luxgen/db';
import { GraphQLError } from 'graphql';
import type { GraphQLContext } from '../../context';
import { requireFeature } from '../../middleware/planGate';
import { projectItemService } from '../../services/projectItemService';

function assertTenantScope(ctx: GraphQLContext, tenantId: string): void {
  if (ctx.tenantId && ctx.tenantId !== tenantId) {
    throw new GraphQLError('Token is not valid for this tenant', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}

export const projectResolvers = {
  Query: {
    projectItems: async (
      _: unknown,
      {
        tenantId,
        iteration,
        status,
        priority,
        assigneeId,
        search,
      }: {
        tenantId: string;
        iteration?: string;
        status?: string;
        priority?: string;
        assigneeId?: string;
        search?: string;
      },
      ctx: GraphQLContext,
    ) => {
      await requireFeature(ctx, 'project');
      assertTenantScope(ctx, tenantId);
      const items = await projectItemService.listByTenant(tenantId, {
        iteration: iteration as ProjectItemIteration | undefined,
        status: status as ProjectItemStatus | undefined,
        priority: priority as ProjectItemPriority | undefined,
        assigneeId,
        search,
      });
      return items.map((item) => projectItemService.toGraphQL(item));
    },
    projectItem: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      await requireFeature(ctx, 'project');
      assertTenantScope(ctx, tenantId);
      const item = await projectItemService.getById(id, tenantId);
      return item ? projectItemService.toGraphQL(item) : null;
    },
  },
  Mutation: {
    createProjectItem: async (
      _: unknown,
      { input }: { input: Parameters<typeof projectItemService.create>[0] },
      ctx: GraphQLContext,
    ) => {
      await requireFeature(ctx, 'project');
      assertTenantScope(ctx, input.tenantId);
      const created = await projectItemService.create({
        ...input,
        createdById: ctx.user?._id?.toString() ?? ctx.user?.id,
      });
      return projectItemService.toGraphQL(created);
    },
    updateProjectItem: async (
      _: unknown,
      { id, tenantId, input }: { id: string; tenantId: string; input: Parameters<typeof projectItemService.update>[2] },
      ctx: GraphQLContext,
    ) => {
      await requireFeature(ctx, 'project');
      assertTenantScope(ctx, tenantId);
      const updated = await projectItemService.update(id, tenantId, input);
      return updated ? projectItemService.toGraphQL(updated) : null;
    },
    moveProjectItem: async (
      _: unknown,
      { id, tenantId, status }: { id: string; tenantId: string; status: ProjectItemStatus },
      ctx: GraphQLContext,
    ) => {
      await requireFeature(ctx, 'project');
      assertTenantScope(ctx, tenantId);
      const moved = await projectItemService.moveStatus(id, tenantId, status);
      if (!moved) {
        throw new GraphQLError('Project item not found', { extensions: { code: 'NOT_FOUND' } });
      }
      return projectItemService.toGraphQL(moved);
    },
    deleteProjectItem: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }, ctx: GraphQLContext) => {
      await requireFeature(ctx, 'project');
      assertTenantScope(ctx, tenantId);
      return projectItemService.delete(id, tenantId);
    },
  },
};

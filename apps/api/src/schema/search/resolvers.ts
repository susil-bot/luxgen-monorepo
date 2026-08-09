import { searchSettingsService } from '../../services/searchSettingsService';
import { searchEventService } from '../../services/searchEventService';
import { scopedTenantId } from '../../graphql/tenantScope';
import type { GraphQLContext } from '../../context';

export const searchResolvers = {
  Query: {
    searchSettings: async (_: unknown, { tenantId }: { tenantId: string }, ctx: GraphQLContext) => {
      const scoped = scopedTenantId(ctx, tenantId);
      return searchSettingsService.get(scoped);
    },
    searchEventSummary: async (_: unknown, { tenantId }: { tenantId: string }, ctx: GraphQLContext) => {
      const scoped = scopedTenantId(ctx, tenantId);
      return searchEventService.summary(scoped);
    },
  },
  Mutation: {
    updateSearchSettings: async (
      _: unknown,
      { tenantId, resultsPerPage, trackSearchHistory }: {
        tenantId: string;
        resultsPerPage: number;
        trackSearchHistory: boolean;
      },
      ctx: GraphQLContext,
    ) => {
      const scoped = scopedTenantId(ctx, tenantId);
      return searchSettingsService.update(scoped, { resultsPerPage, trackSearchHistory });
    },
    logSearchEvent: async (
      _: unknown,
      { tenantId, query, resultCount }: { tenantId: string; query: string; resultCount: number },
      ctx: GraphQLContext,
    ) => {
      const scoped = scopedTenantId(ctx, tenantId);
      const created = await searchEventService.log(scoped, query, resultCount);
      return { id: String(created._id) };
    },
  },
};

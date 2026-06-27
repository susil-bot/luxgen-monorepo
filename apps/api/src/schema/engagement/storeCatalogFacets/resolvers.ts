import type { GraphQLContext } from '../../../context';
import { scopedTenantId } from '../../../graphql/tenantScope';
import { storeCatalogFacetsService } from '../../../services/storeCatalogFacetsService';
export const StoreCatalogFacetsResolvers = {
  Query: {
    storeCatalogFacets: async (_: unknown, { tenantId }: { tenantId: string }, ctx: GraphQLContext) =>
      storeCatalogFacetsService.list(scopedTenantId(ctx, tenantId)),
  },
};

import type { GraphQLContext } from '../../context';
import { storefrontService } from '../../services/storefrontService';

export const storefrontResolvers = {
  Query: {
    storefrontProducts: async (
      _: unknown,
      { tenantId, category }: { tenantId: string; category?: string },
      context: GraphQLContext,
    ) => {
      return storefrontService.listProducts(tenantId, Boolean(context.user), category ?? null);
    },
    storefrontProduct: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      return storefrontService.getProduct(id, Boolean(context.user));
    },
    storefrontCollections: async (_: unknown, { tenantId }: { tenantId: string }) => {
      return storefrontService.listCollections(tenantId);
    },
    storefrontCollection: async (_: unknown, { id, tenantId }: { id: string; tenantId: string }) => {
      return storefrontService.getCollection(id, tenantId);
    },
    storefrontBundles: async (_: unknown, { tenantId }: { tenantId: string }, context: GraphQLContext) => {
      return storefrontService.listBundles(tenantId, Boolean(context.user));
    },
    storefrontBundle: async (
      _: unknown,
      { id, tenantId }: { id: string; tenantId: string },
      context: GraphQLContext,
    ) => {
      return storefrontService.getBundle(id, tenantId, Boolean(context.user));
    },
    learnerSubscriptions: async (_: unknown, { tenantId }: { tenantId: string }, context: GraphQLContext) => {
      if (!context.user) throw new Error('Authentication required');
      const userId = context.user._id?.toString?.() ?? '';
      return storefrontService.listLearnerSubscriptions(userId, tenantId);
    },
  },
  Mutation: {
    subscribeToBundle: async (_: unknown, { bundleId }: { bundleId: string }, context: GraphQLContext) => {
      if (!context.user || !context.tenantId) throw new Error('Authentication required');
      const userId = context.user._id?.toString?.() ?? '';
      const result = await storefrontService.subscribeToBundle(bundleId, context.tenantId, userId);
      return {
        subscriptionId: result.subscription._id?.toString?.() ?? result.subscription.id,
        alreadySubscribed: result.alreadySubscribed,
        bundleId,
      };
    },
    cancelLearnerSubscription: async (
      _: unknown,
      { subscriptionId }: { subscriptionId: string },
      context: GraphQLContext,
    ) => {
      if (!context.user || !context.tenantId) throw new Error('Authentication required');
      const userId = context.user._id?.toString?.() ?? '';
      await storefrontService.cancelLearnerSubscription(subscriptionId, context.tenantId, userId);
      return true;
    },
  },
};

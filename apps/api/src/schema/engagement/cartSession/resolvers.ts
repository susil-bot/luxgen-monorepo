import { cartSessionService } from '../../../services/cartSessionService';
export const CartSessionResolvers = {
  Query: { cartSession: async (_: unknown, { sessionId }: { sessionId: string }) => cartSessionService.get(sessionId) },
  Mutation: {
    upsertCartSession: async (
      _: unknown,
      { sessionId, items }: { sessionId: string; items: { productId: string; qty: number }[] },
    ) => cartSessionService.upsert(sessionId, items),
  },
};

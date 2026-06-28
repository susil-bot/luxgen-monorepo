import type { GraphQLContext } from '../../../context';
import { onboardingStateService } from '../../../services/onboardingStateService';

export const OnboardingStateResolvers = {
  Query: {
    onboardingState: async (_: unknown, __: unknown, context: GraphQLContext) =>
      onboardingStateService.get(context.user?._id?.toString?.() ?? ''),
  },
  Mutation: {
    completeOnboardingStep: async (_: unknown, { step }: { step: string }, context: GraphQLContext) =>
      onboardingStateService.completeStep(context.user?._id?.toString?.() ?? '', step),
  },
};

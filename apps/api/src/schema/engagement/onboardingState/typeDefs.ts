export const OnboardingStateTypeDefs = `
  type OnboardingStepState { step: String! completed: Boolean! }
  extend type Query { onboardingState: [OnboardingStepState!]! }
  extend type Mutation { completeOnboardingStep(step: String!): [OnboardingStepState!]! }`;

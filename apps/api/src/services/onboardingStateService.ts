import { User } from '@luxgen/db';

const STEPS = ['profile', 'first_course', 'invite_team', 'billing'] as const;

export const onboardingStateService = {
  async get(userId: string) {
    const user = await User.findById(userId);
    const completed = (user?.metadata as { onboardingCompleted?: string[] })?.onboardingCompleted ?? [];
    return STEPS.map((step) => ({ step, completed: completed.includes(step) }));
  },
  async completeStep(userId: string, step: string) {
    const user = await User.findById(userId);
    const completed = new Set((user?.metadata as { onboardingCompleted?: string[] })?.onboardingCompleted ?? []);
    completed.add(step);
    await User.findByIdAndUpdate(userId, { $set: { 'metadata.onboardingCompleted': [...completed] } });
    return this.get(userId);
  },
};

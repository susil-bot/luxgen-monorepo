import { describe, expectTypeOf, it } from 'vitest';
import type { LearnerDashboardStats } from '../services/learnerService';

describe('08 learner types auto', () => {
  it('exposes LearnerDashboardStats shape', () => {
    expectTypeOf<LearnerDashboardStats>().toHaveProperty('certificateCount');
  });
});

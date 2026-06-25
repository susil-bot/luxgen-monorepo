import { beforeEach, describe, expect, it, vi } from 'vitest';

const findOneMock = vi.fn();
const findByIdMock = vi.fn();

vi.mock('@luxgen/db', () => ({
  Enrollment: { findOne: findOneMock },
  Course: { findById: findByIdMock },
  User: {},
  enrollmentSubjectId: () => 'subject-1',
  EnrollmentPaymentStatus: { PENDING: 'PENDING' },
  EnrollmentLearningStatus: { ACTIVE: 'ACTIVE' },
}));

vi.mock('../services/activityEventService', () => ({
  activityEventService: {
    recordOrderNoteAdded: vi.fn(),
    recordCustomerNoteAdded: vi.fn(),
    recordOrderRefunded: vi.fn(),
    recordOrderUpdated: vi.fn(),
    recordOrderCancelled: vi.fn(),
    recordOrderPaymentConfirmed: vi.fn(),
  },
}));

vi.mock('../services/checkoutSessionService', () => ({
  checkoutSessionService: {
    recordOpenSession: vi.fn(),
    markCompleted: vi.fn(),
  },
}));

vi.mock('../services/automationService', () => ({
  automationService: { triggerAutomations: vi.fn() },
}));

vi.mock('../services/billingService', () => ({
  isBillingDevMode: () => false,
  isStripeEnabled: () => false,
}));

vi.mock('@luxgen/agent', () => ({
  emitCommerceAutomationEvent: vi.fn(),
}));

describe('03 enrollmentService auto', () => {
  beforeEach(() => {
    findOneMock.mockResolvedValue(null);
    findByIdMock.mockResolvedValue(null);
  });

  it('throws Course not found from updateOrderNotes', async () => {
    const { enrollmentService } = await import('../services/enrollmentService');
    await expect(enrollmentService.updateOrderNotes('course-1', 'student-1', 'note')).rejects.toThrow(
      'Course not found',
    );
  });
});

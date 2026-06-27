import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../services/automationService', () => ({
  automationService: {
    triggerAutomations: jest.fn().mockResolvedValue(0),
  },
}));

jest.mock('@luxgen/db', () => ({
  Enrollment: {
    findOne: jest.fn(),
    find: jest.fn(),
  },
  EnrollmentPaymentStatus: {
    PENDING: 'PENDING',
    PAID: 'PAID',
    REFUNDED: 'REFUNDED',
    VOIDED: 'VOIDED',
  },
  EnrollmentLearningStatus: {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
  },
  Course: { findById: jest.fn() },
  User: { findById: jest.fn() },
}));

jest.mock('../utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

import { Enrollment, Course, User } from '@luxgen/db';
import { automationService } from '../services/automationService';
import { EnrollmentService } from '../services/enrollmentService';

describe('EnrollmentService progress', () => {
  let service: EnrollmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EnrollmentService();
  });

  describe('updateProgress', () => {
    it('clamps progress and sets completion at 100%', async () => {
      const enrollment = {
        course: 'course1',
        student: 'student1',
        tenant: 'tenant1',
        cancelledAt: undefined,
        progressPercent: 10,
        learningStatus: 'ACTIVE',
        completedAt: undefined,
        save: jest.fn().mockResolvedValue(undefined),
      };
      (Enrollment.findOne as jest.Mock).mockResolvedValue(enrollment);
      (Course.findById as jest.Mock).mockResolvedValue({ title: 'Intro' });
      (User.findById as jest.Mock).mockResolvedValue({ email: 'learner@example.com' });

      const result = await service.updateProgress('course1', 'student1', 150);

      expect(result.progressPercent).toBe(100);
      expect(result.learningStatus).toBe('COMPLETED');
      expect(result.completedAt).toBeInstanceOf(Date);
      expect(enrollment.save).toHaveBeenCalled();
      expect(automationService.triggerAutomations).toHaveBeenCalledWith(
        'tenant1',
        'COURSE_COMPLETED',
        expect.objectContaining({
          courseId: 'course1',
          studentId: 'student1',
        }),
        'lms',
      );
    });

    it('rejects cancelled enrollments', async () => {
      (Enrollment.findOne as jest.Mock).mockResolvedValue({
        cancelledAt: new Date(),
        save: jest.fn(),
      });

      await expect(service.updateProgress('course1', 'student1', 50)).rejects.toThrow('Enrollment is cancelled');
    });

    it('reopens completed enrollment when progress drops below 100', async () => {
      const enrollment = {
        course: 'course1',
        student: 'student1',
        tenant: 'tenant1',
        cancelledAt: undefined,
        progressPercent: 100,
        learningStatus: 'COMPLETED',
        completedAt: new Date('2026-01-01'),
        save: jest.fn().mockResolvedValue(undefined),
      };
      (Enrollment.findOne as jest.Mock).mockResolvedValue(enrollment);

      await service.updateProgress('course1', 'student1', 80);

      expect(enrollment.progressPercent).toBe(80);
      expect(enrollment.learningStatus).toBe('ACTIVE');
      expect(enrollment.completedAt).toBeUndefined();
      expect(automationService.triggerAutomations).not.toHaveBeenCalled();
    });
  });

  describe('markCourseComplete', () => {
    it('delegates to updateProgress with 100', async () => {
      const enrollment = {
        course: 'course1',
        student: 'student1',
        tenant: 'tenant1',
        cancelledAt: undefined,
        progressPercent: 0,
        learningStatus: 'ACTIVE',
        completedAt: undefined,
        save: jest.fn().mockResolvedValue(undefined),
      };
      (Enrollment.findOne as jest.Mock).mockResolvedValue(enrollment);
      (Course.findById as jest.Mock).mockResolvedValue({ title: 'Intro' });
      (User.findById as jest.Mock).mockResolvedValue({ email: 'learner@example.com' });

      await service.markCourseComplete('course1', 'student1');

      expect(enrollment.progressPercent).toBe(100);
      expect(enrollment.learningStatus).toBe('COMPLETED');
    });
  });
});

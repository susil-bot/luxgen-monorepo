import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/agent', () => ({
  emitAutomationEvent: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@luxgen/db', () => ({
  Certificate: {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  },
  Course: { findById: jest.fn() },
  User: { findById: jest.fn() },
  EnrollmentLearningStatus: { ACTIVE: 'ACTIVE', COMPLETED: 'COMPLETED' },
}));

jest.mock('../utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

import { Certificate, Course, User } from '@luxgen/db';
import { emitAutomationEvent } from '@luxgen/agent';
import { CertificateService } from '../services/certificateService';

describe('CertificateService', () => {
  let service: CertificateService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CertificateService();
  });

  describe('issueForCompletion', () => {
    it('returns existing certificate without creating duplicate', async () => {
      const existing = { id: 'cert1', certificateNumber: 'LUX-ABCD-2026-AAA' };
      (Certificate.findOne as jest.Mock).mockResolvedValue(existing);

      const result = await service.issueForCompletion({
        learningStatus: 'COMPLETED',
        tenant: { toString: () => 'tenant1' },
        course: { toString: () => 'course1' },
        student: { toString: () => 'student1' },
        _id: { toString: () => 'enroll1' },
      } as never);

      expect(result).toBe(existing);
      expect(Certificate.create).not.toHaveBeenCalled();
    });

    it('creates certificate and emits CERTIFICATE_ISSUED', async () => {
      (Certificate.findOne as jest.Mock).mockResolvedValue(null);
      (Course.findById as jest.Mock).mockResolvedValue({ title: 'Intro to React' });
      (User.findById as jest.Mock).mockResolvedValue({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      });
      (Certificate.create as jest.Mock).mockResolvedValue({
        id: 'cert-new',
        certificateNumber: 'LUX-1234-2026-ABC',
      });

      await service.issueForCompletion({
        learningStatus: 'COMPLETED',
        tenant: { toString: () => 'tenant1234' },
        course: { toString: () => 'course1' },
        student: { toString: () => 'student1' },
        completedAt: new Date('2026-06-01'),
        _id: { toString: () => 'enroll1' },
      } as never);

      expect(Certificate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          courseTitle: 'Intro to React',
          studentName: 'Ada Lovelace',
        }),
      );
      expect(emitAutomationEvent).toHaveBeenCalledWith(expect.objectContaining({ triggerType: 'CERTIFICATE_ISSUED' }));
    });

    it('skips when enrollment is not completed', async () => {
      const result = await service.issueForCompletion({
        learningStatus: 'ACTIVE',
        tenant: { toString: () => 'tenant1' },
        course: { toString: () => 'course1' },
        student: { toString: () => 'student1' },
        _id: { toString: () => 'enroll1' },
      } as never);

      expect(result).toBeNull();
      expect(Certificate.findOne).not.toHaveBeenCalled();
    });
  });
});

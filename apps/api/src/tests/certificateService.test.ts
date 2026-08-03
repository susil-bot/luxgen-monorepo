import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/db', () => ({
  Enrollment: {
    find: jest.fn(),
    findOne: jest.fn(),
  },
  EnrollmentLearningStatus: { ACTIVE: 'ACTIVE', COMPLETED: 'COMPLETED' },
  Course: {
    find: jest.fn(),
    findById: jest.fn(),
  },
  User: {
    find: jest.fn(),
  },
}));

import { Enrollment, Course, User } from '@luxgen/db';
import { certificateService } from '../services/certificateService';

describe('certificateService.listIssuedForTenant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns tenant completed enrollments with course and student labels', async () => {
    (Enrollment.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: 'enr1',
            course: 'c1',
            student: 's1',
            completedAt: new Date('2026-01-15'),
            enrolledAt: new Date('2026-01-01'),
            certificateExpiresAt: new Date('2027-01-15'),
          },
        ]),
      }),
    });
    (Course.find as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ _id: 'c1', title: 'Mindset 101' }]),
    });
    (User.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 's1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@ex.com' }]),
      }),
    });

    const rows = await certificateService.listIssuedForTenant('tenant1');
    expect(Enrollment.find).toHaveBeenCalledWith({
      tenant: 'tenant1',
      learningStatus: 'COMPLETED',
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].courseTitle).toBe('Mindset 101');
    expect(rows[0].studentName).toBe('Ada Lovelace');
    expect(rows[0].verificationCode).toMatch(/^[A-F0-9]{12}$/);
    expect(rows[0].certificateExpiresAt).toEqual(new Date('2027-01-15'));
  });

  it('filters by search on course title', async () => {
    (Enrollment.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: 'enr1', course: 'c1', student: 's1', completedAt: new Date(), enrolledAt: new Date() },
          { _id: 'enr2', course: 'c2', student: 's1', completedAt: new Date(), enrolledAt: new Date() },
        ]),
      }),
    });
    (Course.find as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: 'c1', title: 'Mindset 101' },
        { _id: 'c2', title: 'Sales Bootcamp' },
      ]),
    });
    (User.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 's1', firstName: 'Ada', lastName: 'L', email: 'a@ex.com' }]),
      }),
    });

    const rows = await certificateService.listIssuedForTenant('tenant1', { search: 'sales' });
    expect(rows).toHaveLength(1);
    expect(rows[0].courseTitle).toBe('Sales Bootcamp');
  });
});

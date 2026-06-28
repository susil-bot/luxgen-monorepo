import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@luxgen/db', () => ({
  Course: { find: jest.fn(), findOne: jest.fn(), findOneAndUpdate: jest.fn(), findOneAndDelete: jest.fn() },
}));

import { Course } from '@luxgen/db';
import { courseService } from '../services/courseService';

describe('courseService tenant scoping', () => {
  const tenantA = '507f1f77bcf86cd799439011';
  const tenantB = '507f1f77bcf86cd799439012';

  beforeEach(() => jest.clearAllMocks());

  it('getCoursesByTenant filters by tenant id', async () => {
    (Course.find as jest.Mock).mockReturnValue({ populate: jest.fn().mockResolvedValue([]) });
    await courseService.getCoursesByTenant(tenantA);
    expect(Course.find).toHaveBeenCalledWith({ tenant: tenantA });
  });

  it('updateCourse scopes findOneAndUpdate to tenant', async () => {
    (Course.findOne as jest.Mock).mockResolvedValue({ _id: 'c1', tenant: tenantA, title: 'T' });
    (Course.findOneAndUpdate as jest.Mock).mockReturnValue({ populate: jest.fn().mockResolvedValue({}) });
    await courseService.updateCourse('c1', tenantA, { title: 'New' });
    expect(Course.findOne).toHaveBeenCalledWith({ _id: 'c1', tenant: tenantA });
  });

  it('deleteCourse rejects cross-tenant document', async () => {
    (Course.findOneAndDelete as jest.Mock).mockResolvedValue(null);
    const ok = await courseService.deleteCourse('c1', tenantB);
    expect(Course.findOneAndDelete).toHaveBeenCalledWith({ _id: 'c1', tenant: tenantB });
    expect(ok).toBe(false);
  });
});

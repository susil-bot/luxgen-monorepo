import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CourseStatus } from '@luxgen/db';

const getCoursesByTenantMock = vi.fn();

vi.mock('../services/courseService', () => ({
  courseService: {
    getCoursesByTenant: getCoursesByTenantMock,
    getCourseById: vi.fn(),
    getCoursesByInstructor: vi.fn(),
    createCourse: vi.fn(),
    updateCourse: vi.fn(),
    deleteCourse: vi.fn(),
    enrollStudent: vi.fn(),
    unenrollStudent: vi.fn(),
  },
}));

describe('12 course resolver auto', () => {
  beforeEach(() => {
    getCoursesByTenantMock.mockResolvedValue([
      { id: '1', status: CourseStatus.PUBLISHED },
      { id: '2', status: CourseStatus.DRAFT },
    ]);
  });

  it('filters draft courses for guests', async () => {
    const { courseResolvers } = await import('../schema/course/resolvers');
    const result = await courseResolvers.Query.courses({}, { tenantId: 'tenant-a' }, { user: null });
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe(CourseStatus.PUBLISHED);
  });
});

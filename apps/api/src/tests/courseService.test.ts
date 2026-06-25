import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockPopulate = jest.fn();

jest.mock('@luxgen/db', () => ({
  Course: {
    findById: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

jest.mock('../utils/logger', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn() },
}));

import { Course } from '@luxgen/db';
import { CourseService } from '../services/courseService';

describe('CourseService', () => {
  let service: CourseService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CourseService();
  });

  it('getCourseById populates related documents', async () => {
    const course = { _id: 'course1', title: 'Intro' };
    mockPopulate.mockResolvedValue(course);
    (Course.findById as jest.Mock).mockReturnValue({ populate: mockPopulate });

    const result = await service.getCourseById('course1');

    expect(Course.findById).toHaveBeenCalledWith('course1');
    expect(mockPopulate).toHaveBeenCalled();
    expect(result).toBe(course);
  });
});

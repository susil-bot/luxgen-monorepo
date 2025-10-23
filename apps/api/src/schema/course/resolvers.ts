import { courseService } from '../../services/courseService';

export const courseResolvers = {
  Query: {
    course: async (_: any, { id }: { id: string }) => {
      return await courseService.getCourseById(id);
    },
    courses: async (_: any, { tenantId }: { tenantId: string }) => {
      return await courseService.getCoursesByTenant(tenantId);
    },
    coursesByInstructor: async (_: any, { instructorId }: { instructorId: string }) => {
      return await courseService.getCoursesByInstructor(instructorId);
    },
  },
  Mutation: {
    createCourse: async (_: any, { input }: { input: any }) => {
      return await courseService.createCourse(input);
    },
    updateCourse: async (_: any, { id, input }: { id: string; input: any }) => {
      return await courseService.updateCourse(id, input);
    },
    deleteCourse: async (_: any, { id }: { id: string }) => {
      return await courseService.deleteCourse(id);
    },
    enrollStudent: async (_: any, { courseId, studentId }: { courseId: string; studentId: string }) => {
      return await courseService.enrollStudent(courseId, studentId);
    },
    unenrollStudent: async (_: any, { courseId, studentId }: { courseId: string; studentId: string }) => {
      return await courseService.unenrollStudent(courseId, studentId);
    },
  },
};

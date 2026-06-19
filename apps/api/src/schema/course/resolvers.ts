import { courseService } from '../../services/courseService';
import { activityEventService, actorFromContext } from '../../services/activityEventService';
import { enrollmentService } from '../../services/enrollmentService';
import { emitAutomationEvent } from '@luxgen/agent';
import type { GraphQLContext } from '../../context';

export const courseResolvers = {
  Query: {
    course: async (_: unknown, { id }: { id: string }) => {
      return await courseService.getCourseById(id);
    },
    courses: async (_: unknown, { tenantId }: { tenantId: string }) => {
      return await courseService.getCoursesByTenant(tenantId);
    },
    coursesByInstructor: async (_: unknown, { instructorId }: { instructorId: string }) => {
      return await courseService.getCoursesByInstructor(instructorId);
    },
  },
  Mutation: {
    createCourse: async (_: unknown, { input }: { input: any }, context: GraphQLContext) => {
      const course = await courseService.createCourse(input);
      const actor = actorFromContext(context.user);
      await activityEventService.recordProductCreated(
        { id: course.id, title: course.title, tenantId: input.tenantId },
        actor,
      );
      return course;
    },
    updateCourse: async (_: unknown, { id, input }: { id: string; input: any }, context: GraphQLContext) => {
      const existing = await courseService.getCourseById(id);
      const course = await courseService.updateCourse(id, input);
      const actor = actorFromContext(context.user);
      const tenantId =
        (course.tenant as { _id?: { toString(): string }; id?: string })?._id?.toString?.() ??
        (course.tenant as { toString(): string })?.toString?.() ??
        input.tenantId ??
        '';

      if (input.status && existing && input.status !== existing.status) {
        await activityEventService.recordProductStatusChange(tenantId, id, existing.status, input.status, actor);
      } else {
        await activityEventService.recordProductUpdated(tenantId, id, 'Product details updated', actor);
      }
      return course;
    },
    deleteCourse: async (_: unknown, { id }: { id: string }) => {
      return await courseService.deleteCourse(id);
    },
    enrollStudent: async (
      _: unknown,
      { courseId, studentId }: { courseId: string; studentId: string },
      context: GraphQLContext,
    ) => {
      const course = await courseService.enrollStudent(courseId, studentId);
      const student = (course.students as any[])?.find((s: { id?: string; _id?: { toString(): string } }) => {
        const sid = s.id ?? s._id?.toString?.();
        return sid === studentId;
      }) as { email?: string } | undefined;
      const tenantId =
        (course.tenant as { _id?: { toString(): string }; id?: string })?._id?.toString?.() ??
        (course.tenant as { toString(): string })?.toString?.() ??
        '';
      const actor = actorFromContext(context.user);
      await enrollmentService.ensureEnrollment(tenantId, courseId, studentId);
      await activityEventService.recordOrderCreated(
        tenantId,
        courseId,
        studentId,
        course.title,
        student?.email ?? 'customer',
        actor,
      );
      void emitAutomationEvent({
        tenantId,
        triggerType: 'USER_ENROLLED',
        payload: {
          courseId,
          studentId,
          userId: studentId,
          orderId: `${courseId}:${studentId}`,
          customerEmail: student?.email,
        },
        source: 'lms',
      }).catch(() => undefined);
      return course;
    },
    unenrollStudent: async (
      _: unknown,
      { courseId, studentId }: { courseId: string; studentId: string },
      context: GraphQLContext,
    ) => {
      const course = await courseService.unenrollStudent(courseId, studentId);
      await enrollmentService.cancelEnrollment(courseId, studentId, actorFromContext(context.user));
      return course;
    },
  },
};

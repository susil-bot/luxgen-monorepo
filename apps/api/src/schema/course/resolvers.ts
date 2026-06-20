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
      const tenantId = context.tenantId ?? input.tenantId;
      if (!tenantId) throw new Error('Tenant context required');
      const existing = await courseService.getCourseById(id);
      const course = await courseService.updateCourse(id, tenantId, input);
      const actor = actorFromContext(context.user);
      const activityTenantId =
        (course.tenant as { _id?: { toString(): string }; id?: string })?._id?.toString?.() ??
        (course.tenant as { toString(): string })?.toString?.() ??
        tenantId;

      if (input.status && existing && input.status !== existing.status) {
        await activityEventService.recordProductStatusChange(
          activityTenantId,
          id,
          existing.status,
          input.status,
          actor,
        );
      } else {
        await activityEventService.recordProductUpdated(activityTenantId, id, 'Product details updated', actor);
      }
      return course;
    },
    deleteCourse: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.tenantId) throw new Error('Tenant context required');
      return await courseService.deleteCourse(id, context.tenantId);
    },
    enrollStudent: async (
      _: unknown,
      { courseId, studentId }: { courseId: string; studentId: string },
      context: GraphQLContext,
    ) => {
      if (!context.tenantId) throw new Error('Tenant context required');
      const course = await courseService.enrollStudent(courseId, context.tenantId, studentId);
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
      if (!context.tenantId) throw new Error('Tenant context required');
      const course = await courseService.unenrollStudent(courseId, context.tenantId, studentId);
      await enrollmentService.cancelEnrollment(courseId, studentId, actorFromContext(context.user));
      return course;
    },
  },
};

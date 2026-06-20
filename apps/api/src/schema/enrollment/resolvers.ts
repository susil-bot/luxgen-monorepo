import { EnrollmentPaymentStatus, EnrollmentLearningStatus, UserRole } from '@luxgen/db';
import { enrollmentService } from '../../services/enrollmentService';
import { courseService } from '../../services/courseService';
import { actorFromContext } from '../../services/activityEventService';
import { isBillingDevMode } from '../../services/billingService';
import { User } from '@luxgen/db';
import type { GraphQLContext } from '../../context';

const STAFF_ROLES = new Set<UserRole>([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR]);

function assertCanManageProgress(context: GraphQLContext, studentId: string): void {
  if (!context.user) throw new Error('Authentication required');
  if (context.user.id === studentId || context.user._id?.toString?.() === studentId) return;
  if (STAFF_ROLES.has(context.user.role)) return;
  throw new Error('Not authorized to update this enrollment');
}

function mapEnrollment(doc: {
  _id?: { toString(): string };
  id?: string;
  course: { toString(): string } | string;
  student: { toString(): string } | string;
  notes: string;
  paymentStatus: string;
  progressPercent?: number;
  learningStatus?: string;
  lastAccessedAt?: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  enrolledAt: Date;
}) {
  return {
    id: doc._id?.toString?.() ?? doc.id,
    courseId: typeof doc.course === 'string' ? doc.course : doc.course.toString(),
    studentId: typeof doc.student === 'string' ? doc.student : doc.student.toString(),
    notes: doc.notes ?? '',
    paymentStatus: doc.paymentStatus,
    progressPercent: doc.progressPercent ?? 0,
    learningStatus: doc.learningStatus ?? EnrollmentLearningStatus.ACTIVE,
    lastAccessedAt: doc.lastAccessedAt,
    paidAt: doc.paidAt,
    cancelledAt: doc.cancelledAt,
    completedAt: doc.completedAt,
    enrolledAt: doc.enrolledAt,
  };
}

export const enrollmentResolvers = {
  User: {
    staffNotes: (parent: { staffNotes?: string }) => parent.staffNotes ?? '',
  },
  Query: {
    enrollment: async (_: unknown, { courseId, studentId }: { courseId: string; studentId: string }) => {
      const doc = await enrollmentService.getByCourseAndStudent(courseId, studentId);
      return doc ? mapEnrollment(doc) : null;
    },
    enrollmentById: async (_: unknown, { id }: { id: string }) => {
      const doc = await enrollmentService.getById(id);
      return doc ? mapEnrollment(doc) : null;
    },
    enrollments: async (_: unknown, { tenantId }: { tenantId: string }) => {
      const docs = await enrollmentService.listByTenant(tenantId);
      return docs.map(mapEnrollment);
    },
    studentEnrollments: async (
      _: unknown,
      { tenantId, studentId }: { tenantId: string; studentId: string },
      context: GraphQLContext,
    ) => {
      assertCanManageProgress(context, studentId);
      const docs = await enrollmentService.listByStudent(tenantId, studentId);
      return docs.map(mapEnrollment);
    },
  },
  Mutation: {
    updateOrderNotes: async (
      _: unknown,
      { input }: { input: { courseId: string; studentId: string; notes: string } },
      context: GraphQLContext,
    ) => {
      const doc = await enrollmentService.updateOrderNotes(
        input.courseId,
        input.studentId,
        input.notes,
        actorFromContext(context.user),
      );
      return mapEnrollment(doc);
    },
    updateOrder: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          courseId: string;
          studentId: string;
          notes?: string;
          paymentStatus?: string;
        };
      },
      context: GraphQLContext,
    ) => {
      const doc = await enrollmentService.updateOrder(
        input.courseId,
        input.studentId,
        {
          notes: input.notes,
          paymentStatus: input.paymentStatus as EnrollmentPaymentStatus | undefined,
        },
        actorFromContext(context.user),
      );
      return mapEnrollment(doc);
    },
    refundOrder: async (
      _: unknown,
      { courseId, studentId }: { courseId: string; studentId: string },
      context: GraphQLContext,
    ) => {
      const doc = await enrollmentService.refundEnrollment(courseId, studentId, actorFromContext(context.user));
      return mapEnrollment(doc);
    },
    cancelOrder: async (
      _: unknown,
      { courseId, studentId }: { courseId: string; studentId: string },
      context: GraphQLContext,
    ) => {
      const tenantId = context.tenantId;
      if (!tenantId) throw new Error('Tenant context required');
      const actor = actorFromContext(context.user);
      await courseService.unenrollStudent(courseId, tenantId, studentId);
      let doc = await enrollmentService.cancelEnrollment(courseId, studentId, actor);
      if (!doc) {
        await enrollmentService.ensureEnrollment(tenantId, courseId, studentId);
        doc = await enrollmentService.cancelEnrollment(courseId, studentId, actor);
      }
      if (!doc) throw new Error('Order not found');
      return mapEnrollment(doc);
    },
    updateCustomerNotes: async (
      _: unknown,
      { input }: { input: { customerId: string; notes: string } },
      context: GraphQLContext,
    ) => {
      await enrollmentService.updateCustomerNotes(input.customerId, input.notes, actorFromContext(context.user));
      const user = await User.findById(input.customerId).populate('tenant');
      if (!user) throw new Error('Customer not found');
      return user;
    },
    createOrderCheckoutSession: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          tenantId: string;
          courseId: string;
          studentId: string;
          amountCents: number;
          courseTitle: string;
          customerEmail?: string;
          successUrl: string;
          cancelUrl: string;
        };
      },
    ) => {
      return enrollmentService.createOrderCheckoutSession(input);
    },
    confirmOrderPaymentDev: async (
      _: unknown,
      { courseId, studentId, tenantId }: { courseId: string; studentId: string; tenantId: string },
    ) => {
      if (!isBillingDevMode()) {
        throw new Error('Dev payment confirmation is disabled. Set BILLING_DEV_MODE=true.');
      }
      const doc = await enrollmentService.markPaymentConfirmed(
        tenantId,
        courseId,
        studentId,
        `dev_manual_${Date.now()}`,
      );
      return mapEnrollment(doc);
    },
    updateEnrollmentProgress: async (
      _: unknown,
      { input }: { input: { courseId: string; studentId: string; progressPercent: number } },
      context: GraphQLContext,
    ) => {
      assertCanManageProgress(context, input.studentId);
      const doc = await enrollmentService.updateProgress(input.courseId, input.studentId, input.progressPercent);
      return mapEnrollment(doc);
    },
    markCourseComplete: async (_: unknown, { courseId }: { courseId: string }, context: GraphQLContext) => {
      if (!context.user) throw new Error('Authentication required');
      const studentId = context.user.id ?? context.user._id?.toString?.();
      if (!studentId) throw new Error('User id required');
      const doc = await enrollmentService.markCourseComplete(courseId, studentId);
      return mapEnrollment(doc);
    },
  },
};

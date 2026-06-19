import { enrollmentService } from '../../services/enrollmentService';
import { actorFromContext } from '../../services/activityEventService';
import { isBillingDevMode } from '../../services/billingService';
import { User } from '@luxgen/db';
import type { GraphQLContext } from '../../context';

function mapEnrollment(doc: {
  _id?: { toString(): string };
  id?: string;
  course: { toString(): string } | string;
  student: { toString(): string } | string;
  notes: string;
  paymentStatus: string;
  paidAt?: Date;
  cancelledAt?: Date;
  enrolledAt: Date;
}) {
  return {
    id: doc._id?.toString?.() ?? doc.id,
    courseId: typeof doc.course === 'string' ? doc.course : doc.course.toString(),
    studentId: typeof doc.student === 'string' ? doc.student : doc.student.toString(),
    notes: doc.notes ?? '',
    paymentStatus: doc.paymentStatus,
    paidAt: doc.paidAt,
    cancelledAt: doc.cancelledAt,
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
    updateCustomerNotes: async (
      _: unknown,
      { input }: { input: { customerId: string; notes: string } },
      context: GraphQLContext,
    ) => {
      await enrollmentService.updateCustomerNotes(
        input.customerId,
        input.notes,
        actorFromContext(context.user),
      );
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
      const doc = await enrollmentService.markPaymentConfirmed(tenantId, courseId, studentId, `dev_manual_${Date.now()}`);
      return mapEnrollment(doc);
    },
  },
};

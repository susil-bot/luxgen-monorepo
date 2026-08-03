import { GraphQLError } from 'graphql';
import { UserRole } from '@luxgen/db';
import type { GraphQLContext } from '../../context';
import { scopedTenantId } from '../../graphql/tenantScope';
import { enrollmentService } from '../../services/enrollmentService';
import { learnerService, type CustomerSegmentId } from '../../services/learnerService';
import { learnerChatService, type LearnerChatMessage } from '../../services/learnerChatService';

const STAFF_ROLES = new Set<UserRole>([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR]);

function contextUserId(context: GraphQLContext): string {
  return context.user?._id?.toString?.() ?? '';
}

function assertCanViewLearner(context: GraphQLContext, studentId: string): void {
  if (!context.user) throw new Error('Authentication required');
  const viewerId = contextUserId(context);
  if (viewerId === studentId) return;
  if (STAFF_ROLES.has(context.user.role)) return;
  throw new Error('Not authorized to view this learner dashboard');
}

function assertStaff(context: GraphQLContext): void {
  if (!context.user) throw new Error('Authentication required');
  if (!STAFF_ROLES.has(context.user.role)) throw new Error('Staff access required');
}

export const learnerResolvers = {
  Query: {
    enrollmentProgress: async (
      _: unknown,
      { courseId, studentId }: { courseId: string; studentId: string },
      context: GraphQLContext,
    ) => {
      assertCanViewLearner(context, studentId);
      const enrollment = await enrollmentService.getByCourseAndStudent(courseId, studentId);
      if (!enrollment) throw new Error('Enrollment not found');
      const totalLessons = 4;
      const completedLessons = Math.round(((enrollment.progressPercent ?? 0) / 100) * totalLessons);
      return {
        courseId,
        studentId,
        progressPercent: enrollment.progressPercent ?? 0,
        completedLessons,
        totalLessons,
        resumeLessonIndex: Math.min(completedLessons, totalLessons - 1),
      };
    },
    learnerDashboard: async (
      _: unknown,
      { tenantId, studentId }: { tenantId: string; studentId?: string },
      context: GraphQLContext,
    ) => {
      const resolvedTenantId = scopedTenantId(context, tenantId);
      const targetStudentId = studentId ?? contextUserId(context);
      if (!targetStudentId) throw new Error('Authentication required');
      assertCanViewLearner(context, targetStudentId);
      return learnerService.getLearnerDashboard(resolvedTenantId, targetStudentId);
    },
    customerSegments: async (_: unknown, { tenantId }: { tenantId: string }, context: GraphQLContext) => {
      assertStaff(context);
      return learnerService.getCustomerSegments(scopedTenantId(context, tenantId));
    },
    customersInSegment: async (
      _: unknown,
      { tenantId, segment }: { tenantId: string; segment: CustomerSegmentId },
      context: GraphQLContext,
    ) => {
      assertStaff(context);
      return learnerService.getCustomersInSegment(scopedTenantId(context, tenantId), segment);
    },
  },
  Mutation: {
    learnerChat: async (_: unknown, { messages }: { messages: LearnerChatMessage[] }, context: GraphQLContext) => {
      if (!context.user) throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
      if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
        throw new GraphQLError('Provide between 1 and 20 chat messages', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      const sanitizedMessages = messages.map((message) => ({
        role: message.role,
        content: message.content.trim(),
      }));

      if (
        sanitizedMessages.some(
          (message) =>
            (message.role !== 'user' && message.role !== 'assistant') ||
            !message.content ||
            message.content.length > 4_000,
        )
      ) {
        throw new GraphQLError('Chat messages must have a valid role and content up to 4,000 characters', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      try {
        return { content: await learnerChatService.respond(sanitizedMessages) };
      } catch (error) {
        throw new GraphQLError('The learning assistant is temporarily unavailable. Please try again shortly.', {
          extensions: { code: 'SERVICE_UNAVAILABLE' },
          originalError: error instanceof Error ? error : undefined,
        });
      }
    },
  },
};

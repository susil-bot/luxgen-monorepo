import { UserRole } from '@luxgen/db';
import type { GraphQLContext } from '../../context';
import { scopedTenantId } from '../../graphql/tenantScope';
import { learnerService, type CustomerSegmentId } from '../../services/learnerService';

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
};

import { GraphQLError } from 'graphql';
import type { GraphQLContext } from '../../context';
import { scopedTenantId as resolveScopedTenantId } from '../../graphql/tenantScope';
import { certificateService } from '../../services/certificateService';

const uid = (ctx: GraphQLContext) => ctx.user?._id?.toString?.() ?? '';

export const certificateResolvers = {
  Query: {
    learnerCertificates: async (_: unknown, { studentId }: { studentId?: string }, ctx: GraphQLContext) => {
      if (!ctx.user) throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
      return certificateService.listForStudent(studentId ?? uid(ctx));
    },
    issuedCertificates: async (
      _: unknown,
      { tenantId, search }: { tenantId: string; search?: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
      const scopedId = resolveScopedTenantId(ctx, tenantId);
      return certificateService.listIssuedForTenant(scopedId, { search });
    },
  },
  Mutation: {
    issueCertificate: async (
      _: unknown,
      { courseId, studentId }: { courseId: string; studentId?: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } });
      return certificateService.issue(courseId, studentId ?? uid(ctx));
    },
  },
};

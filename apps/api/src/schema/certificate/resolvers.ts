import type { GraphQLContext } from '../../context';
import { certificateService } from '../../services/certificateService';
const uid = (ctx: GraphQLContext) => ctx.user?._id?.toString?.() ?? '';
export const certificateResolvers = {
  Query: {
    learnerCertificates: async (_: unknown, { studentId }: { studentId?: string }, ctx: GraphQLContext) => {
      if (!ctx.user) throw new Error('Authentication required');
      return certificateService.listForStudent(studentId ?? uid(ctx));
    },
  },
  Mutation: {
    issueCertificate: async (
      _: unknown,
      { courseId, studentId }: { courseId: string; studentId?: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error('Authentication required');
      return certificateService.issue(courseId, studentId ?? uid(ctx));
    },
  },
};

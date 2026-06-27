import type { GraphQLContext } from '../../../context';
import { certificateService } from '../../../services/certificateService';
const uid = (ctx: GraphQLContext) => ctx.user?._id?.toString?.() ?? '';
export const IssueLearnerCertificateResolvers = {
  Mutation: {
    issueLearnerCertificate: async (
      _: unknown,
      { courseId, studentId }: { courseId: string; studentId?: string },
      ctx: GraphQLContext,
    ) => certificateService.issue(courseId, studentId ?? uid(ctx)),
  },
};

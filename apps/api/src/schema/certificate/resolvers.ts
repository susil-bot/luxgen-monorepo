import { UserRole } from '@luxgen/db';
import { certificateService } from '../../services/certificateService';
import type { GraphQLContext } from '../../context';

const STAFF_ROLES = new Set<UserRole>([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR]);

function assertCanViewCertificates(context: GraphQLContext, studentId: string): void {
  if (!context.user) throw new Error('Authentication required');
  const userId = context.user.id ?? context.user._id?.toString?.();
  if (userId === studentId) return;
  if (STAFF_ROLES.has(context.user.role)) return;
  throw new Error('Not authorized to view these certificates');
}

function mapCertificate(doc: {
  _id?: { toString(): string };
  id?: string;
  tenant: { toString(): string } | string;
  course: { toString(): string } | string;
  student: { toString(): string } | string;
  courseTitle: string;
  studentName: string;
  certificateNumber: string;
  issuedAt: Date;
}) {
  return {
    id: doc._id?.toString?.() ?? doc.id,
    tenantId: typeof doc.tenant === 'string' ? doc.tenant : doc.tenant.toString(),
    courseId: typeof doc.course === 'string' ? doc.course : doc.course.toString(),
    studentId: typeof doc.student === 'string' ? doc.student : doc.student.toString(),
    courseTitle: doc.courseTitle,
    studentName: doc.studentName,
    certificateNumber: doc.certificateNumber,
    issuedAt: doc.issuedAt,
  };
}

export const certificateResolvers = {
  Query: {
    certificate: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const doc = await certificateService.getById(id);
      if (!doc) return null;
      assertCanViewCertificates(context, doc.student.toString());
      return mapCertificate(doc);
    },
    studentCertificates: async (
      _: unknown,
      { tenantId, studentId }: { tenantId: string; studentId: string },
      context: GraphQLContext,
    ) => {
      assertCanViewCertificates(context, studentId);
      const docs = await certificateService.listByStudent(tenantId, studentId);
      return docs.map(mapCertificate);
    },
  },
};

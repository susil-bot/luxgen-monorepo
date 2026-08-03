import { Course, Enrollment, EnrollmentLearningStatus, User } from '@luxgen/db';
import { createHash, randomBytes } from 'crypto';

const makeCode = () => randomBytes(6).toString('hex').toUpperCase();

/** Stable verification code derived from enrollment id (list must not reshuffle codes). */
function verificationCodeForEnrollment(enrollmentId: string): string {
  return createHash('sha256').update(enrollmentId).digest('hex').slice(0, 12).toUpperCase();
}

export type CertificateDTO = {
  id: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName?: string | null;
  studentEmail?: string | null;
  issuedAt: Date;
  verificationCode: string;
  certificateExpiresAt?: Date | null;
};

export const certificateService = {
  async listForStudent(studentId: string): Promise<CertificateDTO[]> {
    const rows = await Enrollment.find({
      student: studentId,
      learningStatus: EnrollmentLearningStatus.COMPLETED,
    }).lean();
    const courses = await Course.find({ _id: { $in: rows.map((r) => r.course) } }).lean();
    const titles = new Map(courses.map((c) => [String(c._id), c.title]));
    return rows.map((r) => ({
      id: `${String(r._id)}-cert`,
      courseId: String(r.course),
      courseTitle: titles.get(String(r.course)) ?? 'Course',
      studentId,
      issuedAt: r.completedAt ?? r.enrolledAt ?? new Date(),
      verificationCode: verificationCodeForEnrollment(String(r._id)),
      certificateExpiresAt: r.certificateExpiresAt ?? null,
    }));
  },

  /** Admin: completed enrollments for a tenant (issued certificates surface). */
  async listIssuedForTenant(
    tenantId: string,
    opts: { search?: string } = {},
  ): Promise<CertificateDTO[]> {
    const rows = await Enrollment.find({
      tenant: tenantId,
      learningStatus: EnrollmentLearningStatus.COMPLETED,
    })
      .sort({ completedAt: -1, enrolledAt: -1 })
      .lean();

    if (rows.length === 0) return [];

    const courseIds = [...new Set(rows.map((r) => String(r.course)))];
    const studentIds = [...new Set(rows.map((r) => String(r.student)))];
    const [courses, students] = await Promise.all([
      Course.find({ _id: { $in: courseIds } }).lean(),
      User.find({ _id: { $in: studentIds } })
        .select('firstName lastName email')
        .lean(),
    ]);
    const titles = new Map(courses.map((c) => [String(c._id), c.title]));
    const people = new Map(
      students.map((u) => [
        String(u._id),
        {
          name: [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || 'Learner',
          email: u.email ?? '',
        },
      ]),
    );

    let list: CertificateDTO[] = rows.map((r) => {
      const person = people.get(String(r.student));
      return {
        id: `${String(r._id)}-cert`,
        courseId: String(r.course),
        courseTitle: titles.get(String(r.course)) ?? 'Course',
        studentId: String(r.student),
        studentName: person?.name ?? null,
        studentEmail: person?.email ?? null,
        issuedAt: r.completedAt ?? r.enrolledAt ?? new Date(),
        verificationCode: verificationCodeForEnrollment(String(r._id)),
        certificateExpiresAt: r.certificateExpiresAt ?? null,
      };
    });

    if (opts.search?.trim()) {
      const q = opts.search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.courseTitle.toLowerCase().includes(q) ||
          (c.studentName ?? '').toLowerCase().includes(q) ||
          (c.studentEmail ?? '').toLowerCase().includes(q) ||
          c.verificationCode.toLowerCase().includes(q),
      );
    }

    return list;
  },

  async issue(courseId: string, studentId: string): Promise<CertificateDTO> {
    const row = await Enrollment.findOne({ course: courseId, student: studentId });
    if (!row) throw new Error('Enrollment not found');
    if (row.learningStatus !== EnrollmentLearningStatus.COMPLETED) throw new Error('Course not completed');
    const course = await Course.findById(courseId).lean();
    return {
      id: `${String(row._id)}-cert`,
      courseId,
      courseTitle: course?.title ?? 'Course',
      studentId,
      issuedAt: row.completedAt ?? new Date(),
      verificationCode: verificationCodeForEnrollment(String(row._id)),
      certificateExpiresAt: row.certificateExpiresAt ?? null,
    };
  },
};

export { makeCode };

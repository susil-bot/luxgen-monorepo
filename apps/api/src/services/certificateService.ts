import { Course, Enrollment, EnrollmentLearningStatus } from '@luxgen/db';
import { randomBytes } from 'crypto';
const makeCode = () => randomBytes(6).toString('hex').toUpperCase();
export const certificateService = {
  async listForStudent(studentId: string) {
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
      verificationCode: makeCode(),
    }));
  },
  async issue(courseId: string, studentId: string) {
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
      verificationCode: makeCode(),
    };
  },
};

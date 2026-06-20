import { randomBytes } from 'crypto';
import { Certificate, Course, User, EnrollmentLearningStatus, type ICertificate, type IEnrollment } from '@luxgen/db';
import { emitAutomationEvent } from '@luxgen/agent';
import { logger } from '../utils/logger';

function generateCertificateNumber(tenantId: string): string {
  const tenantPart = tenantId.slice(-4).toUpperCase();
  const uniquePart = randomBytes(3).toString('hex').toUpperCase();
  const year = new Date().getFullYear();
  return `LUX-${tenantPart}-${year}-${uniquePart}`;
}

export class CertificateService {
  async getById(id: string): Promise<ICertificate | null> {
    return Certificate.findById(id);
  }

  async listByStudent(tenantId: string, studentId: string): Promise<ICertificate[]> {
    return Certificate.find({ tenant: tenantId, student: studentId }).sort({ issuedAt: -1 });
  }

  async getByCourseAndStudent(tenantId: string, courseId: string, studentId: string): Promise<ICertificate | null> {
    return Certificate.findOne({ tenant: tenantId, course: courseId, student: studentId });
  }

  async issueForCompletion(enrollment: IEnrollment): Promise<ICertificate | null> {
    if (enrollment.learningStatus !== EnrollmentLearningStatus.COMPLETED) return null;

    const tenantId = enrollment.tenant.toString();
    const courseId = enrollment.course.toString();
    const studentId = enrollment.student.toString();
    const enrollmentId = enrollment._id?.toString?.() ?? enrollment.id;

    if (!enrollmentId) return null;

    const existing = await this.getByCourseAndStudent(tenantId, courseId, studentId);
    if (existing) return existing;

    const [course, student] = await Promise.all([Course.findById(courseId), User.findById(studentId)]);
    if (!course || !student) {
      logger.warn(`Certificate issue skipped — missing course or student ${courseId}:${studentId}`);
      return null;
    }

    const studentName = `${student.firstName} ${student.lastName}`.trim() || student.email;
    const certificate = await Certificate.create({
      tenant: tenantId,
      course: courseId,
      student: studentId,
      enrollment: enrollmentId,
      courseTitle: course.title,
      studentName,
      certificateNumber: generateCertificateNumber(tenantId),
      issuedAt: enrollment.completedAt ?? new Date(),
    });

    void emitAutomationEvent({
      tenantId,
      triggerType: 'CERTIFICATE_ISSUED',
      payload: {
        certificateId: certificate.id,
        courseId,
        studentId,
        userId: studentId,
        courseTitle: course.title,
        customerEmail: student.email,
        certificateNumber: certificate.certificateNumber,
      },
      source: 'lms',
    }).catch(() => undefined);

    logger.info(`Certificate issued: ${certificate.certificateNumber} for ${courseId}:${studentId}`);
    return certificate;
  }
}

export const certificateService = new CertificateService();

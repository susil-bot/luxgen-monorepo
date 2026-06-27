import { enrollmentService } from './enrollmentService';
export const checkoutSessionStatusService = {
  async active(tenantId: string, studentId: string, courseId: string) {
    const e = await enrollmentService.getByCourseAndStudent(courseId, studentId);
    if (!e || e.paymentStatus === 'PAID')
      return { active: false, status: 'NONE', courseId: null, studentId: null, tenantId: null };
    return { active: true, status: 'OPEN', courseId, studentId, tenantId };
  },
};

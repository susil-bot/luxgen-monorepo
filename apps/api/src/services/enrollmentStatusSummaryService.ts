import { enrollmentService } from './enrollmentService';
export const enrollmentStatusSummaryService = {
  async get(courseId: string, studentId: string) {
    const e = await enrollmentService.getByCourseAndStudent(courseId, studentId);
    if (!e) return { enrolled: false, paymentStatus: null, learningStatus: null, progressPercent: 0 };
    return {
      enrolled: true,
      paymentStatus: e.paymentStatus,
      learningStatus: e.learningStatus,
      progressPercent: e.progressPercent ?? 0,
    };
  },
};

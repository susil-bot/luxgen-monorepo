export enum EnrollmentLearningStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface Enrollment {
  id: string;
  courseId: string;
  /** GraphQL field name */
  studentId?: string;
  /** Alias used in some clients */
  userId?: string;
  learningStatus?: EnrollmentLearningStatus;
  progressPercent?: number;
  lastAccessedAt?: string;
  completedAt?: string;
  paymentStatus?: string;
  enrolledAt?: string;
}

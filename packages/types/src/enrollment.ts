export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface Enrollment {
  id: string;
  courseId: string;
  /** GraphQL field name */
  studentId?: string;
  /** Alias used in some clients */
  userId?: string;
  status?: EnrollmentStatus;
  paymentStatus?: string;
  enrolledAt?: string;
}

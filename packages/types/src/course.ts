export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CourseInstructor {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  status: CourseStatus;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  instructor?: CourseInstructor;
}

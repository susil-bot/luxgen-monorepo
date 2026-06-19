export type UiUserRole = 'admin' | 'instructor' | 'learner' | 'user';
export interface GraphQLCourse {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  } | null;
  students?: Array<{ id: string }> | null;
}

export function mapApiRoleToUiRole(role?: string): UiUserRole {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return 'admin';
    case 'INSTRUCTOR':
      return 'instructor';
    case 'STUDENT':
      return 'learner';
    default:
      return 'user';
  }
}

export function formatCourseDuration(startDate?: string | null, endDate?: string | null): string {
  if (startDate && endDate) {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return `${start} – ${end}`;
  }
  if (startDate) return `From ${new Date(startDate).toLocaleDateString()}`;
  return 'Self-paced';
}

export function instructorName(course: GraphQLCourse): string {
  if (!course.instructor) return 'Unassigned';
  return `${course.instructor.firstName} ${course.instructor.lastName}`.trim();
}

export function enrolledCount(course: GraphQLCourse): number {
  return course.students?.length ?? 0;
}

/** Shape expected by @luxgen/ui CourseOverview */
export function toCourseOverviewProps(course: GraphQLCourse) {
  return {
    id: course.id,
    title: course.title,
    description: course.description ?? '',
    instructor: instructorName(course),
    duration: formatCourseDuration(course.startDate, course.endDate),
    level: course.status ?? 'DRAFT',
    rating: 0,
    enrolledCount: enrolledCount(course),
    thumbnail: '',
  };
}

export function statusBadgeClass(status?: string): string {
  switch (status) {
    case 'PUBLISHED':
      return 'badge-green';
    case 'COMPLETED':
      return 'badge-blue';
    case 'CANCELLED':
      return 'badge-red';
    default:
      return 'badge-orange';
  }
}

export function formatStatusLabel(status?: string): string {
  if (!status) return 'Draft';
  return status.charAt(0) + status.slice(1).toLowerCase();
}

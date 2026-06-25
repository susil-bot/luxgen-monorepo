/** Map GraphQL course nodes to @luxgen/ui CourseOverview shape */
export interface GqlCourseNode {
  id: string;
  title: string;
  description?: string | null;
  instructor?: { firstName?: string; lastName?: string } | null;
  students?: { id: string }[] | null;
  startDate?: string | null;
  endDate?: string | null;
  commerce?: { category?: string | null } | null;
}
export function formatCourseInstructor(c: GqlCourseNode): string {
  if (!c.instructor) return 'Unassigned';
  return `${c.instructor.firstName ?? ''} ${c.instructor.lastName ?? ''}`.trim() || 'Unassigned';
}
export function formatCourseDuration(c: GqlCourseNode): string {
  if (c.startDate && c.endDate) {
    const s = new Date(c.startDate),
      e = new Date(c.endDate);
    if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
      const w = Math.max(1, Math.round((e.getTime() - s.getTime()) / 604800000));
      return `${w} week${w === 1 ? '' : 's'}`;
    }
  }
  return 'Self-paced';
}
export function mapCourseToOverview(c: GqlCourseNode) {
  return {
    id: c.id,
    title: c.title,
    description: c.description ?? '',
    instructor: formatCourseInstructor(c),
    duration: formatCourseDuration(c),
    level: c.commerce?.category ?? 'General',
    rating: 0,
    enrolledCount: c.students?.length ?? 0,
    thumbnail: '/images/course-thumbnail.jpg',
  };
}
export type CourseUserRole = 'admin' | 'instructor' | 'learner' | 'user';
export function roleFromSession(role?: string | null): CourseUserRole {
  const n = (role ?? '').toUpperCase();
  if (n in { ADMIN: 1, SUPER_ADMIN: 1 }) return 'admin';
  if (n === 'INSTRUCTOR') return 'instructor';
  if (n === 'STUDENT') return 'learner';
  return 'user';
}

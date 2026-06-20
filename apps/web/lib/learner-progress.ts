import type { LearnCourse } from './learn-store';
import { formatInstructorName } from './learn-store';

const COURSE_EMOJIS = ['📚', '⚛️', '🎯', '📊', '🧠', '🔬', '💰', '🚀', '🎨', '🔷'];

export interface LearnerEnrollment {
  id: string;
  courseId: string;
  studentId: string;
  progressPercent: number;
  learningStatus: string;
  lastAccessedAt?: string | null;
  completedAt?: string | null;
  enrolledAt?: string | null;
}

export interface LearnerCourseView {
  id: string;
  courseId: string;
  title: string;
  instructor: string;
  emoji: string;
  progress: number;
  duration: string;
  lastAccessedAt: string;
  category: string;
  learningStatus: string;
  completedAt?: string | null;
}

export function courseEmoji(courseId: string): string {
  let hash = 0;
  for (let i = 0; i < courseId.length; i += 1) {
    hash = (hash + courseId.charCodeAt(i)) % COURSE_EMOJIS.length;
  }
  return COURSE_EMOJIS[hash] ?? '📚';
}

export function formatRelativeTime(iso?: string | null): string {
  if (!iso) return 'Not started';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Not started';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatCourseDuration(course: Pick<LearnCourse, 'startDate' | 'endDate'>): string {
  if (!course.startDate && !course.endDate) return 'Self-paced';
  if (course.startDate && course.endDate) {
    const start = new Date(course.startDate);
    const end = new Date(course.endDate);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      const weeks = Math.max(1, Math.round((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)));
      return `${weeks} week${weeks === 1 ? '' : 's'}`;
    }
  }
  return 'Self-paced';
}

export function buildLearnerCourseViews(enrollments: LearnerEnrollment[], courses: LearnCourse[]): LearnerCourseView[] {
  const courseById = new Map(courses.map((course) => [course.id, course]));

  return enrollments.map((enrollment) => {
    const course = courseById.get(enrollment.courseId);
    const title = course?.title ?? `Course ${enrollment.courseId.slice(-6)}`;
    const instructor = course ? (formatInstructorName(course) ?? 'Instructor') : 'Instructor';
    const lastAccessedSource = enrollment.lastAccessedAt ?? enrollment.enrolledAt;

    return {
      id: enrollment.id,
      courseId: enrollment.courseId,
      title,
      instructor,
      emoji: courseEmoji(enrollment.courseId),
      progress: enrollment.progressPercent ?? 0,
      duration: course ? formatCourseDuration(course) : 'Self-paced',
      lastAccessedAt: formatRelativeTime(lastAccessedSource),
      category: 'Course',
      learningStatus: enrollment.learningStatus,
      completedAt: enrollment.completedAt,
    };
  });
}

export function sortEnrollmentsByRecent(
  enrollments: LearnerEnrollment[],
  views: LearnerCourseView[],
): LearnerCourseView[] {
  const accessByCourseId = new Map(enrollments.map((e) => [e.courseId, e.lastAccessedAt ?? e.enrolledAt ?? '']));
  return [...views].sort((a, b) => {
    const aTime = Date.parse(accessByCourseId.get(a.courseId) ?? '') || 0;
    const bTime = Date.parse(accessByCourseId.get(b.courseId) ?? '') || 0;
    return bTime - aTime;
  });
}

export function buildRecommendedCourses(courses: LearnCourse[], enrolledCourseIds: Set<string>): LearnerCourseView[] {
  return courses
    .filter((course) => course.status === 'PUBLISHED' && !enrolledCourseIds.has(course.id))
    .slice(0, 6)
    .map((course) => ({
      id: course.id,
      courseId: course.id,
      title: course.title,
      instructor: formatInstructorName(course) ?? 'Instructor',
      emoji: courseEmoji(course.id),
      progress: 0,
      duration: formatCourseDuration(course),
      lastAccessedAt: '',
      category: 'Course',
      learningStatus: 'ACTIVE',
    }));
}

export function formatCompletedDate(iso?: string | null): string {
  if (!iso) return 'Recently';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

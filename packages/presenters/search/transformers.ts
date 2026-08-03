import { filterByQuery } from './helpers/filterByQuery';

export interface SearchCourseRaw {
  id: string;
  title?: string | null;
  description?: string | null;
  status?: string | null;
}

export interface SearchUserRaw {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  status?: string | null;
}

export type SearchHitKind = 'course' | 'learner';

export interface SearchResultHit {
  id: string;
  kind: SearchHitKind;
  title: string;
  typeLabel: string;
  status: string;
  metadata: string;
  href: string;
}

export interface SearchCourseHit extends SearchResultHit {
  kind: 'course';
}

export interface SearchUserHit extends SearchResultHit {
  kind: 'learner';
  email: string;
}

export interface SearchViewModel {
  query: string;
  courses: SearchCourseHit[];
  users: SearchUserHit[];
  /** Flat list for overlay cards (courses then learners) */
  results: SearchResultHit[];
  courseCount: number;
  userCount: number;
  hasQuery: boolean;
  isEmpty: boolean;
}

function courseSearchText(c: SearchCourseRaw): string {
  return [c.title, c.description].filter(Boolean).join(' ');
}

function userSearchText(u: SearchUserRaw): string {
  return [u.email, u.firstName, u.lastName].filter(Boolean).join(' ');
}

function isLearnerRole(role?: string | null): boolean {
  const r = (role ?? '').toUpperCase();
  return r === 'STUDENT' || r === 'USER';
}

function formatCourseStatus(status?: string | null): string {
  if (!status) return 'Published';
  const s = status.toLowerCase();
  if (s === 'published' || s === 'active') return 'Published';
  if (s === 'draft') return 'Draft';
  if (s === 'archived') return 'Archived';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function transformSearchCourseHit(course: SearchCourseRaw, tenant: string): SearchCourseHit {
  const status = formatCourseStatus(course.status);
  const description = (course.description ?? '').trim();
  return {
    id: course.id,
    kind: 'course',
    title: course.title ?? 'Untitled course',
    typeLabel: 'Course',
    status,
    metadata: description ? description.slice(0, 80) : 'Course',
    href: `/courses/${course.id}?tenant=${encodeURIComponent(tenant)}`,
  };
}

export function transformSearchUserHit(user: SearchUserRaw, tenant: string): SearchUserHit {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  const email = user.email ?? '';
  const title = name || email || user.id;
  const status = (user.status ?? 'ACTIVE').toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
  return {
    id: user.id,
    kind: 'learner',
    email,
    title,
    typeLabel: 'Learner',
    status,
    metadata: email && email !== title ? email : 'Learner account',
    href: `/admin/customers/${user.id}?tenant=${encodeURIComponent(tenant)}`,
  };
}

export function transformSearchResults(
  query: string,
  tenant: string,
  courses: SearchCourseRaw[],
  users: SearchUserRaw[],
): SearchViewModel {
  const trimmed = query.trim();
  const courseHits = filterByQuery(courses, trimmed, courseSearchText).map((c) => transformSearchCourseHit(c, tenant));
  const learnerRaw = users.filter((u) => isLearnerRole(u.role));
  const userHits = filterByQuery(learnerRaw, trimmed, userSearchText).map((u) => transformSearchUserHit(u, tenant));
  const results: SearchResultHit[] = [...courseHits, ...userHits];

  return {
    query: trimmed,
    courses: courseHits,
    users: userHits,
    results,
    courseCount: courseHits.length,
    userCount: userHits.length,
    hasQuery: trimmed.length > 0,
    isEmpty: trimmed.length > 0 && results.length === 0,
  };
}

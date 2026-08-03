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
}

export interface SearchCourseHit {
  id: string;
  title: string;
  href: string;
}

export interface SearchUserHit {
  id: string;
  label: string;
  email: string;
}

export interface SearchViewModel {
  query: string;
  courses: SearchCourseHit[];
  users: SearchUserHit[];
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

export function transformSearchCourseHit(course: SearchCourseRaw, tenant: string): SearchCourseHit {
  return {
    id: course.id,
    title: course.title ?? 'Untitled course',
    href: `/courses/${course.id}?tenant=${encodeURIComponent(tenant)}`,
  };
}

export function transformSearchUserHit(user: SearchUserRaw): SearchUserHit {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  const email = user.email ?? '';
  return {
    id: user.id,
    email,
    label: name || email || user.id,
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
  const userHits = filterByQuery(users, trimmed, userSearchText).map(transformSearchUserHit);

  return {
    query: trimmed,
    courses: courseHits,
    users: userHits,
    courseCount: courseHits.length,
    userCount: userHits.length,
    hasQuery: trimmed.length > 0,
    isEmpty: trimmed.length > 0 && courseHits.length === 0 && userHits.length === 0,
  };
}

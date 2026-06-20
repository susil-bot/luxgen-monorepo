import type { GetServerSidePropsContext } from 'next';

import { getTenantFromHost } from './tenant';

/** Resolve tenant subdomain from request host (demo.localhost → demo). */
export function resolveTenantSubdomainFromRequest(host: string | undefined): string {
  const hostname = (host ?? 'localhost').split(':')[0];
  const subdomain = getTenantFromHost(hostname);
  return subdomain === 'default' ? 'demo' : subdomain;
}

export function learnStoreServerProps(context: GetServerSidePropsContext) {
  const tenantSubdomain = resolveTenantSubdomainFromRequest(context.req.headers.host);
  return {
    props: {
      tenantSubdomain,
    },
  };
}

export interface LearnCourse {
  id: string;
  title: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export function filterPublishedCourses(courses: LearnCourse[]): LearnCourse[] {
  return courses.filter((c) => c.status === 'PUBLISHED');
}

export function formatInstructorName(course: LearnCourse): string | null {
  if (!course.instructor) return null;
  return `${course.instructor.firstName} ${course.instructor.lastName}`.trim();
}

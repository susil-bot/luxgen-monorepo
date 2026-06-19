import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { AppLayout, getDefaultSidebarSections, getDefaultLogo, TenantDebug } from '@luxgen/ui';
import { TenantBanner } from '../components/tenant/TenantBanner';
import { PageLoadingState, PageEmptyState } from '../components/common/PageStates';
import { createHandleUserAction } from '../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../lib/app-layout-user';
import { getStoredUser } from '../lib/session';
import { GET_COURSES } from '../graphql/queries/courses';
import {
  type GraphQLCourse,
  enrolledCount,
  formatStatusLabel,
  instructorName,
  statusBadgeClass,
} from '../lib/course-display';

interface CoursesPageProps {
  tenant: string;
}

export default function CoursesPage({ tenant }: CoursesPageProps) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const layoutUser = useLayoutUser();
  const tenantId = useAppTenantId();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id ?? tenant;

  const { data, loading, error } = useQuery(GET_COURSES, {
    variables: { tenantId: queryTenantId },
    skip: !queryTenantId,
    fetchPolicy: 'cache-and-network',
  });

  const courses: GraphQLCourse[] = data?.courses ?? [];

  return (
    <>
      <Head>
        <title>Courses - {tenant.charAt(0).toUpperCase() + tenant.slice(1)}</title>
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={layoutUser ?? undefined}
        logo={getDefaultLogo()}
        onUserAction={handleUserAction}
        showSearch={true}
        showNotifications={true}
        notificationCount={0}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <TenantBanner tenant={tenant} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-2">
          <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="ios-large-title">Courses</h1>
              <p className="mt-1 text-secondary text-sm">Browse and manage learning content</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="ios-btn-primary" onClick={() => router.push('/courses/create')}>
                + Create Course
              </button>
              <button type="button" className="ios-btn-secondary" onClick={() => router.push('/courses/analytics')}>
                Analytics
              </button>
            </div>
          </div>

          {loading && courses.length === 0 && (
            <PageLoadingState label="Loading courses…" fullScreen={false} />
          )}

          {error && courses.length === 0 && (
            <PageEmptyState
              icon="⚠️"
              title="Could not load courses"
              subtitle={error.message}
              action={
                <button type="button" className="ios-btn-primary mt-4" onClick={() => router.push('/login')}>
                  Sign in
                </button>
              }
            />
          )}

          {!loading && !error && courses.length === 0 && (
            <PageEmptyState
              icon="📚"
              title="No courses yet"
              subtitle="Create your first course to start enrolling learners."
              action={
                <button type="button" className="ios-btn-primary mt-4" onClick={() => router.push('/courses/create')}>
                  Create course
                </button>
              }
            />
          )}

          {courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="ios-card p-5 transition-all duration-200 hover:shadow-md"
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="ios-avatar ios-avatar-md" style={{ borderRadius: 'var(--radius-lg)' }}>
                      {course.title.charAt(0)}
                    </div>
                    <span className={`badge ${statusBadgeClass(course.status)}`}>
                      {formatStatusLabel(course.status)}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-primary mb-1">{course.title}</h3>
                  <p className="text-sm text-secondary mb-2 line-clamp-2">
                    {course.description || 'No description'}
                  </p>
                  <p className="text-xs text-secondary mb-4">{instructorName(course)}</p>

                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid var(--color-separator)' }}
                  >
                    <span className="text-xs text-secondary">{enrolledCount(course)} enrolled</span>
                    <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => router.push(`/courses/${course.id}/edit`)}
                        className="ios-btn-plain text-sm py-1 px-2"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/courses/${course.id}`)}
                        className="ios-btn-plain text-sm py-1 px-2"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <TenantDebug />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (context: { req: { headers: { host?: string } }; query: { tenant?: string } }) => {
  const host = context.req.headers.host;
  let tenant = 'demo';

  if (host && host.includes('.')) {
    const parts = host.split('.');
    if (parts.length > 1) {
      const subdomain = parts[0];
      if (subdomain !== 'www' && subdomain !== 'localhost' && subdomain !== '127.0.0.1') {
        tenant = subdomain;
      }
    }
  }

  if (context.query.tenant) {
    tenant = context.query.tenant;
  }

  return { props: { tenant } };
};

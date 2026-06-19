import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import {
  AppLayout,
  getDefaultSidebarSections,
  getDefaultLogo,
  TenantDebug,
  CourseDetailMenu,
  CourseOverview,
  CourseAnalytics,
} from '@luxgen/ui';
import { TenantBanner } from '../../components/tenant/TenantBanner';
import { PageLoadingState, PageEmptyState } from '../../components/common/PageStates';
import { createHandleUserAction } from '../../lib/user-actions';
import { useLayoutUser } from '../../lib/app-layout-user';
import { getStoredUser } from '../../lib/session';
import { GET_COURSE } from '../../graphql/queries/courses';
import { mapApiRoleToUiRole, toCourseOverviewProps, enrolledCount, instructorName, formatCourseDuration } from '../../lib/course-display';

interface CoursePageProps {
  tenant: string;
}

export default function CoursePage({ tenant }: CoursePageProps) {
  const router = useRouter();
  const { id } = router.query;
  const courseId = typeof id === 'string' ? id : '';
  const layoutUser = useLayoutUser();
  const handleUserAction = createHandleUserAction(router);
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const userRole = mapApiRoleToUiRole(sessionUser?.role);

  const { data, loading, error } = useQuery(GET_COURSE, {
    variables: { id: courseId },
    skip: !courseId,
    fetchPolicy: 'cache-and-network',
  });

  const course = data?.course;
  const currentPath = router.asPath;

  if (!courseId || (loading && !course)) {
    return <PageLoadingState label="Loading course…" />;
  }

  if (error || !course) {
    return (
      <PageEmptyState
        icon="📚"
        title="Course not found"
        subtitle={error?.message ?? 'This course may have been removed.'}
        action={
          <button type="button" className="ios-btn-primary mt-4" onClick={() => router.push('/courses')}>
            Back to courses
          </button>
        }
      />
    );
  }

  const overviewCourse = toCourseOverviewProps(course);
  const isEnrolled = course.students?.some((s: { id: string }) => s.id === sessionUser?.id) ?? false;
  const enrollmentStatus = isEnrolled ? ('enrolled' as const) : ('not_enrolled' as const);

  const analyticsMetrics = {
    totalEnrollments: enrolledCount(course),
    completionRate: course.status === 'COMPLETED' ? 100 : 0,
    averageRating: 0,
    engagementScore: Math.min(100, enrolledCount(course) * 10),
  };

  return (
    <>
      <Head>
        <title>
          {course.title} - {tenant.charAt(0).toUpperCase() + tenant.slice(1)}
        </title>
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
          <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="ios-large-title">{course.title}</h1>
              <p className="mt-1 text-secondary text-sm">
                {instructorName(course)} · {formatCourseDuration(course.startDate, course.endDate)}
              </p>
            </div>
            <button type="button" className="ios-btn-secondary" onClick={() => router.push(`/courses/${courseId}/edit`)}>
              Edit course
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="ios-metric-tile">
              <span className="metric-label">Enrolled</span>
              <span className="metric-value">{enrolledCount(course)}</span>
            </div>
            <div className="ios-metric-tile">
              <span className="metric-label">Status</span>
              <span className="metric-value">{course.status ?? 'DRAFT'}</span>
            </div>
            <div className="ios-metric-tile">
              <span className="metric-label">Instructor</span>
              <span className="metric-value text-lg">{course.instructor?.firstName ?? '—'}</span>
            </div>
          </div>

          <div className="space-y-8">
            <CourseOverview course={overviewCourse} userRole={userRole} enrollmentStatus={enrollmentStatus} />

            {(userRole === 'admin' || userRole === 'instructor') && (
              <CourseAnalytics courseId={course.id} userRole={userRole} metrics={analyticsMetrics} />
            )}

            <CourseDetailMenu
              courseId={course.id}
              userRole={userRole}
              currentPath={currentPath}
              onNavigate={(path) => void router.push(path)}
            />
          </div>
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

import Head from 'next/head';
import Link from 'next/link';
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
import { GET_COURSE } from '../../graphql/queries/courses';
import { mapCourseToOverview, roleFromSession } from '../../lib/course-display';
import { getTenantPageProps } from '../../lib/tenant-page-props';
import { useAppLayoutHeader } from '../../lib/app-layout-header';
export default function CoursePage({ tenant }: { tenant: string }) {
  const router = useRouter();
  const courseId = typeof router.query.id === 'string' ? router.query.id : '';
  const layoutUser = useLayoutUser();
  const headerProps = useAppLayoutHeader();
  const userRole = roleFromSession(layoutUser?.role);
  const { data, loading, error } = useQuery(GET_COURSE, {
    variables: { id: courseId },
    skip: !courseId,
    fetchPolicy: 'cache-and-network',
  });
  const node = data?.course;
  const course = node ? mapCourseToOverview(node) : null;
  if (!courseId || (loading && !course)) return <PageLoadingState label="Loading course…" />;
  if (error || !course)
    return (
      <PageEmptyState
        icon="📚"
        title="Course not found"
        subtitle="This course does not exist."
        action={
          <Link href="/courses" className="ios-btn-primary mt-4 inline-block">
            Back
          </Link>
        }
      />
    );
  return (
    <>
      <Head>
        <title>{course.title}</title>
      </Head>
      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={layoutUser ?? undefined}
        logo={getDefaultLogo()}
        onUserAction={createHandleUserAction(router)}
        {...headerProps}
        responsive
      >
        <TenantBanner tenant={tenant} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="ios-large-title">{course.title}</h1>
          <CourseOverview course={course} userRole={userRole} enrollmentStatus="enrolled" />
          {(userRole === 'admin' || userRole === 'instructor') && (
            <CourseAnalytics
              courseId={course.id}
              userRole={userRole}
              metrics={{
                totalEnrollments: node?.students?.length ?? 0,
                completionRate: 0,
                averageRating: 0,
                engagementScore: 0,
              }}
            />
          )}
          <CourseDetailMenu
            courseId={course.id}
            userRole={userRole}
            currentPath={router.asPath}
            onNavigate={(p) => void router.push(p)}
          />
        </div>
        <TenantDebug />
      </AppLayout>
    </>
  );
}
export const getServerSideProps = getTenantPageProps;

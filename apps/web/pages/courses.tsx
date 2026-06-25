import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { AppLayout, getDefaultSidebarSections, getDefaultLogo, TenantDebug, CourseOverview } from '@luxgen/ui';
import { TenantBanner } from '../components/tenant/TenantBanner';
import { PageLoadingState } from '../components/common/PageStates';
import { createHandleUserAction } from '../lib/user-actions';
import { useLayoutUser, useAppTenantId } from '../lib/app-layout-user';
import { getStoredUser } from '../lib/session';
import { GET_COURSES } from '../graphql/queries/courses';
import { mapCourseToOverview, roleFromSession } from '../lib/course-display';
import { getTenantPageProps } from '../lib/tenant-page-props';
import { useAppLayoutHeader } from '../lib/app-layout-header';
import { isMongoObjectId } from '../lib/mongo-id';
export default function CoursesPage({ tenant }: { tenant: string }) {
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const tenantId = useAppTenantId();
  const headerProps = useAppLayoutHeader();
  const sessionUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const queryTenantId = tenantId ?? sessionUser?.tenant.id;
  const userRole = roleFromSession(layoutUser?.role);
  const { data, loading, error } = useQuery(GET_COURSES, {
    variables: { tenantId: queryTenantId },
    skip: !isMongoObjectId(queryTenantId),
    fetchPolicy: 'cache-and-network',
  });
  const courses = data?.courses ?? [];
  if (loading && !courses.length) return <PageLoadingState label="Loading courses…" />;
  return (
    <>
      <Head>
        <title>Courses - {tenant}</title>
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
          <h1 className="ios-large-title">Courses</h1>
          {error && <p style={{ color: 'var(--color-red)' }}>{error.message}</p>}
          {!courses.length && !loading ? (
            <p>No courses yet.</p>
          ) : (
            courses.map((c) => (
              <div key={c.id} className="mb-6">
                <Link href={`/courses/${c.id}`}>
                  <CourseOverview course={mapCourseToOverview(c)} userRole={userRole} enrollmentStatus="not_enrolled" />
                </Link>
              </div>
            ))
          )}
        </div>
        <TenantDebug />
      </AppLayout>
    </>
  );
}
export const getServerSideProps = getTenantPageProps;

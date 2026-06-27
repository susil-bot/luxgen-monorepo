import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AppLayout,
  TenantDebug,
  CourseMenu,
  CourseOverview,
  CourseAnalytics,
} from '@luxgen/ui';
import { TenantBanner } from '../components/tenant/TenantBanner';
import { getTenantPageProps } from '../lib/tenant-page-props';
import { PageLoadingState, PageEmptyState } from '../components/common/PageStates';
import { useLayoutUser } from '../lib/app-layout-user';
import { useAppShellConfig } from '../lib/app-shell-config';
import { createHandleUserAction } from '../lib/user-actions';

interface CoursesPageProps {
  tenant: string;
}

export default function CoursesPage({ tenant }: CoursesPageProps) {
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const { sidebarSections, logo } = useAppShellConfig();
  const handleUserAction = createHandleUserAction(router);
  const [userRole, setUserRole] = useState<'admin' | 'instructor' | 'learner' | 'user'>('learner');
  const [loading, setLoading] = useState(true);

  const [sampleCourse] = useState({
    id: 'course-1',
    title: 'Advanced React Development',
    description: 'Master modern React patterns and best practices',
    instructor: 'John Doe',
    duration: '8 weeks',
    level: 'Intermediate',
    rating: 4.8,
    enrolledCount: 1250,
    thumbnail: '/images/course-thumbnail.jpg',
  });
  const [catalogCourses] = useState<unknown[]>([]);

  const [analyticsMetrics] = useState({
    totalEnrollments: 1250,
    completionRate: 78,
    averageRating: 4.8,
    engagementScore: 85,
  });

  useEffect(() => {
    const role = tenant === 'demo' ? 'admin' : 'learner';
    setUserRole(role);
    setLoading(false);
  }, [tenant]);

  const handleNavigate = (path: string) => {
    void router.push(path);
  };

  if (loading) {
    return <PageLoadingState label="Loading courses…" />;
  }

  return (
    <>
      <Head>
        <title>Courses - {tenant.charAt(0).toUpperCase() + tenant.slice(1)}</title>
      </Head>

      <AppLayout
        sidebarSections={sidebarSections}
        user={layoutUser ?? undefined}
        logo={logo}
        onUserAction={handleUserAction}
        showSearch={true}
        showNotifications={true}
        notificationCount={3}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <TenantBanner tenant={tenant} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-2">
          <div className="mb-8">
            <h1 className="ios-large-title">Courses</h1>
            <p className="mt-1 text-secondary text-sm">Browse and manage learning content</p>
          </div>
          <div className="space-y-8">
            {catalogCourses.length === 0 && (
              <PageEmptyState
                icon="📚"
                title="No courses yet"
                subtitle="Create your first course or browse the learn catalog."
                action={
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <Link href="/courses/create" className="ios-btn-primary text-sm">
                      Create course
                    </Link>
                    <Link href="/learn" className="ios-btn-secondary text-sm">
                      Browse catalog
                    </Link>
                  </div>
                }
              />
            )}
            <CourseOverview course={sampleCourse} userRole={userRole} enrollmentStatus="enrolled" />

            {(userRole === 'admin' || userRole === 'instructor') && (
              <CourseAnalytics courseId={sampleCourse.id} userRole={userRole} metrics={analyticsMetrics} />
            )}

            <CourseMenu userRole={userRole} courseId={sampleCourse.id} onNavigate={handleNavigate} />
          </div>
        </div>

        <TenantDebug />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = getTenantPageProps;

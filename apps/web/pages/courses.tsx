import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  AppLayout,
  getDefaultSidebarSections,
  getDefaultUser,
  getDefaultLogo,
  TenantDebug,
  CourseMenu,
  CourseOverview,
  CourseAnalytics,
} from '@luxgen/ui';
import { TenantBanner } from '../components/tenant/TenantBanner';
import { PageLoadingState } from '../components/common/PageStates';
import { createHandleUserAction } from '../lib/user-actions';

interface CoursesPageProps {
  tenant: string;
}

export default function CoursesPage({ tenant }: CoursesPageProps) {
  const router = useRouter();
  const handleUserAction = createHandleUserAction(router);
  const [userRole, setUserRole] = useState<'admin' | 'instructor' | 'learner' | 'user'>('learner');
  const [loading, setLoading] = useState(true);

  // Mock course data
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

  const [analyticsMetrics] = useState({
    totalEnrollments: 1250,
    completionRate: 78,
    averageRating: 4.8,
    engagementScore: 85,
  });

  useEffect(() => {
    // Simulate role detection
    const role = tenant === 'demo' ? 'admin' : 'learner';
    setUserRole(role);
    setLoading(false);
  }, [tenant]);

  const handleNavigate = (path: string) => {
    void router.push(path);
    // Implement navigation logic
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
        sidebarSections={getDefaultSidebarSections()}
        user={getDefaultUser()}
        logo={getDefaultLogo()}
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
            {/* Course Overview */}
            <CourseOverview course={sampleCourse} userRole={userRole} enrollmentStatus="enrolled" />

            {/* Course Analytics (Admin/Instructor only) */}
            {(userRole === 'admin' || userRole === 'instructor') && (
              <CourseAnalytics courseId={sampleCourse.id} userRole={userRole} metrics={analyticsMetrics} />
            )}

            {/* Course Menu */}
            <CourseMenu userRole={userRole} courseId={sampleCourse.id} onNavigate={handleNavigate} />
          </div>
        </div>

        <TenantDebug />
      </AppLayout>
    </>
  );
}

export const getServerSideProps = async (context: any) => {
  const host = context.req.headers.host;
  let tenant = 'demo'; // Default tenant

  // Extract tenant from subdomain
  if (host && host.includes('.')) {
    const parts = host.split('.');
    if (parts.length > 1) {
      const subdomain = parts[0];
      if (subdomain !== 'www' && subdomain !== 'localhost' && subdomain !== '127.0.0.1') {
        tenant = subdomain;
      }
    }
  }

  // Check query parameter as fallback
  if (context.query.tenant) {
    tenant = context.query.tenant;
  }

  return {
    props: {
      tenant,
    },
  };
};

import { useState, useEffect } from 'react';
import { CourseMenu, CourseOverview, CourseAnalytics } from '@luxgen/ui';
import CourseLayout from './courses/_layout';

interface CoursesPageProps {
  tenant: string;
}

function CoursesContent({ tenant }: CoursesPageProps) {
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
    thumbnail: '/images/course-thumbnail.jpg'
  });

  const [analyticsMetrics] = useState({
    totalEnrollments: 1250,
    completionRate: 78,
    averageRating: 4.8,
    engagementScore: 85
  });

  useEffect(() => {
    // Simulate role detection
    const role = tenant === 'demo' ? 'admin' : 'learner';
    setUserRole(role);
    setLoading(false);
  }, [tenant]);

  const handleNavigate = (path: string) => {
    console.log('Navigate to:', path);
    // Implement navigation logic
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Course Overview */}
      <CourseOverview
        course={sampleCourse}
        userRole={userRole}
        enrollmentStatus="enrolled"
      />

      {/* Course Analytics (Admin/Instructor only) */}
      {(userRole === 'admin' || userRole === 'instructor') && (
        <CourseAnalytics
          courseId={sampleCourse.id}
          userRole={userRole}
          metrics={analyticsMetrics}
        />
      )}

      {/* Course Menu */}
      <CourseMenu
        userRole={userRole}
        courseId={sampleCourse.id}
        onNavigate={handleNavigate}
      />
    </div>
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
      tenant
    }
  };
};

export default function CoursesPage({ tenant }: CoursesPageProps) {
  return (
    <CourseLayout tenant={tenant} title="Courses">
      <CoursesContent tenant={tenant} />
    </CourseLayout>
  );
}

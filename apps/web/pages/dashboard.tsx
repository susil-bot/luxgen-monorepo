import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AdminDashboardLayout, UserMenu, TenantDebug } from '@luxgen/ui';
import { TenantBanner } from '../components/tenant/TenantBanner';

interface DashboardProps {
  tenant: string;
}

export default function Dashboard({ tenant }: DashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserMenu | null>(() => {
    // Initialize user data immediately to avoid loading state
    return {
      name: `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} User`,
      email: `user@${tenant}.com`,
      role: 'Admin',
      tenant: {
        name: `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} Company`,
        subdomain: tenant,
      },
    };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🔍 Dashboard useEffect running for tenant:', tenant);
    // Use hardcoded user data for now to avoid API issues
    const userData: UserMenu = {
      name: `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} User`,
      email: `user@${tenant}.com`,
      role: 'Admin',
      tenant: {
        name: `${tenant.charAt(0).toUpperCase() + tenant.slice(1)} Company`,
        subdomain: tenant,
      },
    };
    console.log('🔍 Setting user data:', userData);
    setUser(userData);
    setLoading(false);
    console.log('🔍 Loading set to false');
  }, [tenant]);

  const handleUserAction = (action: 'profile' | 'settings' | 'logout') => {
    switch (action) {
      case 'profile':
        router.push('/profile');
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'logout':
        router.push('/login');
        break;
    }
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // Implement search functionality
  };

  const handleNotificationClick = () => {
    console.log('Notification clicked');
    // Implement notification functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Dashboard data - sample data to show components
  const dashboardData = {
    title: 'Welcome to Ideavibes',
    subtitle: 'Your learning management dashboard',
    stats: {
      totalCourses: 12,
      activeStudents: 156,
      completionRate: 87,
      totalUsers: 1200
    },
    retentionData: [
      { date: 'Jan', value: 400, label: 'January' },
      { date: 'Feb', value: 450, label: 'February' },
      { date: 'Mar', value: 500, label: 'March' },
      { date: 'Apr', value: 480, label: 'April' },
      { date: 'May', value: 550, label: 'May' }
    ],
    engagementData: [
      { id: '1', label: 'Quizzes', value: 30, color: '#3B82F6', percentage: 30 },
      { id: '2', label: 'Surveys', value: 15, color: '#10B981', percentage: 15 },
      { id: '3', label: 'Polls', value: 35, color: '#8B5CF6', percentage: 35 },
      { id: '4', label: 'Videos', value: 20, color: '#F59E0B', percentage: 20 }
    ],
    trendsData: [
      { label: 'Week 1', interactions: 120, completions: 45 },
      { label: 'Week 2', interactions: 150, completions: 60 },
      { label: 'Week 3', interactions: 180, completions: 75 },
      { label: 'Week 4', interactions: 200, completions: 90 }
    ],
    activitiesData: [
      {
        id: '1',
        user: { name: 'John Doe', avatar: '/avatars/john.jpg', initials: 'JD' },
        action: 'Completed React Course',
        time: '2 hours ago',
        status: 'online' as const,
        avatarColor: '#3B82F6'
      },
      {
        id: '2',
        user: { name: 'Jane Smith', avatar: '/avatars/jane.jpg', initials: 'JS' },
        action: 'Started TypeScript Course',
        time: '4 hours ago',
        status: 'offline' as const,
        avatarColor: '#10B981'
      },
      {
        id: '3',
        user: { name: 'Mike Johnson', avatar: '/avatars/mike.jpg', initials: 'MJ' },
        action: 'Completed Quiz: JavaScript Fundamentals',
        time: '6 hours ago',
        status: 'online' as const,
        avatarColor: '#8B5CF6'
      }
    ],
    surveyData: {
      id: '1',
      title: 'Q1 2024 Employee Survey',
      status: 'active' as const,
      progress: 75,
      totalResponses: 150,
      targetResponses: 200,
      createdAt: '2024-01-15',
      expiresAt: '2024-02-15',
      description: 'Quarterly employee satisfaction and feedback survey'
    },
    permissionData: [
      {
        id: '1',
        user: { name: 'Alice Brown', email: 'alice@example.com', initials: 'AB' },
        permission: 'admin',
        resource: 'User Management',
        requestedAt: '2024-01-20',
        reason: 'Need to manage user accounts',
        status: 'pending' as const,
        avatarColor: '#3B82F6'
      },
      {
        id: '2',
        user: { name: 'Bob Wilson', email: 'bob@example.com', initials: 'BW' },
        permission: 'instructor',
        resource: 'Course Creation',
        requestedAt: '2024-01-19',
        reason: 'Want to create new courses',
        status: 'approved' as const,
        avatarColor: '#10B981'
      }
    ],
    quickActions: [
      { 
        id: '1', 
        label: 'Create Survey', 
        onClick: () => console.log('Create Survey clicked'),
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      },
      { 
        id: '2', 
        label: 'View Reports', 
        onClick: () => console.log('View Reports clicked'),
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      },
      { 
        id: '3', 
        label: 'Manage Users', 
        onClick: () => console.log('Manage Users clicked'),
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        )
      }
    ]
  };

  return (
    <>
      <Head>
        <title>Dashboard - LuxGen</title>
        <meta name="description" content="Dashboard for LuxGen platform" />
      </Head>

      <AdminDashboardLayout
        currentTenant={{
          name: tenant.charAt(0).toUpperCase() + tenant.slice(1),
          subdomain: tenant,
          logo: `/logos/${tenant}.png`
        }}
        user={user ? {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          initials: user.name?.split(' ').map(n => n[0]).join('') || 'U',
          role: user.role || 'Admin'
        } : undefined}
        dashboardData={dashboardData}
        variant="default"
        loading={loading}
        onUserAction={handleUserAction}
        onSearch={handleSearch}
        onNotificationClick={handleNotificationClick}
        showSearch={true}
        showNotifications={true}
        notificationCount={3}
        searchPlaceholder="Search dashboard..."
        sidebarCollapsible={true}
        sidebarDefaultCollapsed={false}
        responsive={true}
        onRetentionPointClick={(point) => console.log('Retention point clicked:', point)}
        onEngagementSegmentClick={(segment) => console.log('Engagement segment clicked:', segment)}
        onTrendsPointClick={(point) => console.log('Trends point clicked:', point)}
        onActivityClick={(activity) => console.log('Activity clicked:', activity)}
        onSurveyView={(survey) => console.log('Survey view:', survey)}
        onSurveyEdit={(survey) => console.log('Survey edit:', survey)}
        onSurveyShare={(survey) => console.log('Survey share:', survey)}
        onPermissionApprove={(request) => console.log('Permission approved:', request)}
        onPermissionDeny={(request) => console.log('Permission denied:', request)}
        onPermissionViewDetails={(request) => console.log('Permission details:', request)}
      />
      <TenantDebug />
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
  
  // Check for tenant query parameter
  const queryTenant = context.query.tenant;
  if (queryTenant) {
    tenant = queryTenant;
  }

  return {
    props: {
      tenant,
    },
  };
};
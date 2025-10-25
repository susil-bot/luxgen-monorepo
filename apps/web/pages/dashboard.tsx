import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useQuery } from '@apollo/client';
import { AdminDashboardLayout, UserMenu, TenantDebug } from '@luxgen/ui';
import { TenantBanner } from '../components/tenant/TenantBanner';
import { GET_DASHBOARD_DATA } from '../graphql/queries/dashboard';

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

  // GraphQL query for dashboard data
  const { data: dashboardData, loading: dataLoading, error: dataError } = useQuery(GET_DASHBOARD_DATA, {
    variables: { tenant },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

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

  const handleDashboardAction = (action: string, data?: any) => {
    console.log('Dashboard action:', action, data);
    // Handle dashboard-specific actions
  };

  // Show loading state
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (dataError) {
    console.error('GraphQL Error:', dataError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading dashboard data</div>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  // Transform GraphQL data for dashboard components
  const transformedDashboardData = dashboardData ? {
    title: `Welcome to ${tenant.charAt(0).toUpperCase() + tenant.slice(1)}`,
    subtitle: 'Your learning management dashboard',
    stats: {
      totalCourses: dashboardData.getDashboardData?.stats?.totalCourses || 0,
      activeStudents: dashboardData.getDashboardData?.stats?.activeStudents || 0,
      completionRate: dashboardData.getDashboardData?.stats?.completionRate || 0,
      totalUsers: dashboardData.getDashboardData?.stats?.totalGroups || 0
    },
    retentionData: dashboardData.getDashboardData?.userRetention?.map((item: any) => ({
      date: item.period,
      value: item.retention,
      label: new Date(item.period).toLocaleDateString('en-US', { month: 'short' })
    })) || [],
    engagementData: dashboardData.getDashboardData?.engagementBreakdown?.map((item: any) => ({
      id: item.category.toLowerCase().replace(/\s+/g, '-'),
      label: item.category,
      value: item.value,
      color: item.color,
      percentage: item.value
    })) || [],
    trendsData: dashboardData.getDashboardData?.engagementTrends?.map((item: any) => ({
      label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      interactions: item.activeUsers,
      completions: item.completedCourses
    })) || [],
    activitiesData: dashboardData.getDashboardData?.recentActivities?.map((activity: any) => ({
      id: activity.id,
      user: { 
        name: activity.user, 
        avatar: activity.userAvatar, 
        initials: activity.user.split(' ').map((n: string) => n[0]).join('')
      },
      action: activity.title,
      time: new Date(activity.timestamp).toLocaleString(),
      status: activity.status === 'completed' ? 'online' : 'offline',
      avatarColor: '#3B82F6'
    })) || [],
    surveyData: dashboardData.getDashboardData?.lastSurvey ? {
      id: dashboardData.getDashboardData.lastSurvey.id,
      title: dashboardData.getDashboardData.lastSurvey.title,
      description: dashboardData.getDashboardData.lastSurvey.description,
      status: dashboardData.getDashboardData.lastSurvey.status,
      progress: dashboardData.getDashboardData.lastSurvey.progress,
      totalResponses: dashboardData.getDashboardData.lastSurvey.responses,
      targetResponses: Math.floor(dashboardData.getDashboardData.lastSurvey.responses * 1.3),
      createdAt: dashboardData.getDashboardData.lastSurvey.createdAt,
      expiresAt: dashboardData.getDashboardData.lastSurvey.expiresAt
    } : undefined,
    permissionRequests: dashboardData.getDashboardData?.permissionRequests?.map((request: any) => ({
      id: request.id,
      user: { 
        name: request.user, 
        avatar: request.userAvatar, 
        initials: request.user.split(' ').map((n: string) => n[0]).join('')
      },
      requestType: request.requestType,
      description: request.description,
      status: request.status,
      requestedAt: request.requestedAt,
      avatarColor: '#3B82F6'
    })) || [],
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
        label: 'Add User', 
        onClick: () => console.log('Add User clicked'),
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        )
      },
      { 
        id: '3', 
        label: 'View Reports', 
        onClick: () => console.log('View Reports clicked'),
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      }
    ]
  } : null;

  if (!transformedDashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">No dashboard data available</div>
          <p className="text-gray-500">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - {tenant.charAt(0).toUpperCase() + tenant.slice(1)}</title>
        <meta name="description" content="Learning management dashboard" />
      </Head>
      
      <AdminDashboardLayout
        currentTenant={tenant}
        user={user ? {
          name: user.name,
          email: user.email,
          role: user.role,
          initials: user.name.split(' ').map(n => n[0]).join('')
        } : undefined}
        dashboardData={transformedDashboardData}
        variant="default"
        loading={dataLoading}
        onUserAction={handleUserAction}
        onDashboardAction={handleDashboardAction}
        onDataPointClick={(point: any) => console.log('Data point clicked:', point)}
        onSegmentClick={(segment: any) => console.log('Segment clicked:', segment)}
        onActivityClick={(activity: any) => console.log('Activity clicked:', activity)}
        onSurveyClick={(survey: any) => console.log('Survey clicked:', survey)}
        onRequestClick={(request: any) => console.log('Request clicked:', request)}
        onViewSurvey={(survey: any) => console.log('View survey:', survey)}
        onEditSurvey={(survey: any) => console.log('Edit survey:', survey)}
        onShareSurvey={(survey: any) => console.log('Share survey:', survey)}
        onApproveRequest={(request: any) => console.log('Approve request:', request)}
        onDenyRequest={(request: any) => console.log('Deny request:', request)}
        onViewDetails={(request: any) => console.log('View details:', request)}
      />
      
    </>
  );
}

export async function getServerSideProps(context: any) {
  const { tenant } = context.query;
  
  return {
    props: {
      tenant: tenant || 'demo',
    },
  };
}
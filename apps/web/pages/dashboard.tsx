import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useQuery } from '@apollo/client';
import { AdminDashboardLayout, UserMenu, TenantDebug } from '@luxgen/ui';
import { TenantBanner } from '../components/tenant/TenantBanner';
import { GET_DASHBOARD_DATA } from '../graphql/queries/dashboard';
import { 
  transformDashboardData, 
  transformUserData, 
  handleDashboardAction, 
  handleUserAction 
} from '../lib/transformer';

interface DashboardProps {
  tenant: string;
}

export default function Dashboard({ tenant }: DashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserMenu | null>(() => transformUserData(tenant));

  // GraphQL query for dashboard data with error handling
  const { data: dashboardData, loading: dataLoading, error: dataError } = useQuery(GET_DASHBOARD_DATA, {
    variables: { tenant },
    errorPolicy: 'ignore', // Ignore GraphQL errors and continue
    fetchPolicy: 'cache-first',
    skip: false, // Enable GraphQL queries now that API is working
  });

  useEffect(() => {
    console.log('🔍 Dashboard useEffect running for tenant:', tenant);
    const userData = transformUserData(tenant);
    console.log('🔍 Setting user data:', userData);
    setUser(userData);
    console.log('🔍 Loading set to false');
  }, [tenant]);

  // Use transformer functions for action handling
  const onUserAction = (action: 'profile' | 'settings' | 'logout') => {
    handleUserAction(action, router);
  };

  const onDashboardAction = (action: string, data?: any) => {
    handleDashboardAction(action, data);
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

  // Log GraphQL errors but don't block the UI
  if (dataError) {
    console.warn('GraphQL Error (continuing with default data):', dataError);
  }
  
  // Transform data using the transformer
  const transformedDashboardData = transformDashboardData(dashboardData, tenant);

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
        currentTenant={{
          name: tenant.charAt(0).toUpperCase() + tenant.slice(1),
          subdomain: tenant
        }}
        user={user ? {
          name: user.name,
          email: user.email,
          role: user.role || 'User',
          initials: user.name.split(' ').map(n => n[0]).join('')
        } : undefined}
        bannerCarousel={{
          banners: [
            {
              id: '1',
              title: 'Welcome to Ideavibes',
              description: 'Your learning management dashboard',
              image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
              buttonText: 'Get Started'
            },
            {
              id: '2',
              title: 'Explore New Courses',
              description: 'Discover our latest learning content and enhance your skills',
              image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
              buttonText: 'Browse Courses'
            },
            {
              id: '3',
              title: 'Track Your Progress',
              description: 'Monitor your learning journey and achieve your goals',
              image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
              buttonText: 'View Analytics'
            }
          ],
          autoPlay: true,
          interval: 5000
        }}
        dashboardData={transformedDashboardData}
        variant="default"
        loading={dataLoading}
        onUserAction={onUserAction}
        onDashboardAction={onDashboardAction}
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
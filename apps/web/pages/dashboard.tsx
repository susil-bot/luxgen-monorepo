import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useQuery } from '@apollo/client';
import { AdminDashboardLayout, UserMenu } from '@luxgen/ui';
import { GET_DASHBOARD_DATA } from '../graphql/queries/dashboard';
import {
  transformDashboardData,
  transformUserDataFromSession,
  handleDashboardAction,
  handleUserAction,
} from '../lib/transformer';
import { useAppLayoutHeader } from '../lib/app-layout-header';
import { AUTH_SESSION_CHANGE_EVENT } from '../lib/session';
import { getTenantPageProps } from '../lib/tenant-page-props';
import { useDashboardTenant, useTenantScope } from '../lib/use-tenant-scope';
import { PageEmptyState, PageLoadingState } from '../components/common/PageStates';

interface DashboardProps {
  tenant: string;
}

export default function Dashboard({ tenant }: DashboardProps) {
  const router = useRouter();
  const headerProps = useAppLayoutHeader();
  const [user, setUser] = useState<UserMenu | null>(null);
  const dashboardTenant = useDashboardTenant(tenant);
  const { subdomain } = useTenantScope(tenant);
  const displayName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);

  const {
    data: dashboardData,
    loading: dataLoading,
    error: dataError,
  } = useQuery(GET_DASHBOARD_DATA, {
    variables: { tenant: dashboardTenant },
    skip: !dashboardTenant,
    fetchPolicy: 'cache-first',
  });

  useEffect(() => {
    const refresh = () => setUser(transformUserDataFromSession());
    refresh();
    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [subdomain]);

  const onUserAction = (action: 'profile' | 'settings' | 'logout') => {
    handleUserAction(action, router);
  };

  const onDashboardAction = (action: string, data?: any) => {
    handleDashboardAction(action, data);
  };

  if (dataLoading) {
    return <PageLoadingState label="Loading dashboard…" />;
  }

  if (dataError) {
    return (
      <PageEmptyState
        icon="🔒"
        title="Unable to load dashboard"
        subtitle={dataError.message || 'Check your connection and try again.'}
      />
    );
  }

  const transformedDashboardData = transformDashboardData(dashboardData, subdomain);

  if (!transformedDashboardData) {
    return <PageEmptyState icon="📊" title="No dashboard data" subtitle="Check your connection and try again." />;
  }

  return (
    <>
      <Head>
        <title>Dashboard - {displayName}</title>
        <meta name="description" content="Learning management dashboard" />
      </Head>

      <AdminDashboardLayout
        currentTenant={{
          name: displayName,
          subdomain,
        }}
        user={
          user
            ? {
                name: user.name,
                email: user.email,
                role: user.role || 'User',
                initials: user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join(''),
              }
            : undefined
        }
        bannerCarousel={{
          banners: [
            {
              id: '1',
              title: `Welcome to ${displayName}`,
              description: 'Your learning management dashboard',
              image:
                'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
              buttonText: 'Get Started',
            },
            {
              id: '2',
              title: 'Explore New Courses',
              description: 'Discover our latest learning content and enhance your skills',
              image:
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
              buttonText: 'Browse Courses',
            },
            {
              id: '3',
              title: 'Track Your Progress',
              description: 'Monitor your learning journey and achieve your goals',
              image:
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
              buttonText: 'View Analytics',
            },
          ],
          autoPlay: true,
          interval: 5000,
        }}
        dashboardData={transformedDashboardData}
        variant="default"
        loading={dataLoading}
        onUserAction={onUserAction}
        {...headerProps}
        onDashboardAction={onDashboardAction}
        onDataPointClick={() => {}}
        onSegmentClick={() => {}}
        onActivityClick={() => {}}
        onSurveyClick={() => {}}
        onRequestClick={() => {}}
        onViewSurvey={() => {}}
        onEditSurvey={() => {}}
        onShareSurvey={() => {}}
        onApproveRequest={() => {}}
        onDenyRequest={() => {}}
        onViewDetails={() => {}}
      />
    </>
  );
}

export const getServerSideProps = getTenantPageProps;

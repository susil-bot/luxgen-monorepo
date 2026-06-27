import { useRouter } from 'next/router';
import Head from 'next/head';
import { useQuery } from '@apollo/client';
import { AdminDashboardLayout } from '@luxgen/ui';
import { GET_DASHBOARD_DATA } from '../graphql/queries/dashboard';
import { transformDashboardData, handleUserAction } from '../lib/transformer';
import { createDashboardActionHandler } from '../lib/dashboard-actions';
import { useAppLayoutHeader } from '../lib/app-layout-header';
import { useLayoutUser } from '../lib/app-layout-user';
import { getTenantPageProps } from '../lib/tenant-page-props';
import { useDashboardTenant, useTenantScope } from '../lib/use-tenant-scope';
import { PageEmptyState, PageLoadingState } from '../components/common/PageStates';
import { DashboardBanner } from '../components/dashboard/DashboardBanner';
import { OnboardingWizardStep1 } from '../components/onboarding/OnboardingWizardStep1';

interface DashboardProps {
  tenant: string;
}

export default function Dashboard({ tenant }: DashboardProps) {
  const router = useRouter();
  const headerProps = useAppLayoutHeader();
  const layoutUser = useLayoutUser();
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

  const onUserAction = (action: 'profile' | 'settings' | 'logout') => {
    handleUserAction(action, router);
  };

  const onDashboardAction = createDashboardActionHandler(router);

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

      {layoutUser?.name && (
        <p className="max-w-5xl mx-auto px-4 pt-4 text-sm text-secondary" aria-live="polite">
          Welcome back, {layoutUser.name.split(' ')[0]} — here is what is happening today.
        </p>
      )}
      {!dashboardData?.getDashboardData && (
        <div className="max-w-3xl mx-auto px-4 py-3 text-center">
          <p className="text-sm text-secondary">No KPI data yet. Create a course to populate your dashboard.</p>
          <button type="button" className="ios-btn-primary text-sm mt-2" onClick={() => router.push('/courses/create')}>Create course</button>
        </div>
      )}
      <AdminDashboardLayout
        currentTenant={{
          name: displayName,
          subdomain,
        }}
        user={
          layoutUser
            ? {
                name: layoutUser.name,
                email: layoutUser.email,
                role: layoutUser.role || 'User',
                initials: layoutUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join(''),
              }
            : undefined
        }
        bannerSlot={
          <DashboardBanner
            banners={[
              {
                id: '1',
                title: `Welcome to ${displayName}`,
                description: 'Your learning management dashboard',
                image:
                  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
                buttonText: 'Get Started',
              },
              {
                id: '2',
                title: 'Explore New Courses',
                description: 'Discover our latest learning content and enhance your skills',
                image:
                  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                buttonText: 'Browse Courses',
              },
              {
                id: '3',
                title: 'Track Your Progress',
                description: 'Monitor your learning journey and achieve your goals',
                image:
                  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                buttonText: 'View Analytics',
              },
            ]}
            autoPlay
            interval={5000}
          />
        }
        dashboardData={transformedDashboardData}
        variant="default"
        loading={dataLoading}
        onUserAction={onUserAction}
        {...headerProps}
        onDashboardAction={onDashboardAction}
        onboardingSlot={<OnboardingWizardStep1 tenant={tenant} />}
      />
    </>
  );
}

export const getServerSideProps = getTenantPageProps;

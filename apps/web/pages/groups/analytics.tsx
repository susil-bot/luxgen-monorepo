import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { SnackbarProvider, AppLayout, getDefaultUser, getDefaultLogo, getDefaultSidebarSections } from '@luxgen/ui';
import { PlanGate } from '../../components/billing/PlanGate';
import { GET_TENANT_BILLING } from '../../graphql/queries/billing';
import { normalizePlan } from '@luxgen/billing';

const GroupAnalyticsPageContent: React.FC = () => {
  const router = useRouter();
  const tenant = (router.query.tenant as string) || 'demo';
  const [user, setUser] = useState<any>(null);

  const { data: billingData } = useQuery(GET_TENANT_BILLING, {
    variables: { tenantId: tenant },
    errorPolicy: 'ignore',
    skip: !tenant,
  });
  const tenantPlan = normalizePlan(billingData?.tenantBilling?.plan?.toLowerCase?.() ?? 'free');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          name: `${parsedUser.firstName} ${parsedUser.lastName}`,
          email: parsedUser.email,
          role: parsedUser.role,
          tenant: parsedUser.tenant,
        });
      } catch {
        setUser(getDefaultUser());
      }
    } else {
      setUser(getDefaultUser());
    }
  }, []);

  const handleUserAction = (action: 'profile' | 'settings' | 'logout') => {
    switch (action) {
      case 'profile':
        router.push('/profile');
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'logout':
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/login');
        break;
    }
  };

  const stats = [
    {
      label: 'Total Groups',
      value: '12',
      delta: '+2 from last month',
      color: 'var(--color-blue)',
      badge: 'badge-blue',
    },
    {
      label: 'Active Users',
      value: '156',
      delta: '+12 from last week',
      color: 'var(--color-green)',
      badge: 'badge-green',
    },
    {
      label: 'Engagement Rate',
      value: '87%',
      delta: '+5% from last month',
      color: 'var(--color-purple)',
      badge: 'badge-purple',
    },
    {
      label: 'Growth Rate',
      value: '23%',
      delta: '+3% from last quarter',
      color: 'var(--color-orange)',
      badge: 'badge-orange',
    },
  ];

  const topGroups = [
    { name: 'Development Team', score: 95 },
    { name: 'Marketing Team', score: 87 },
    { name: 'Design Team', score: 82 },
  ];

  return (
    <>
      <Head>
        <title>Group Analytics - LuxGen</title>
        <meta name="description" content="View group analytics" />
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={user}
        onUserAction={handleUserAction}
        showSearch={false}
        showNotifications={false}
        logo={getDefaultLogo()}
        sidebarCollapsible={true}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <PlanGate feature="analytics" currentPlan={tenantPlan} tenant={tenant}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-primary">Group Analytics</h1>
                <p className="mt-1 text-secondary">Insights and metrics for your groups</p>
              </div>
              <button
                onClick={() => router.push('/groups')}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: 'var(--color-fill-secondary)',
                  color: 'var(--color-label-primary)',
                }}
              >
                Back to Groups
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="stat-card">
                  <p className="text-sm font-medium text-secondary mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold mb-2" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                  <span className={`badge ${stat.badge}`}>{stat.delta}</span>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Activity Chart Placeholder */}
              <div className="surface p-6" style={{ borderRadius: 'var(--radius-xl)' }}>
                <h3 className="text-base font-semibold text-primary mb-4">Group Activity</h3>
                <div
                  className="h-56 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-fill-quaternary)' }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-sm text-secondary">Activity chart coming soon</p>
                  </div>
                </div>
              </div>

              {/* Top Groups */}
              <div className="surface p-6" style={{ borderRadius: 'var(--radius-xl)' }}>
                <h3 className="text-base font-semibold text-primary mb-4">Top Performing Groups</h3>
                <div className="space-y-4">
                  {topGroups.map((group) => (
                    <div key={group.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-primary">{group.name}</span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-green)' }}>
                          {group.score}%
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--color-fill-secondary)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${group.score}%`,
                            backgroundColor: 'var(--color-green)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PlanGate>
      </AppLayout>
    </>
  );
};

export default function GroupAnalyticsPage() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <GroupAnalyticsPageContent />
    </SnackbarProvider>
  );
}

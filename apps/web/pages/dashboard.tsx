import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AppLayout, NavItem, UserMenu, getDefaultNavItems, getDefaultUser, getDefaultLogo, getDefaultSidebarSections, TenantDebug } from '@luxgen/ui';
import { TenantBanner } from '../components/tenant/TenantBanner';
import { fetchUserForTenant } from '@luxgen/ui/src/services/userService';

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

  return (
    <>
      <Head>
        <title>Dashboard - LuxGen</title>
        <meta name="description" content="Dashboard for LuxGen platform" />
      </Head>

      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={user || undefined}
        onUserAction={handleUserAction}
        onSearch={handleSearch}
        onNotificationClick={handleNotificationClick}
        showSearch={true}
        showNotifications={true}
        notificationCount={3}
        searchPlaceholder="Search dashboard..."
        logo={getDefaultLogo()}
        sidebarCollapsible={true}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <TenantBanner tenant={tenant} />
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Courses
              </h3>
              <p className="text-3xl font-bold text-blue-600">12</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Active Students
              </h3>
              <p className="text-3xl font-bold text-green-600">156</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Completion Rate
              </h3>
              <p className="text-3xl font-bold text-purple-600">87%</p>
            </div>
          </div>
          </div>
        </AppLayout>
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
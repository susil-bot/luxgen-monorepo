import { useState, useEffect } from 'react';
import Head from 'next/head';
import { AppLayout, getDefaultSidebarSections, getDefaultUser, getDefaultLogo, TenantDebug } from '@luxgen/ui';
import { TenantBanner } from '../../components/tenant/TenantBanner';

interface CourseLayoutProps {
  children: React.ReactNode;
  tenant: string;
  title?: string;
}

export default function CourseLayout({ children, tenant, title = 'Courses' }: CourseLayoutProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title} - {tenant.charAt(0).toUpperCase() + tenant.slice(1)}</title>
      </Head>
      
      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={getDefaultUser()}
        logo={getDefaultLogo()}
        onUserAction={(action) => {
          switch (action) {
            case 'profile':
              console.log('Navigate to profile');
              break;
            case 'settings':
              console.log('Navigate to settings');
              break;
            case 'logout':
              console.log('Logout');
              break;
          }
        }}
        showSearch={true}
        showNotifications={true}
        notificationCount={3}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <TenantBanner tenant={tenant} />
        
        <div className="mt-6">
          {children}
        </div>
        
        <TenantDebug />
      </AppLayout>
    </>
  );
}

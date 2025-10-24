import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NotFound, AssetManagerProvider, useAssetManager, AppLayout, getDefaultNavItems, getDefaultUser, getDefaultLogo, getDefaultSidebarSections } from '@luxgen/ui';
import { getBrandAssetsForTenant } from '@luxgen/ui/src/Assets/DefaultBrandAssets';

const NotFoundPageContent: React.FC = () => {
  const router = useRouter();
  const { getBrandAssets } = useAssetManager();
  const [user, setUser] = useState<any>(null);
  
  // Get tenant from subdomain or default to 'demo'
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const tenantId = hostname.includes('idea-vibes') ? 'idea-vibes' : 
                   hostname.includes('demo') ? 'demo' : 'default';
  
  const brandAssets = getBrandAssets(tenantId);

  // Load user data
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
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser(getDefaultUser());
      }
    } else {
      setUser(getDefaultUser());
    }
  }, []);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSearch = (query: string) => {
    // Implement search functionality
    console.log('Searching for:', query);
    // You could redirect to a search page or implement search logic here
  };

  // Handle user actions
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

  // Handle notifications
  const handleNotificationClick = () => {
    console.log('Notification clicked');
    // TODO: Implement notification functionality
  };

  return (
    <>
      <Head>
        <title>Page Not Found - LuxGen</title>
        <meta name="description" content="The page you are looking for does not exist." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <AppLayout
        sidebarSections={getDefaultSidebarSections()}
        user={user}
        onUserAction={handleUserAction}
        onSearch={handleSearch}
        onNotificationClick={handleNotificationClick}
        showSearch={true}
        showNotifications={true}
        notificationCount={0}
        searchPlaceholder="Search for pages, groups, or users..."
        logo={getDefaultLogo()}
        sidebarCollapsible={true}
        sidebarDefaultCollapsed={false}
        responsive={true}
      >
        <NotFound
          title="Page Not Found"
          description="The page you are looking for does not exist or has been moved."
          showSearch={true}
          showNavigation={true}
          onSearch={handleSearch}
          onGoHome={handleGoHome}
          onGoBack={handleGoBack}
          searchPlaceholder="Search for pages, groups, or users..."
          variant="detailed"
          showIllustration={true}
          customActions={
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-4">
                Need help? Try these popular pages:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/groups')}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Groups
                </button>
                <button
                  onClick={() => router.push('/users')}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Users
                </button>
                <button
                  onClick={() => router.push('/analytics')}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Analytics
                </button>
              </div>
            </div>
          }
        />
      </AppLayout>
    </>
  );
};

export default function Custom404() {
  // Get tenant from subdomain or default to 'demo'
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const tenantId = hostname.includes('idea-vibes') ? 'idea-vibes' : 
                   hostname.includes('demo') ? 'demo' : 'default';
  
  const brandAssets = getBrandAssetsForTenant(tenantId);

  return (
    <AssetManagerProvider
      defaultBrandAssets={brandAssets}
      tenantId={tenantId}
      autoLoad={false}
    >
      <NotFoundPageContent />
    </AssetManagerProvider>
  );
}

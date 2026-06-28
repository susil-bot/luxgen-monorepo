import { useAppShellConfig } from '../lib/app-shell-config';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createHandleUserAction } from '../lib/user-actions';
import {
  NotFound,
  AssetManagerProvider,
  useAssetManager,
  AppLayout } from '@luxgen/ui';
import { getBrandAssetsForTenant } from '@luxgen/ui/src/Assets/DefaultBrandAssets';
import { useLayoutUser } from '../lib/app-layout-user';
import { useAppLayoutHeader } from '../lib/app-layout-header';

const NotFoundPageContent: React.FC = () => {
  const { sidebarSections, logo } = useAppShellConfig();
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const headerProps = useAppLayoutHeader();
  const { getBrandAssets } = useAssetManager();

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const tenantId = hostname.includes('idea-vibes') ? 'idea-vibes' : hostname.includes('demo') ? 'demo' : 'default';
  const _brandAssets = getBrandAssets(tenantId);

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
  const handleUserAction = createHandleUserAction(router);

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
        sidebarSections={sidebarSections}
        user={layoutUser ?? undefined}
        {...headerProps}
        onUserAction={handleUserAction}
        onSearch={handleSearch}
        onNotificationClick={handleNotificationClick}
        showSearch={true}
        showNotifications={true}
        notificationCount={0}
        searchPlaceholder="Search for pages, groups, or users..."
        logo={logo}
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
              <p className="text-sm text-secondary mb-4">Need help? Try these popular pages:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button type="button" onClick={() => router.push('/dashboard')} className="ios-btn-secondary">
                  Dashboard
                </button>
                <button type="button" onClick={() => router.push('/groups')} className="ios-btn-secondary">
                  Groups
                </button>
                <button type="button" onClick={() => router.push('/users')} className="ios-btn-secondary">
                  Users
                </button>
                <button type="button" onClick={() => router.push('/analytics')} className="ios-btn-secondary">
                  Analytics
                </button>
                <button type="button" onClick={() => router.push('/login')} className="ios-btn-primary">
                  Sign in
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
  const tenantId = 'default';
  const brandAssets = getBrandAssetsForTenant(tenantId);

  return (
    <AssetManagerProvider defaultBrandAssets={brandAssets} tenantId={tenantId} autoLoad={false}>
      <NotFoundPageContent />
    </AssetManagerProvider>
  );
}

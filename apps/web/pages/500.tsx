import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppLayout, EmptyState } from '@luxgen/ui';
import { useAppShellConfig } from '../lib/app-shell-config';
import { useLayoutUser } from '../lib/app-layout-user';
import { useAppLayoutHeader } from '../lib/app-layout-header';
import { createHandleUserAction } from '../lib/user-actions';

export default function Custom500() {
  const { sidebarSections, logo } = useAppShellConfig();
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const headerProps = useAppLayoutHeader();
  const handleUserAction = createHandleUserAction(router);

  return (
    <>
      <Head>
        <title>Server Error - LuxGen</title>
        <meta name="description" content="Something went wrong on our end." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <AppLayout
        sidebarSections={sidebarSections}
        user={layoutUser ?? undefined}
        onUserAction={handleUserAction}
        logo={logo}
        sidebarCollapsible
        responsive
        {...headerProps}
      >
        <div className="ios-empty-state" style={{ minHeight: '50vh' }}>
          <EmptyState
            title="Something went wrong"
            description="We hit an unexpected error. Try again or return to the dashboard."
          />
          <div className="flex flex-wrap justify-center gap-2 pb-16">
            <button type="button" className="ios-btn-primary" onClick={() => router.reload()}>
              Try again
            </button>
            <button type="button" className="ios-btn-secondary" onClick={() => router.push('/dashboard')}>
              Go to dashboard
            </button>
          </div>
        </div>
      </AppLayout>
    </>
  );
}

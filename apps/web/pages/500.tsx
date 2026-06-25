import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppLayout, getDefaultLogo, getDefaultSidebarSections, NotFound } from '@luxgen/ui';
import { useLayoutUser } from '../lib/app-layout-user';
import { useAppLayoutHeader } from '../lib/app-layout-header';
import { createHandleUserAction } from '../lib/user-actions';

export default function Custom500() {
  const router = useRouter();
  const layoutUser = useLayoutUser();
  const headerProps = useAppLayoutHeader();
  const handleUserAction = createHandleUserAction(router);

  return (
    <>
      <Head><title>Server Error - LuxGen</title><meta name="robots" content="noindex, nofollow" /></Head>
      <AppLayout sidebarSections={getDefaultSidebarSections()} user={layoutUser ?? undefined} logo={getDefaultLogo()} onUserAction={handleUserAction} {...headerProps} responsive>
        <NotFound title="Something went wrong" description="We hit an unexpected error. Try again or return home." variant="detailed" showIllustration onGoHome={() => router.push('/')} onGoBack={() => router.back()} customActions={
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <button type="button" className="ios-btn-primary" onClick={() => router.reload()}>Retry</button>
            <button type="button" className="ios-btn-secondary" onClick={() => router.push('/dashboard')}>Dashboard</button>
            <button type="button" className="ios-btn-secondary" onClick={() => router.push('/login')}>Sign in</button>
          </div>
        } />
      </AppLayout>
    </>
  );
}

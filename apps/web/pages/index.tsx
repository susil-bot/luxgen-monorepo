import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { SimpleHomeWelcome } from '../components/storefront/SimpleHomeWelcome';
import { PageLoadingState } from '../components/common/PageStates';
import { learnStoreServerProps } from '../lib/learn-store';
import { useClientMounted } from '../lib/use-client-mounted';
import { isStoredSessionExpired } from '../lib/session';

interface HomeProps {
  tenantSubdomain: string;
}

function hasActiveSession(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('authToken')) && !isStoredSessionExpired();
}

export default function Home({ tenantSubdomain }: HomeProps) {
  const router = useRouter();
  const mounted = useClientMounted();

  useEffect(() => {
    if (mounted && hasActiveSession()) {
      void router.replace('/dashboard');
    }
  }, [mounted, router]);

  if (!mounted) {
    return <PageLoadingState label="Loading…" />;
  }

  return <SimpleHomeWelcome tenantName={tenantSubdomain} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { props } = learnStoreServerProps(context);
  return { props };
};

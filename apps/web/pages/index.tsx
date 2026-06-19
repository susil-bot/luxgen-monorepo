import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';
import { useGlobalContext } from '@luxgen/ui';
import { PageLoadingState } from '../components/common/PageStates';

interface HomeProps {
  tenant: string | null;
}

export default function Home({ tenant: _tenant }: HomeProps) {
  const router = useRouter();
  const { isInitialized, currentTenant } = useGlobalContext();

  useEffect(() => {
    if (isInitialized && currentTenant && currentTenant !== 'demo') {
      router.push('/dashboard');
    }
  }, [isInitialized, currentTenant, router]);

  if (!isInitialized) {
    return <PageLoadingState label="Loading…" />;
  }

  return (
    <>
      <Head>
        <title>LuxGen — Multi-tenant LMS</title>
        <meta name="description" content="Your multi-tenant learning management system" />
      </Head>
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-primary)' }}>
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-lg text-center">
            <h1 className="ios-large-title mb-3">Welcome to LuxGen</h1>
            <p className="text-secondary text-base mb-10 leading-relaxed">
              Multi-tenant learning, automations, and AI-assisted delivery — built with an iOS-native feel.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button type="button" onClick={() => router.push('/login')} className="ios-btn-primary">
                Sign in
              </button>
              <button type="button" onClick={() => router.push('/register')} className="ios-btn-secondary">
                Create account
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const host = context.req.headers.host;
  const tenant = host?.split('.')[0] || null;

  return {
    props: {
      tenant,
    },
  };
};

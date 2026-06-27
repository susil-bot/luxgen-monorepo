import { useRouter } from 'next/router';
import Head from 'next/head';

interface SimpleHomeWelcomeProps {
  tenantName: string;
}

/** Default home when trainer landing is disabled for this tenant. */
export function SimpleHomeWelcome({ tenantName }: SimpleHomeWelcomeProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{tenantName} — LuxGen</title>
        <meta name="description" content={`Welcome to ${tenantName}`} />
      </Head>
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg-primary)' }}>
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-lg text-center">
            <h1 className="ios-large-title mb-3">Welcome to {tenantName}</h1>
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

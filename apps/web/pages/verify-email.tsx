import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { PageWrapper, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { getTenantPageProps } from '../lib/tenant-page-props';

function VerifyEmailContent() {
  const router = useRouter();
  const token = String(router.query.token ?? '');
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const verify = async () => {
    if (!token) { showError('Missing verification token'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Verification failed');
      showSuccess('Email verified! You can sign in.');
      setTimeout(() => router.push('/login'), 1500);
    } catch (e) { showError(e instanceof Error ? e.message : 'Verification failed'); } finally { setLoading(false); }
  };

  const resend = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Could not resend');
      showSuccess('If an account exists, we sent a new link.');
    } catch (e) { showError(e instanceof Error ? e.message : 'Resend failed'); } finally { setLoading(false); }
  };

  return (
    <>
      <Head><title>Verify email</title></Head>
      <PageWrapper>
        <main id="main-content" className="min-h-screen flex items-center justify-center p-6">
          <div className="ios-card p-8 max-w-md w-full space-y-4">
            <h1 className="text-xl font-semibold">Verify your email</h1>
            <p className="text-sm text-secondary">Check your inbox for a verification link, or verify with the link you opened.</p>
            {token ? (
              <button type="button" className="ios-btn-primary w-full" disabled={loading} onClick={() => void verify()}>{loading ? 'Verifying…' : 'Verify email'}</button>
            ) : (
              <>
                <input className="ios-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="button" className="ios-btn-secondary w-full" disabled={loading} onClick={() => void resend()}>Resend verification email</button>
              </>
            )}
          </div>
        </main>
      </PageWrapper>
    </>
  );
}

export default function VerifyEmailPage(props: { tenant: string }) {
  return <SnackbarProvider position="top-right" maxSnackbars={3}><VerifyEmailContent {...props} /></SnackbarProvider>;
}
export const getServerSideProps = getTenantPageProps;

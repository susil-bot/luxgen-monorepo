import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { PageWrapper, SnackbarProvider, useSnackbar } from '@luxgen/ui';

const ResetPasswordContent: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const token = typeof router.query.token === 'string' ? router.query.token : '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      showError('Missing reset token. Use the link from your email.');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || 'Unable to reset password.');
        return;
      }

      showSuccess(data.message || 'Password reset successful.');
      router.push('/login');
    } catch {
      showError('Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password - LuxGen</title>
        <meta name="description" content="Set a new password for your account" />
      </Head>

      <PageWrapper>
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--color-bg-primary)' }}
        >
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white/90 p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Reset password</h1>
            <p className="text-sm text-gray-600 mb-6">Choose a new password for your account.</p>

            {!token && router.isReady ? (
              <p className="text-sm text-red-600 mb-4">Invalid reset link. Request a new one from the login page.</p>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || !token}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || !token}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Saving…' : 'Update password'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="mt-6 text-sm text-green-600 hover:text-green-700"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

export default function ResetPasswordPage() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <ResetPasswordContent />
    </SnackbarProvider>
  );
}

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { PageWrapper, SnackbarProvider, useSnackbar } from '@luxgen/ui';

const ForgotPasswordContent: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data.message || 'Unable to request password reset.';
        showError(message);
        return;
      }

      showSuccess(data.message || 'If an account exists with that email, a password reset link has been sent.');
      setEmail('');
    } catch {
      showError('Unable to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password - LuxGen</title>
        <meta name="description" content="Request a password reset link" />
      </Head>

      <PageWrapper>
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--color-bg-primary)' }}
        >
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white/90 p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Forgot password?</h1>
            <p className="text-sm text-gray-600 mb-6">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Sending…' : 'Send reset link'}
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

export default function ForgotPasswordPage() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <ForgotPasswordContent />
    </SnackbarProvider>
  );
}

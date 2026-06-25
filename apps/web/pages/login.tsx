import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useMutation } from '@apollo/client';
import { LoginForm, LoginFormData, RegisterVisual, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { PageWrapper } from '@luxgen/ui';
import { AuthNoticeBanner } from '../components/auth/AuthNoticeBanner';
import { LOGIN_MUTATION } from '../graphql/queries/auth';
import { AUTH_NOTICE_BY_REASON, formatLoginError, parseAuthRedirectReason } from '../lib/auth-notices';
import { clearStoredSession, persistSession } from '../lib/session';
import { isSessionTenantMismatch, tenantMismatchMessage } from '../lib/tenant-auth';
import { safeRedirectPath } from '../lib/safe-redirect';

const DEV_DEMO_EMAIL = 'alex.thompson@demo.com';
const DEV_DEMO_PASSWORD = 'password123';

const LoginPageContent: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [authNoticeDismissed, setAuthNoticeDismissed] = useState(false);

  const redirectReason = router.isReady ? parseAuthRedirectReason(router.query.reason) : null;
  const authNotice = redirectReason && !authNoticeDismissed ? AUTH_NOTICE_BY_REASON[redirectReason] : null;

  useEffect(() => {
    setAuthNoticeDismissed(false);
  }, [redirectReason]);

  useEffect(() => {
    if (redirectReason === 'tenant_mismatch') {
      clearStoredSession();
    }
  }, [redirectReason]);

  const [loginMutation] = useMutation(LOGIN_MUTATION);

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);

    try {
      console.log('🔐 Attempting login with email:', data.email);

      // Call GraphQL login mutation
      const result = await loginMutation({
        variables: {
          input: {
            email: data.email,
            password: data.password,
          },
        },
      });

      if (result.data?.login) {
        const { token, user } = result.data.login;

        if (isSessionTenantMismatch(user)) {
          showError(tenantMismatchMessage(user));
          return;
        }

        persistSession(token, user);

        showSuccess(`Login successful! Welcome ${user.firstName} ${user.lastName}`);

        router.push(safeRedirectPath(router.query.redirect));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const rawMessage = error.message || 'Login failed. Please check your credentials and try again.';
      showError(formatLoginError(rawMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin' | 'github') => {
    setLoading(true);
    showInfo(`Redirecting to ${provider}...`);

    try {
      // TODO: Implement actual social login
      // For now, just show a message
      setTimeout(() => {
        showError(`${provider} login is not yet implemented. Please use email/password.`);
        setLoading(false);
      }, 2000);
    } catch {
      showError(`Failed to connect with ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    showError('Password reset is coming soon. Contact your administrator if you need access.');
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  return (
    <>
      <Head>
        <title>Login - LuxGen</title>
        <meta name="description" content="Sign in to your LuxGen account" />
      </Head>

      <PageWrapper>
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--color-bg-primary)' }}
        >
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Section - Login Form */}
              <div className="order-2 md:order-1">
                {authNotice && <AuthNoticeBanner notice={authNotice} onDismiss={() => setAuthNoticeDismissed(true)} />}
                <LoginForm
                  onSubmit={handleLogin}
                  onSocialLogin={handleSocialLogin}
                  onForgotPassword={handleForgotPassword}
                  onSignUp={handleSignUp}
                  loading={loading}
                  title="Welcome Back"
                  subtitle="Sign in to your account to continue"
                  socialProviders={['google', 'linkedin', 'github']}
                  defaultEmail={process.env.NODE_ENV === 'development' ? DEV_DEMO_EMAIL : undefined}
                  defaultPassword={process.env.NODE_ENV === 'development' ? DEV_DEMO_PASSWORD : undefined}
                  className=""
                />
              </div>

              {/* Right Section - Visual and Testimonial */}
              <div className="order-1 md:order-2">
                <RegisterVisual
                  testimonial={{
                    quote:
                      'Thanks to this platform, I quickly found my dream job! Easy to navigate, countless opportunities, and excellent results. Highly recommended!',
                    author: 'Emily Kuper',
                    stats: 'Satisfied Customer',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

export default function Login() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <LoginPageContent />
    </SnackbarProvider>
  );
}

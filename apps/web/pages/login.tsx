import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { LoginForm, LoginFormData, SnackbarProvider, useSnackbar, authenticateUser } from '@luxgen/ui';
import { PageWrapper } from '@luxgen/ui';

const LoginPageContent: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);

    try {
      // Get current hostname to determine tenant
      const hostname = window.location.hostname;
      let tenantId = 'demo'; // default tenant
      
      if (hostname.includes('ideavibes')) {
        tenantId = 'ideavibes';
      } else if (hostname.includes('acme-corp')) {
        tenantId = 'acme-corp';
      }

      console.log('🔐 Attempting login for tenant:', tenantId);

      // Use the userService for authentication
      const user = await authenticateUser(tenantId, {
        email: data.email,
        password: data.password,
      });

      if (user) {
        showSuccess(`Login successful! Welcome ${user.name}`);
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Login failed. Please check your credentials and try again.');
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
    } catch (error) {
      showError(`Failed to connect with ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    showSuccess('Password reset email sent! Check your inbox.');
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
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Section - Login Form */}
              <div className="order-2 md:order-1">
                <LoginForm
                  onSubmit={handleLogin}
                  onSocialLogin={handleSocialLogin}
                  onForgotPassword={handleForgotPassword}
                  onSignUp={handleSignUp}
                  loading={loading}
                  title="Welcome Back"
                  subtitle="Sign in to your account to continue"
                  socialProviders={['google', 'linkedin', 'github']}
                  className=""
                />
              </div>

              {/* Right Section - Visual and Testimonial */}
              <div className="order-1 md:order-2">
                <div className="relative">
                  {/* Abstract Graphic */}
                  <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] mb-6 md:mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-3xl blur-3xl"></div>
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 relative">
                        {/* Outer ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-green-400/30 animate-pulse"></div>
                        {/* Middle ring */}
                        <div className="absolute inset-4 rounded-full border-2 border-green-300/50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        {/* Inner ring */}
                        <div className="absolute inset-8 rounded-full border border-green-200/70 animate-pulse" style={{ animationDelay: '1s' }}></div>
                        {/* Center dot */}
                        <div className="absolute inset-1/2 w-4 h-4 bg-green-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
                        {/* Floating particles */}
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-green-300 rounded-full animate-bounce"
                            style={{
                              top: `${20 + (i * 10)}%`,
                              left: `${15 + (i * 8)}%`,
                              animationDelay: `${i * 0.2}s`,
                              animationDuration: '2s',
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Testimonial Card */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="text-center">
                      <div className="mb-4">
                        <svg className="w-8 h-8 text-yellow-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.05c-3.481.881-6.006 3.789-6.006 7.559 0 2.5 1.5 4.5 3.5 4.5s3.5-2 3.5-4.5c0-3.77-2.525-6.678-6.006-7.559l.996-2.05c5.252 1.039 8.983 4.905 8.983 10.609v7.391h-9.017z"/>
                        </svg>
                      </div>
                        <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                        "Thanks to this platform, I quickly found my dream job! Easy to navigate, countless opportunities, and excellent results. Highly recommended!"
                      </p>
                      <div>
                        <p className="text-gray-900 font-semibold text-lg">Emily Kuper</p>
                        <p className="text-gray-600">Satisfied Customer</p>
                      </div>
                    </div>
                  </div>
                </div>
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

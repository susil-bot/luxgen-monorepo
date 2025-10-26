import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useMutation } from '@apollo/client';
import { RegisterForm, RegisterFormData, RegisterVisual, SnackbarProvider, useSnackbar } from '@luxgen/ui';
import { PageWrapper } from '@luxgen/ui';
import { REGISTER_MUTATION } from '../graphql/queries/auth';

const RegisterPageContent: React.FC = () => {
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const handleRegister = async (data: RegisterFormData) => {
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

      console.log('📝 Attempting registration for tenant:', tenantId);
      console.log('👤 Registration data:', data);
      console.log('🎭 Selected role:', data.role);

      // Map role from form to GraphQL enum
      const roleMapping: { [key: string]: string } = {
        'USER': 'STUDENT',
        'ADMIN': 'INSTRUCTOR', 
        'SUPER_ADMIN': 'ADMIN'
      };

      const graphqlRole = roleMapping[data.role] || 'STUDENT';

      // Call GraphQL registration mutation
      const result = await registerMutation({
        variables: {
          input: {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            role: graphqlRole,
            tenantId: tenantId
          }
        }
      });

      if (result.data?.register) {
        const { token, user } = result.data.register;
        
        // Store token in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentTenant', user.tenant.subdomain);

        const roleDisplayName = data.role === 'SUPER_ADMIN' ? 'Super Admin' : 
                               data.role === 'ADMIN' ? 'Admin' : 'User';
        showSuccess(`Registration successful! Welcome ${data.firstName} ${data.lastName} as ${roleDisplayName}`);
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      showError(errorMessage);
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
        showError(`${provider} registration is not yet implemented. Please use email/password.`);
        setLoading(false);
      }, 2000);
    } catch (error) {
      showError(`Failed to connect with ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Register - LuxGen</title>
        <meta name="description" content="Create your LuxGen account" />
      </Head>

      <PageWrapper>
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Section - Register Form */}
              <div className="order-2 md:order-1">
                <RegisterForm
                  onSubmit={handleRegister}
                  onSocialLogin={handleSocialLogin}
                  onSignIn={handleLogin}
                  loading={loading}
                  title="Create Account"
                  subtitle="Sign up for your account to get started"
                  socialProviders={['google', 'linkedin', 'github']}
                  className=""
                />
              </div>

              {/* Right Section - Visual and Testimonial */}
              <div className="order-1 md:order-2">
                <RegisterVisual
                  testimonial={{
                    quote: "Join thousands of professionals who have found their dream careers through our platform. Start your journey today!",
                    author: "Join Our Community",
                    stats: "Over 10,000+ successful placements"
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

export default function Register() {
  return (
    <SnackbarProvider position="top-right" maxSnackbars={3}>
      <RegisterPageContent />
    </SnackbarProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { BaseComponentProps, TenantTheme } from '../types';
import { withSSR } from '../ssr';
import { defaultTheme } from '../theme';
import { Button } from '../Button';
import { Input } from '../Input';
import { Card } from '../Card';
import { Form } from '../Form';
import { Text } from '../Text';
import { Heading } from '../Heading';
import { Checkbox } from '../Checkbox';

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormProps extends BaseComponentProps {
  tenantTheme?: TenantTheme;
  onSubmit?: (data: LoginFormData) => Promise<void> | void;
  onSocialLogin?: (provider: 'google' | 'linkedin' | 'github') => Promise<void> | void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  loading?: boolean;
  error?: string;
  success?: string;
  showSocialLogin?: boolean;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  showSignUpLink?: boolean;
  socialProviders?: ('google' | 'linkedin' | 'github')[];
  className?: string;
  title?: string;
  subtitle?: string;
  submitText?: string;
  emailLabel?: string;
  passwordLabel?: string;
  rememberMeLabel?: string;
  forgotPasswordText?: string;
  signUpText?: string;
  signUpLinkText?: string;
  socialLoginText?: string;
}

const LoginFormComponent: React.FC<LoginFormProps> = ({
  tenantTheme = defaultTheme,
  onSubmit,
  onSocialLogin,
  onForgotPassword,
  onSignUp,
  loading = false,
  error,
  success,
  showSocialLogin = true,
  showRememberMe = true,
  showForgotPassword = true,
  showSignUpLink = true,
  socialProviders = ['google', 'linkedin'],
  className = '',
  title = 'Welcome Back',
  subtitle = 'Sign in to your account to continue',
  submitText = 'Sign In',
  emailLabel = 'Email address',
  passwordLabel = 'Password',
  rememberMeLabel = 'Remember me',
  forgotPasswordText = 'Forgot password?',
  signUpText = "Don't have an account?",
  signUpLinkText = 'Sign up here',
  socialLoginText = 'Or continue with',
  ...props
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors when form data changes
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [formData]);

  // Clear form on successful login
  useEffect(() => {
    if (success && !loading) {
      setFormData({
        email: '',
        password: '',
        rememberMe: false,
      });
    }
  }, [success, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Let parent component handle error display
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin' | 'github') => {
    try {
      if (onSocialLogin) {
        await onSocialLogin(provider);
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
    }
  };

  const getSocialProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'github':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getSocialProviderName = (provider: string) => {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  const isFormValid = formData.email.trim() && formData.password && Object.keys(errors).length === 0;
  const isDisabled = loading || isSubmitting;

  return (
      <Card
        tenantTheme={tenantTheme}
        variant="elevated"
        padding="large"
        className={`login-form bg-white border border-green-200 rounded-2xl shadow-xl ${className}`}
        {...props}
      >
      {/* Header */}
      <div className="login-form-header mb-8 text-center">
        <Heading 
          level={1} 
          text={title}
          className="text-3xl font-bold mb-2 text-gray-900"
        />
        <Text 
          text={subtitle}
          className="text-lg text-gray-600"
        />
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <Text text={error} className="text-sm font-medium text-red-400" />
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
          <Text text={success} className="text-sm font-medium text-green-400" />
        </div>
      )}

      {/* Login Form */}
      <Form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {emailLabel}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={loading || isSubmitting}
            className={`w-full px-4 py-3 bg-white/90 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            {passwordLabel}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={loading || isSubmitting}
            className={`w-full px-4 py-3 bg-white/90 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          {showRememberMe && (
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                disabled={loading || isSubmitting}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-600">
                {rememberMeLabel}
              </label>
            </div>
          )}
          
          {showForgotPassword && onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-green-400 hover:text-green-300 transition-colors"
              disabled={loading || isSubmitting}
            >
              {forgotPasswordText}
            </button>
          )}
        </div>

        {/* Submit Button */}
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
          {loading || isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing in...
            </div>
          ) : (
            submitText
          )}
        </button>

        {/* Social Login */}
        {showSocialLogin && socialProviders.length > 0 && (
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{socialLoginText}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {socialProviders.map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => handleSocialLogin(provider)}
                  disabled={loading || isSubmitting}
                  className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {getSocialProviderIcon(provider)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sign Up Link */}
        {showSignUpLink && onSignUp && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {signUpText}{' '}
              <button
                type="button"
                onClick={onSignUp}
                className="text-green-400 hover:text-green-300 font-medium transition-colors"
                disabled={loading || isSubmitting}
              >
                {signUpLinkText}
              </button>
            </p>
          </div>
        )}
      </Form>
    </Card>
  );
};

export const LoginForm = withSSR(LoginFormComponent);
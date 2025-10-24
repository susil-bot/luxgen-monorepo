import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm, LoginFormData } from './LoginForm';

// Mock the withSSR HOC
jest.mock('../ssr', () => ({
  withSSR: (Component: any) => Component,
}));

describe('LoginForm', () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    onSocialLogin: jest.fn(),
    onForgotPassword: jest.fn(),
    onSignUp: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<LoginForm {...defaultProps} />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders with custom title and subtitle', () => {
    render(
      <LoginForm
        {...defaultProps}
        title="Custom Title"
        subtitle="Custom subtitle"
      />
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom subtitle')).toBeInTheDocument();
  });

  it('handles form input changes', () => {
    render(<LoginForm {...defaultProps} />);
    
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('validates email field', async () => {
    render(<LoginForm {...defaultProps} />);
    
    const submitButton = screen.getByText('Sign In');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('validates password field', async () => {
    render(<LoginForm {...defaultProps} />);
    
    const emailInput = screen.getByLabelText('Email address');
    const submitButton = screen.getByText('Sign In');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<LoginForm {...defaultProps} />);
    
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Sign In');
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('validates password length', async () => {
    render(<LoginForm {...defaultProps} />);
    
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Sign In');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  it('calls onSubmit with form data when form is valid', async () => {
    const mockOnSubmit = jest.fn();
    render(<LoginForm {...defaultProps} onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Sign In');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
    });
  });

  it('handles remember me checkbox', () => {
    render(<LoginForm {...defaultProps} />);
    
    const rememberMeCheckbox = screen.getByLabelText('Remember me');
    expect(rememberMeCheckbox).not.toBeChecked();
    
    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
  });

  it('calls onForgotPassword when forgot password link is clicked', () => {
    const mockOnForgotPassword = jest.fn();
    render(<LoginForm {...defaultProps} onForgotPassword={mockOnForgotPassword} />);
    
    const forgotPasswordLink = screen.getByText('Forgot password?');
    fireEvent.click(forgotPasswordLink);
    
    expect(mockOnForgotPassword).toHaveBeenCalled();
  });

  it('calls onSignUp when sign up link is clicked', () => {
    const mockOnSignUp = jest.fn();
    render(<LoginForm {...defaultProps} onSignUp={mockOnSignUp} />);
    
    const signUpLink = screen.getByText('Sign up here');
    fireEvent.click(signUpLink);
    
    expect(mockOnSignUp).toHaveBeenCalled();
  });

  it('handles social login', () => {
    const mockOnSocialLogin = jest.fn();
    render(<LoginForm {...defaultProps} onSocialLogin={mockOnSocialLogin} />);
    
    const googleButton = screen.getByText('Google');
    fireEvent.click(googleButton);
    
    expect(mockOnSocialLogin).toHaveBeenCalledWith('google');
  });

  it('shows loading state', () => {
    render(<LoginForm {...defaultProps} loading={true} />);
    
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeDisabled();
  });

  it('shows error message', () => {
    render(<LoginForm {...defaultProps} error="Invalid credentials" />);
    
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('shows success message', () => {
    render(<LoginForm {...defaultProps} success="Login successful" />);
    
    expect(screen.getByText('Login successful')).toBeInTheDocument();
  });

  it('hides social login when showSocialLogin is false', () => {
    render(<LoginForm {...defaultProps} showSocialLogin={false} />);
    
    expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
    expect(screen.queryByText('Google')).not.toBeInTheDocument();
  });

  it('hides remember me when showRememberMe is false', () => {
    render(<LoginForm {...defaultProps} showRememberMe={false} />);
    
    expect(screen.queryByLabelText('Remember me')).not.toBeInTheDocument();
  });

  it('hides forgot password when showForgotPassword is false', () => {
    render(<LoginForm {...defaultProps} showForgotPassword={false} />);
    
    expect(screen.queryByText('Forgot password?')).not.toBeInTheDocument();
  });

  it('hides sign up link when showSignUpLink is false', () => {
    render(<LoginForm {...defaultProps} showSignUpLink={false} />);
    
    expect(screen.queryByText("Don't have an account?")).not.toBeInTheDocument();
  });

  it('renders with custom social providers', () => {
    render(
      <LoginForm
        {...defaultProps}
        socialProviders={['google', 'github']}
      />
    );
    
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Github')).toBeInTheDocument();
    expect(screen.queryByText('Linkedin')).not.toBeInTheDocument();
  });

  it('disables form when loading', () => {
    render(<LoginForm {...defaultProps} loading={true} />);
    
    expect(screen.getByLabelText('Email address')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByLabelText('Remember me')).toBeDisabled();
  });

  it('clears errors when input changes', async () => {
    render(<LoginForm {...defaultProps} />);
    
    const emailInput = screen.getByLabelText('Email address');
    const submitButton = screen.getByText('Sign In');
    
    // Trigger validation error
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    
    // Clear error by typing
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });
});

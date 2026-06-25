import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from './RegisterForm';

describe('RegisterForm', () => {
  const baseProps = {
    onSubmit: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders the default title', () => {
    render(<RegisterForm {...baseProps} />);
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('renders a custom title', () => {
    render(<RegisterForm {...baseProps} title="Join Us" />);
    expect(screen.getByRole('heading', { name: 'Join Us' })).toBeInTheDocument();
  });

  it('renders first name, last name, email, password, confirm password and role fields', () => {
    render(<RegisterForm {...baseProps} />);
    expect(screen.getByLabelText('First name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
  });

  it('renders the submit button with default label', () => {
    render(<RegisterForm {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('renders a custom submit label', () => {
    render(<RegisterForm {...baseProps} submitText="Register now" />);
    expect(screen.getByRole('button', { name: 'Register now' })).toBeInTheDocument();
  });

  it('shows an error message when error prop is set', () => {
    render(<RegisterForm {...baseProps} error="Email already in use" />);
    expect(screen.getByText('Email already in use')).toBeInTheDocument();
  });

  it('shows a success message when success prop is set', () => {
    render(<RegisterForm {...baseProps} success="Account created! Check your email." />);
    expect(screen.getByText('Account created! Check your email.')).toBeInTheDocument();
  });

  it('renders terms agreement checkbox when showTermsAgreement=true (default)', () => {
    render(<RegisterForm {...baseProps} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('hides terms agreement when showTermsAgreement=false', () => {
    render(<RegisterForm {...baseProps} showTermsAgreement={false} />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders social login buttons when showSocialLogin=true', () => {
    render(<RegisterForm {...baseProps} showSocialLogin socialProviders={['google', 'linkedin']} />);
    expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
  });

  it('hides social login when showSocialLogin=false', () => {
    render(<RegisterForm {...baseProps} showSocialLogin={false} />);
    expect(screen.queryByText(/or continue with/i)).not.toBeInTheDocument();
  });

  it('renders the login link when onLogin is provided', () => {
    const onLogin = jest.fn();
    render(<RegisterForm {...baseProps} onLogin={onLogin} loginLinkText="Sign in here" />);
    const loginBtn = screen.getByRole('button', { name: 'Sign in here' });
    expect(loginBtn).toBeInTheDocument();
    fireEvent.click(loginBtn);
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it('shows loading spinner text when loading=true', () => {
    render(<RegisterForm {...baseProps} loading />);
    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    const { container } = render(<RegisterForm {...baseProps} showTermsAgreement={false} />);
    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
    });
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows password mismatch error when passwords do not match', async () => {
    const { container } = render(<RegisterForm {...baseProps} showTermsAgreement={false} />);
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass1234' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'different' } });
    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('calls onSubmit with form data when form is valid', async () => {
    render(<RegisterForm {...baseProps} showTermsAgreement={false} showSocialLogin={false} />);
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Smith' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'USER' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    await waitFor(() => {
      expect(baseProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'password123',
          role: 'USER',
        }),
      );
    });
  });
});

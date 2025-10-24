# LoginForm Component

A robust, accessible, and customizable login form component built with React and TypeScript.

## Features

- ✅ **Form Validation**: Email format and password length validation
- ✅ **Social Login**: Support for Google, LinkedIn, and GitHub
- ✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- ✅ **Customizable**: Extensive props for customization
- ✅ **Responsive**: Mobile-first design
- ✅ **Theme Support**: Tenant-specific theming
- ✅ **Loading States**: Built-in loading and error handling
- ✅ **TypeScript**: Full type safety

## Usage

```tsx
import { LoginForm } from '@luxgen/ui/LoginForm';

const MyLoginPage = () => {
  const handleLogin = async (data: LoginFormData) => {
    try {
      await loginUser(data);
      // Handle successful login
    } catch (error) {
      // Handle error
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin' | 'github') => {
    try {
      await socialLogin(provider);
      // Handle social login
    } catch (error) {
      // Handle error
    }
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      onSocialLogin={handleSocialLogin}
      onForgotPassword={() => navigate('/forgot-password')}
      onSignUp={() => navigate('/register')}
      loading={isLoading}
      error={error}
      success={success}
    />
  );
};
```

## Props

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSubmit` | `(data: LoginFormData) => Promise<void> \| void` | - | Callback when form is submitted |
| `onSocialLogin` | `(provider: string) => Promise<void> \| void` | - | Callback for social login |
| `onForgotPassword` | `() => void` | - | Callback for forgot password link |
| `onSignUp` | `() => void` | - | Callback for sign up link |

### State Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | `false` | Show loading state |
| `error` | `string` | - | Error message to display |
| `success` | `string` | - | Success message to display |

### Customization Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Welcome Back"` | Form title |
| `subtitle` | `string` | `"Sign in to your account to continue"` | Form subtitle |
| `submitText` | `string` | `"Sign In"` | Submit button text |
| `emailLabel` | `string` | `"Email address"` | Email field label |
| `passwordLabel` | `string` | `"Password"` | Password field label |
| `rememberMeLabel` | `string` | `"Remember me"` | Remember me checkbox label |
| `forgotPasswordText` | `string` | `"Forgot password?"` | Forgot password link text |
| `signUpText` | `string` | `"Don't have an account?"` | Sign up text |
| `signUpLinkText` | `string` | `"Sign up here"` | Sign up link text |
| `socialLoginText` | `string` | `"Or continue with"` | Social login divider text |

### Feature Toggle Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showSocialLogin` | `boolean` | `true` | Show social login options |
| `showRememberMe` | `boolean` | `true` | Show remember me checkbox |
| `showForgotPassword` | `boolean` | `true` | Show forgot password link |
| `showSignUpLink` | `boolean` | `true` | Show sign up link |
| `socialProviders` | `('google' \| 'linkedin' \| 'github')[]` | `['google', 'linkedin']` | Available social providers |

### Styling Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tenantTheme` | `TenantTheme` | `defaultTheme` | Tenant-specific theme |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `React.CSSProperties` | - | Inline styles |

## Form Data

The `LoginFormData` interface includes:

```typescript
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}
```

## Validation

The component includes built-in validation:

- **Email**: Required and must be valid email format
- **Password**: Required and must be at least 6 characters
- **Real-time**: Errors clear as user types

## Social Login

Supported providers:
- Google
- LinkedIn  
- GitHub

## Accessibility

- ARIA labels for all form elements
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Error announcements

## Examples

### Basic Login Form

```tsx
<LoginForm
  onSubmit={handleLogin}
  onForgotPassword={handleForgotPassword}
  onSignUp={handleSignUp}
/>
```

### Custom Styled Login Form

```tsx
<LoginForm
  onSubmit={handleLogin}
  title="Sign In to Your Account"
  subtitle="Enter your credentials to access your dashboard"
  submitText="Login"
  className="custom-login-form"
  tenantTheme={customTheme}
/>
```

### Login Form with Social Login

```tsx
<LoginForm
  onSubmit={handleLogin}
  onSocialLogin={handleSocialLogin}
  socialProviders={['google', 'github']}
  showRememberMe={false}
  showForgotPassword={false}
/>
```

### Loading State

```tsx
<LoginForm
  onSubmit={handleLogin}
  loading={isLoading}
  error={error}
  success={success}
/>
```

## Testing

The component includes comprehensive tests covering:

- Form validation
- User interactions
- Error handling
- Loading states
- Accessibility
- Customization options

Run tests with:

```bash
npm test LoginForm
```

## Styling

The component uses CSS-in-JS with tenant theming support. You can customize:

- Colors
- Typography
- Spacing
- Borders
- Shadows
- Animations

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Dependencies

- React 16.8+
- TypeScript 4.0+
- @luxgen/ui components

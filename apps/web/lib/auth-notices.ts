/**
 * Auth redirect reasons and user-facing copy (iOS notice banners).
 */

export type AuthRedirectReason =
  | 'session_expired'
  | 'unauthorized'
  | 'logged_out'
  | 'tenant_mismatch'
  | 'session_replaced';

export interface AuthNoticeContent {
  variant: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  icon: string;
}

export const AUTH_NOTICE_BY_REASON: Record<AuthRedirectReason, AuthNoticeContent> = {
  session_expired: {
    variant: 'warning',
    icon: '⏱️',
    title: 'Session expired',
    message: 'Your sign-in session ended. Please sign in again to continue.',
  },
  unauthorized: {
    variant: 'warning',
    icon: '🔐',
    title: 'Sign in required',
    message: 'You need to sign in to access that page.',
  },
  logged_out: {
    variant: 'info',
    icon: '👋',
    title: 'Signed out',
    message: 'You have been signed out successfully.',
  },
  tenant_mismatch: {
    variant: 'error',
    icon: '🏢',
    title: 'Wrong workspace',
    message:
      'This account belongs to a different tenant. Open the correct subdomain (e.g. demo.localhost) and sign in again.',
  },
  session_replaced: {
    variant: 'info',
    icon: '🔄',
    title: 'Session updated',
    message: 'You signed in on another tab or this session was replaced. Please sign in again to continue.',
  },
};

export function parseAuthRedirectReason(value: string | string[] | undefined): AuthRedirectReason | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && raw in AUTH_NOTICE_BY_REASON) {
    return raw as AuthRedirectReason;
  }
  return null;
}

/** Map GraphQL / REST login errors to friendly iOS snackbar copy */
export function formatLoginError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('not valid for this tenant') || lower.includes('tenant mismatch')) {
    return 'This account is not valid for this workspace. Use the correct subdomain to sign in.';
  }
  if (lower.includes('too many login') || lower.includes('rate limit')) {
    return 'Too many sign-in attempts. Please wait a few minutes and try again.';
  }
  if (lower.includes('deactivated') || lower.includes('suspended') || lower.includes('inactive')) {
    return 'This account is deactivated. Contact your administrator for access.';
  }
  if (lower.includes('invalid email') || lower.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (lower.includes('unauthenticated') || lower.includes('not authenticated')) {
    return 'Please sign in to continue.';
  }

  return message;
}

/** Map registration GraphQL errors to friendly snackbar copy */
export function formatRegisterError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('already exists') || lower.includes('duplicate')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (lower.includes('password') && lower.includes('short')) {
    return 'Password is too short. Use at least 8 characters.';
  }
  if (lower.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }

  return formatLoginError(message);
}

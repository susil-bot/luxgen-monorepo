/**
 * Route access policy for client-side AuthGuard.
 * Token lives in localStorage — guard runs in the browser after hydration.
 */

import type { AuthRedirectReason } from './auth-notices';

/** Exact paths that never require authentication */
export const PUBLIC_ROUTES = new Set(['/login', '/register', '/404']);

/** Path prefixes accessible without login (public directory, learner store, GPT store, mentors landing) */
export const PUBLIC_PREFIXES = ['/listings', '/learn', '/store', '/mentors'];

/** Admin/app areas that always require a valid session */
export const PROTECTED_PREFIXES = [
  '/dashboard',
  '/users',
  '/courses',
  '/groups',
  '/agent',
  '/automations',
  '/billing',
  '/analytics',
  '/customers',
  '/developer',
  '/marketplace',
  '/admin',
  '/banner-demo',
  '/profile',
  '/settings',
  '/products',
  '/orders',
  '/organization',
  '/project',
];

export function isAuthPage(pathname: string): boolean {
  const path = normalizePath(pathname);
  return path === '/login' || path === '/register';
}

export function isPublicRoute(pathname: string): boolean {
  const path = normalizePath(pathname);

  if (PUBLIC_ROUTES.has(path)) return true;
  if (path === '/') return true;

  // Public directory index only — /listings/my and /listings/apply require auth
  if (path === '/listings') return true;

  return PUBLIC_PREFIXES.some((prefix) => {
    if (prefix === '/listings') return path === prefix;
    return path === prefix || path.startsWith(`${prefix}/`);
  });
}

export function requiresAuth(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (isPublicRoute(path)) return false;

  return PROTECTED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function buildLoginRedirect(returnPath: string, reason?: AuthRedirectReason): string {
  const safe = returnPath && returnPath !== '/login' && returnPath !== '/register' ? returnPath : '/dashboard';
  const params = new URLSearchParams({ redirect: safe });
  if (reason) {
    params.set('reason', reason);
  }
  return `/login?${params.toString()}`;
}

/** Login URL after explicit sign-out (no return path) */
export function buildLogoutRedirect(): string {
  return '/login?reason=logged_out';
}

function normalizePath(pathname: string): string {
  const base = pathname.split('?')[0].split('#')[0];
  if (base.length > 1 && base.endsWith('/')) return base.slice(0, -1);
  return base || '/';
}

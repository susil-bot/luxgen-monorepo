/** Allow only same-origin relative paths — blocks protocol-relative and absolute URLs. */
export function safeRedirectPath(redirect: unknown, fallback = '/dashboard'): string {
  if (typeof redirect !== 'string') return fallback;
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return fallback;
  if (redirect.includes('://') || redirect.includes('\\')) return fallback;
  return redirect;
}

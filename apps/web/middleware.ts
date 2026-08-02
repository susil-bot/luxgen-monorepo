import { NextRequest, NextResponse } from 'next/server';

// PaaS-provided default hostnames and the live custom domain (luxgen.in)
// have no wildcard-subdomain DNS, so a tenant can't be expressed as
// demo.luxgen.in. A URL path prefix does the same job on any host
// instead: www.luxgen.in/demo/login selects the "demo" tenant the same
// way demo.luxgen.in/login would with real subdomains. Only matched
// against a known list of tenant subdomains so ordinary routes like
// /login or /dashboard are never mistaken for a tenant prefix. Keep this
// env var in sync with the API's TENANT_SUBDOMAINS and
// apps/web/lib/tenant.ts's KNOWN_TENANT_SUBDOMAINS.
const KNOWN_TENANTS = (process.env.NEXT_PUBLIC_TENANT_SUBDOMAINS || 'demo,idea-vibes')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export function middleware(request: NextRequest) {
  const hostname = (request.headers.get('host') || '').split(':')[0];
  const url = request.nextUrl.clone();
  const segments = url.pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  // Path-based tenant prefix — works on any host, including the live flat
  // production domain. Strips the prefix and rewrites internally so
  // /demo/login serves the existing /login page with tenant=demo in its
  // resolved props/query, while the browser's address bar keeps showing
  // /demo/login (rewrite, not redirect).
  if (firstSegment && KNOWN_TENANTS.includes(firstSegment)) {
    url.pathname = `/${segments.slice(1).join('/')}`;
    url.searchParams.set('tenant', firstSegment);
    return NextResponse.rewrite(url);
  }

  // Extract subdomain
  const parts = hostname.split('.');
  const subdomain = parts.length > 1 ? parts[0] : null;

  // Handle localhost subdomains - simplified logic
  if (hostname.includes('localhost') && subdomain && subdomain !== 'www') {
    // Add tenant query parameter for client-side detection
    url.searchParams.set('tenant', subdomain);

    // For root path, redirect to dashboard
    if (url.pathname === '/') {
      url.pathname = '/dashboard';
    }

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

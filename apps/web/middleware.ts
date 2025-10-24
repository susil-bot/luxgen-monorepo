import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  
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
import { NextRequest, NextResponse } from 'next/server';

// List of valid tenants
const VALID_TENANTS = ['demo', 'idea-vibes'];

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  const subdomain = host?.split('.')[0];

  // Check if subdomain is a valid tenant
  if (subdomain && !VALID_TENANTS.includes(subdomain)) {
    // Return 404 page for invalid tenants
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tenant Not Found - LuxGen</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; 
            padding: 0; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { 
            text-align: center; 
            background: white;
            padding: 3rem;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 500px;
            margin: 2rem;
          }
          .error-code { 
            font-size: 6rem; 
            font-weight: bold; 
            color: #e53e3e; 
            margin: 0;
            line-height: 1;
          }
          .error-title { 
            font-size: 1.5rem; 
            color: #2d3748; 
            margin: 1rem 0;
          }
          .error-message { 
            color: #718096; 
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          .subdomain { 
            background: #f7fafc; 
            padding: 0.5rem 1rem; 
            border-radius: 6px; 
            font-family: monospace; 
            color: #2d3748;
            display: inline-block;
            margin: 0.5rem;
          }
          .available-tenants {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #e2e8f0;
          }
          .tenant-link {
            display: inline-block;
            background: #4299e1;
            color: white;
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            border-radius: 6px;
            margin: 0.5rem;
            transition: background 0.2s;
          }
          .tenant-link:hover {
            background: #3182ce;
          }
          .footer {
            margin-top: 2rem;
            color: #a0aec0;
            font-size: 0.875rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-code">404</div>
          <h1 class="error-title">Tenant Not Found</h1>
          <p class="error-message">
            The tenant <span class="subdomain">${subdomain}</span> does not exist or is not available.
          </p>
          <div class="available-tenants">
            <p>Available tenants:</p>
            <a href="http://demo.localhost:3000" class="tenant-link">Demo Platform</a>
            <a href="http://idea-vibes.localhost:3000" class="tenant-link">Idea Vibes</a>
          </div>
          <div class="footer">
            <p>LuxGen Multi-Tenant Platform</p>
          </div>
        </div>
      </body>
      </html>
    `, {
      status: 404,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }

  // Add tenant information to headers for valid tenants
  const response = NextResponse.next();
  response.headers.set('x-tenant', subdomain || 'default');
  
  return response;
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

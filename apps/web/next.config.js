/** @type {import('next').NextConfig} */
const path = require('path');
const { apiUrl } = require('@luxgen/config/urls.cjs');

function devAllowedOrigins() {
  const tenants = (process.env.TENANT_SUBDOMAINS || 'demo,idea-vibes')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((id) => `${id}.localhost`);
  const extra = (process.env.NEXT_DEV_ALLOWED_ORIGINS || 'luxgen.localhost')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return ['localhost', '127.0.0.1', ...tenants, ...extra];
}

const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },
  /** Allow _next assets when browsing via tenant subdomains (demo.localhost:3000) */
  allowedDevOrigins: devAllowedOrigins(),
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  transpilePackages: [
    '@luxgen/ui',
    '@luxgen/auth',
    '@luxgen/agent',
    '@luxgen/design-tokens',
    '@luxgen/storefront',
    '@luxgen/automation-flow',
  ],
  experimental: {
    externalDir: true,
    /**
     * Prevent bundling server-only packages into RSC/API server compilation.
     * NOTE: this is `serverExternalPackages` (top-level, stable) in Next.js 15+.
     * This repo is pinned to Next.js ^14.0.0 (currently 14.2.33), where the
     * top-level key is silently dropped ("Invalid next.config.js options
     * detected: Unrecognized key(s) in object: 'serverExternalPackages'"),
     * which meant ioredis (pulled in by @luxgen/agent) was NOT externalized
     * and webpack tried to bundle it, failing on `node:diagnostics_channel`
     * ("UnhandledSchemeError ... Reading from node:diagnostics_channel").
     * Use the Next 14 experimental key instead; migrate back to the
     * top-level `serverExternalPackages` when this repo upgrades to Next 15.
     *
     * Do not list `@luxgen/agent` here — it must stay in transpilePackages
     * (Next 14 forbids both). Externalize ioredis via this list + webpack.
     */
    serverComponentsExternalPackages: ['ioredis', 'mongodb', '@luxgen/db'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer, webpack }) => {
    // ioredis imports `node:diagnostics_channel`; webpack throws UnhandledSchemeError
    // unless the `node:` prefix is stripped (Node builtins resolve without it).
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      }),
    );

    // Keep ioredis out of the webpack graph (agent stays transpiled/bundled).
    const externalizer = ({ request }, callback) => {
      if (typeof request !== 'string') return callback();
      if (request === 'ioredis' || request.startsWith('node:')) {
        return callback(null, isServer ? `commonjs ${request}` : 'var {}');
      }
      if (isServer && (request === 'mongodb' || request === 'mongoose' || request === '@luxgen/db')) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    };
    if (Array.isArray(config.externals)) {
      config.externals.push(externalizer);
    } else if (config.externals) {
      config.externals = [config.externals, externalizer];
    } else {
      config.externals = [externalizer];
    }

    if (!isServer) {
      // Never ship @luxgen/agent barrel (ioredis) to the browser
      config.resolve.alias = {
        ...config.resolve.alias,
        '@luxgen/agent': path.resolve(__dirname, 'lib/agent-client-stub.ts'),
        ioredis: false,
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer/'),
        dns: false,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        ioredis: false,
      };
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
      );
    }
    return config;
  },
  async redirects() {
    return [
      { source: '/learn/products', destination: '/store/product', permanent: false },
      { source: '/learn/products/:id', destination: '/store/product/:id', permanent: false },
      { source: '/learn/collections', destination: '/store/collections', permanent: false },
      { source: '/learn/collections/:id', destination: '/store/collections/:id', permanent: false },
      { source: '/learn/bundles', destination: '/store/bundles', permanent: false },
      { source: '/learn/bundles/:id', destination: '/store/bundles/:id', permanent: false },
    ];
  },
  async rewrites() {
    const resolvedApiUrl = apiUrl();
    return [
      { source: '/api/graphql', destination: `${resolvedApiUrl}/graphql` },
      { source: '/api/auth/:path*', destination: `${resolvedApiUrl}/api/auth/:path*` },
      { source: '/api/admin/:path*', destination: `${resolvedApiUrl}/api/admin/:path*` },
      { source: '/api/tenant/:path*', destination: `${resolvedApiUrl}/api/tenant/:path*` },
      { source: '/api/notifications/:path*', destination: `${resolvedApiUrl}/api/notifications/:path*` },
      { source: '/api/security/:path*', destination: `${resolvedApiUrl}/api/security/:path*` },
      { source: '/api/billing/:path*', destination: `${resolvedApiUrl}/api/billing/:path*` },
      { source: '/api/tenant-config/:path*', destination: `${resolvedApiUrl}/api/tenant-config/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, x-tenant',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

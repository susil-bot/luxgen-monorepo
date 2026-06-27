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
  /** Prevent bundling server-only packages into RSC/API server compilation issues */
  serverExternalPackages: ['@luxgen/agent', 'ioredis', 'mongodb'],
  /** Allow _next assets when browsing via tenant subdomains (demo.localhost:3000) */
  allowedDevOrigins: devAllowedOrigins(),
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  transpilePackages: [
    '@luxgen/ui',
    '@luxgen/agent',
    '@luxgen/design-tokens',
    '@luxgen/storefront',
    '@luxgen/automation-flow',
  ],
  experimental: {
    externalDir: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer, webpack }) => {
    // @luxgen/agent pulls ioredis → Node built-ins; never ship to the browser bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@luxgen/agent': path.resolve(__dirname, 'lib/agent-client-stub.ts'),
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer/'),
        dns: false,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
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
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

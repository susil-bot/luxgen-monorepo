/** @type {import('next').NextConfig} */
const { apiUrl } = require('@luxgen/config/urls.cjs');

const nextConfig = {
  output: 'standalone',
  /** Allow _next assets when browsing via tenant subdomains (demo.localhost:3000) */
  allowedDevOrigins: ['demo.localhost', 'idea-vibes.localhost', 'localhost', '127.0.0.1'],
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  transpilePackages: ['@luxgen/ui', '@luxgen/agent', '@luxgen/design-tokens'],
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
    // graphql-ws → ws requires the buffer polyfill in the browser bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer/'),
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

/** @type {import('next').NextConfig} */
const { apiUrl } = require('@luxgen/config/urls.cjs');

const nextConfig = {
  output: 'standalone',
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  transpilePackages: ['@luxgen/ui', '@luxgen/agent'],
  experimental: {
    externalDir: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const resolvedApiUrl = apiUrl();
    return [
      { source: '/api/graphql', destination: `${resolvedApiUrl}/graphql` },
      { source: '/api/auth/:path*', destination: `${resolvedApiUrl}/api/auth/:path*` },
      { source: '/api/admin/:path*', destination: `${resolvedApiUrl}/api/admin/:path*` },
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

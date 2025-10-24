/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  transpilePackages: ['@luxgen/ui'],
  experimental: {
    externalDir: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/graphql',
        destination: 'http://luxgen-api:4000/graphql',
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://luxgen-api:4000/api/auth/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://luxgen-api:4000/api/admin/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

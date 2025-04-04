/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'userId',
            missing: true,
          },
        ],
      },
    ];
  },
  // Add Vercel-specific configurations
  output: 'standalone',
  poweredByHeader: false,
  generateEtags: false,
};

module.exports = nextConfig; 
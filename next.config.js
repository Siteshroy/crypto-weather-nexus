/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
};

module.exports = nextConfig; 
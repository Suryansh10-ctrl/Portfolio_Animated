/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/landing-pages/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/leadership',
        destination: '/achievements',
        permanent: false,
      },
      {
        source: '/books/leadership',
        destination: '/achievements',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

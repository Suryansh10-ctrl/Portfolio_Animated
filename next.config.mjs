/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

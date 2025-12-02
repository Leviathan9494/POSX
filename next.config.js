/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: ['cdn.shoplightspeed.com', 'placehold.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shoplightspeed.com',
        pathname: '/shops/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },
  // Ensure API routes are not statically generated
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
}

module.exports = nextConfig

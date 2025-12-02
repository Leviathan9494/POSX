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
    domains: ['cdn.shoplightspeed.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shoplightspeed.com',
        pathname: '/shops/**',
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

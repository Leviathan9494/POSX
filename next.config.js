/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
}

module.exports = nextConfig

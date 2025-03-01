/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['api.ryzendesu.vip'],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
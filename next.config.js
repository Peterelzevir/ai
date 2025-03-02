/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Tambahkan ini untuk Netlify
  images: {
    domains: ['api.ryzendesu.vip'],
  },
};
module.exports = nextConfig;

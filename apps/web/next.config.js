/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@health-ocean/types', '@health-ocean/ui'],
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
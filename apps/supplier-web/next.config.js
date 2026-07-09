/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@suqya/i18n', '@suqya/shared-types'],
};

module.exports = nextConfig;

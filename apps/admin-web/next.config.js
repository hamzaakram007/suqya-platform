/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@suqya/design-tokens',
    '@suqya/i18n',
    '@suqya/shared-types',
    '@suqya/ui-kit',
  ],
};

module.exports = nextConfig;

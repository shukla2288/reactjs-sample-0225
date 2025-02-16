/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['picsum.photos'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'undici': false,
    };
    return config;
  },
}

module.exports = nextConfig 
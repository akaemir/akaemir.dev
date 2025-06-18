/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'; 

const nextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
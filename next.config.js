/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'; 

const nextConfig = {
  // basePath: isProd ? "/akaemir.dev" : "", // disabled for cloudflare
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  env: {
    // NEXT_PUBLIC_BASE_PATH: isProd ? "/akaemir.dev" : "", // disabled for cloudflare
  },
};

module.exports = nextConfig;
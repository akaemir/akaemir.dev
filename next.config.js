/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'; 

const nextConfig = {
  basePath: isProd ? "/akaemir.dev" : '',
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? "/akaemir.dev" : '',
  },
};

module.exports = nextConfig;
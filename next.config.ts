import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // Allow any path on this host
      },
    ],
  },
  // Configure port and asset path properly
  assetPrefix: process.env.NODE_ENV !== 'production' ? 'http://localhost:3001' : '',
  // Required for handling hydration properly
  reactStrictMode: true,
  // Explicitly set public path for assets
  publicRuntimeConfig: {
    basePath: '',
    assetPrefix: process.env.NODE_ENV !== 'production' ? 'http://localhost:3001' : '',
  },
};

export default nextConfig;

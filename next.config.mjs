/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  // Add HTML metadata for better cross-browser color handling
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self';"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Color-Profile',
            value: 'srgb'
          }
        ],
      },
    ]
  },
  // Disable ESLint during builds - this is especially important for production builds
  eslint: {
    // Don't run ESLint during production builds
    ignoreDuringBuilds: true,
  },
}

export default nextConfig; 
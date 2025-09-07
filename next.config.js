/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  images: {
    // Opsi 1: Allow semua domain (tidak disarankan untuk production)
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
}

module.exports = nextConfig

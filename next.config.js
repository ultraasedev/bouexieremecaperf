// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
    ],
    domains: ['ui-avatars.com'],
  },
  typescript: {
    // ignorer les erreurs TypeScript pendant le build si nécessaire
    // ignoreBuildErrors: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  // Configuration pour le build
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  // Gestion des erreurs
  onDemandEntries: {
    // Période pendant laquelle une page doit rester inutilisée avant d'être disposée
    maxInactiveAge: 25 * 1000,
    // Nombre de pages qui doivent être maintenues en mémoire
    pagesBufferLength: 2,
  }
}

module.exports = nextConfig;
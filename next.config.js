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
      {
        protocol: 'https',
        hostname: 'www.carqueryapi.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  typescript: {
    // ignoreBuildErrors: true,
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },

  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/insee/:path*',
        destination: 'https://api.insee.fr/:path*'
      },
    ];
  },

  experimental: {
    optimizePackageImports: ['@heroicons/react/24/outline', '@heroicons/react/24/solid', 'lucide-react'],
  },

  generateEtags: true,
  compress: true,

  async redirects() {
    return [];
  },

  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;

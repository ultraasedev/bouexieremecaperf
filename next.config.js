// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration des images : définit quelles sources d'images sont autorisées
  images: {
    remotePatterns: [
      {
        // Configuration pour les avatars générés
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
      {
        // Configuration pour l'API de voitures
        protocol: 'https',
        hostname: 'www.carqueryapi.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Liste des domaines autorisés pour les images (méthode alternative/legacy)
    domains: ['ui-avatars.com', 'www.carqueryapi.com'],
  },

  // Configuration TypeScript
  typescript: {
    // Décommentez pour ignorer les erreurs TypeScript pendant le build
    // Utile en production si vous avez des erreurs non critiques
    // ignoreBuildErrors: true,
  },

  // Configuration Webpack : permet d'utiliser des fichiers SVG comme composants
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },

  // Configuration du build
  output: 'standalone', // Optimise le build pour le déploiement
  poweredByHeader: false, // Retire l'en-tête X-Powered-By pour la sécurité
  reactStrictMode: true, // Active le mode strict de React pour de meilleures performances

  // Configuration des en-têtes CORS pour l'API
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          // Permet les requêtes avec credentials
          { key: "Access-Control-Allow-Credentials", value: "true" },
          // Permet toutes les origines
          { key: "Access-Control-Allow-Origin", value: "*" },
          // Méthodes HTTP autorisées
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          // En-têtes autorisés
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ];
  },

  // Configuration des redirections d'API (proxy)
  async rewrites() {
    return [
      {
        // Redirige les requêtes API vers CarQuery
        source: '/api/cars/:path*',
        destination: 'https://www.carqueryapi.com/api/0.3/:path*',
      },
    ];
  },

  // Configuration de la gestion des pages à la demande
  onDemandEntries: {
    // Durée pendant laquelle une page reste en mémoire
    maxInactiveAge: 25 * 1000,
    // Nombre maximum de pages en mémoire
    pagesBufferLength: 2,
  },

  // Fonctionnalités expérimentales
  experimental: {
    appDir: true, // Utilise le nouveau router App
    serverActions: true, // Active les actions serveur
    serverComponentsExternalPackages: [], // Packages externes pour les composants serveur
  },

  // Configuration du cache
  generateEtags: true, // Génère des ETags pour le cache du navigateur

  // Compression des assets
  compress: true, // Active la compression Gzip

  // Configuration des redirections
  async redirects() {
    return []; // Ajouter ici les redirections si nécessaire
  },

  // Indicateurs de développement
  devIndicators: {
    // Affiche l'activité de build en développement
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },

  // Configuration de sécurité
  security: {
    headers: {
      contentSecurityPolicy: {
        directives: {
          // Politique de sécurité du contenu
          defaultSrc: ["'self'"], // Autorise uniquement les ressources de même origine
          scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'"], // Sources de scripts autorisées
          styleSrc: ["'self'", "'unsafe-inline'"], // Sources de styles autorisées
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'], // Sources d'images autorisées
          connectSrc: ["'self'", 'https:', 'wss:'], // Connexions autorisées
        },
      },
    },
  },

  // Configuration de production
  productionBrowserSourceMaps: false, // Désactive les source maps en production

  // Optimisations
  optimizeFonts: true, // Optimise le chargement des polices
  swcMinify: true, // Utilise SWC pour la minification (plus rapide que Terser)

  // Import optimisé des icônes
  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}',
    },
  },
};

module.exports = nextConfig;
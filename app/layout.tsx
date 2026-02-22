import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster"
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bouexiere-meca-perf.fr';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Bouëxière Méca Performance | Mécanique & Performance Auto',
    template: '%s | Bouëxière Méca Performance',
  },
  description: 'Garage spécialisé en mécanique automobile, reprogrammation moteur, préparation et pièces performance à La Bouëxière près de Rennes (35). Devis gratuit.',
  keywords: ['mécanique automobile', 'reprogrammation moteur', 'performance auto', 'La Bouëxière', 'Rennes', 'Dinan', 'tuning', 'préparation moteur', 'garage auto 35'],
  authors: [{ name: 'Bouëxière Méca Performance' }],
  openGraph: {
    title: 'Bouëxière Méca Performance | Mécanique & Performance Auto',
    description: 'Garage spécialisé en mécanique automobile, reprogrammation moteur et préparation performance à La Bouëxière près de Rennes.',
    url: '/',
    siteName: 'Bouëxière Méca Performance',
    images: [
      {
        url: '/images/logoe.jpg',
        width: 1200,
        height: 630,
        alt: 'Bouëxière Méca Performance',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bouëxière Méca Performance',
    description: 'Mécanique automobile, reprogrammation moteur et performance auto à La Bouëxière (35).',
    images: ['/images/logoe.jpg'],
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AutoRepair',
  name: 'Bouëxière Méca Performance',
  description: 'Garage spécialisé en mécanique automobile, reprogrammation moteur, préparation et pièces performance.',
  url: siteUrl,
  logo: `${siteUrl}/images/logoe.jpg`,
  image: `${siteUrl}/images/logoe.jpg`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'La Bouëxière',
    addressRegion: 'Bretagne',
    postalCode: '35340',
    addressCountry: 'FR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 48.1833,
    longitude: -1.4333,
  },
  areaServed: [
    { '@type': 'City', name: 'La Bouëxière' },
    { '@type': 'City', name: 'Rennes' },
    { '@type': 'City', name: 'Dinan' },
    { '@type': 'City', name: 'Vitré' },
  ],
  priceRange: '€€',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '12:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '14:00',
      closes: '19:00',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

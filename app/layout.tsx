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

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Bouexière Meca Performance',
  description: 'Spécialiste de la performance automobile, tuning, et préparation moteur.',
  openGraph: {
    title: 'Bouexière Meca Performance - Spécialiste de la performance automobile',
    description: 'Découvrez nos services de tuning, préparation moteur, et modifications de performance pour véhicules de toutes marques.',
    url: '/',
    images: [
      {
        url: '/images/logoe.jpg',
        width: 1200,
        height: 630,
        alt: 'Bouexière Meca Performance - Image Open Graph',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bouexière Meca Performance',
    description: 'Améliorez les performances de votre véhicule avec nos services spécialisés.',
    images: ['/logoe.jpg'],
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

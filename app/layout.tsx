import type { Metadata } from "next";
import localFont from "next/font/local";
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
  title: "BOUEXIERE MECA PERF | Votre Mecanicien Prestige a Domicile",
  description:
    "BouexiereMecaPerf, votre service de mécanique itinérante premium, expert en diagnostic, montage de pièces et reprogrammation moteur (bientôt disponible). Prenez rendez-vous en ligne avec un professionnel de confiance.",
  keywords:
    "BouexiereMecaPerf, mécanicien itinérant, montage de pièces, diagnostic auto, mécanique auto, reprogrammation moteur, service premium, mécanique à domicile",
  robots: "index, follow",
  openGraph: {
    type: "website",
    title: "BouexiereMecaPerf - Mécanicien Itinérant Premium",
    description:
      "Confiez votre véhicule à BouexiereMecaPerf, un expert en mécanique itinérante, diagnostic et montage de pièces premium. Prise de rendez-vous rapide et simple en ligne.",
    url: "https://www.bouexieremecaperf.com",
    images: [
      {
        url: "/logoe.jpg",
        width: 1200,
        height: 630,
        alt: "BouexiereMecaPerf - Mécanicien Itinérant Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BouexiereMecaPerf - Mécanicien Itinérant Premium",
    description:
      "Service de mécanique itinérante premium pour diagnostic, montage de pièces, et reprogrammation moteur. Prenez rendez-vous en ligne avec BouexiereMecaPerf.",
    images: ["/logoe.jpg"],
  },
  icons: {
    icon: "/logoe.jpg",
    shortcut: "/logoe.jpg",
    apple: "/logoe.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

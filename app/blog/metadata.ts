// app/blog/metadata.ts
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Mécanique & Performance | Bouëxière Méca Perf',
  description: 'Découvrez nos articles sur la mécanique automobile, la performance moteur, et les conseils d\'entretien. Expertise technique et guides pratiques.',
  openGraph: {
    title: 'Blog Mécanique & Performance | Bouëxière Méca Perf',
    description: 'Découvrez nos articles sur la mécanique automobile, la performance moteur, et les conseils d\'entretien. Expertise technique et guides pratiques.',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: 'https://bouexiere-meca-perf.fr/og-blog.jpg',
        width: 1200,
        height: 630,
        alt: 'Bouëxière Méca Perf Blog',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Mécanique & Performance | Bouëxière Méca Perf',
    description: 'Découvrez nos articles sur la mécanique automobile, la performance moteur, et les conseils d\'entretien.',
    images: ['https://bouexiere-meca-perf.fr/og-blog.jpg'],
  }
};

// Fonction pour générer les métadonnées dynamiques pour les articles individuels
export function generateArticleMetadata(title: string, excerpt: string, image: string, date: string) {
  return {
    title: `${title} | Bouëxière Méca Perf`,
    description: excerpt,
    openGraph: {
      title,
      description: excerpt,
      type: 'article',
      publishedTime: date,
      authors: ['Bouëxière Méca Perf'],
      images: [
        {
          url: `https://bouexiere-meca-perf.fr${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: excerpt,
      images: [`https://bouexiere-meca-perf.fr${image}`],
    },
  };
}
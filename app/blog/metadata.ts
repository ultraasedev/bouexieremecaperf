// app/blog/metadata.ts
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog Mécanique & Performance',
  description: 'Articles sur la mécanique automobile, la performance moteur et les conseils d\'entretien. Expertise technique et guides pratiques.',
  openGraph: {
    title: 'Blog Mécanique & Performance | Bouëxière Méca Performance',
    description: 'Articles sur la mécanique automobile, la performance moteur et les conseils d\'entretien.',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: '/images/logoe.jpg',
        width: 1200,
        height: 630,
        alt: 'Bouëxière Méca Performance Blog',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Mécanique & Performance | Bouëxière Méca Performance',
    description: 'Articles sur la mécanique automobile, la performance moteur et les conseils d\'entretien.',
    images: ['/images/logoe.jpg'],
  },
};

export function generateArticleMetadata(title: string, excerpt: string, image: string, date: string) {
  return {
    title,
    description: excerpt,
    openGraph: {
      title,
      description: excerpt,
      type: 'article',
      publishedTime: date,
      authors: ['Bouëxière Méca Performance'],
      images: [
        {
          url: image,
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
      images: [image],
    },
  };
}

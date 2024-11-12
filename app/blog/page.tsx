// app/blog/page.tsx
import type { Metadata } from 'next';
import BlogList from '@/components/blog/BlogList';

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
};

export default function BlogPage() {
  return 
  <BlogList />;
}
// app/mentions-legales/page.tsx
import type { Metadata } from 'next';
import MentionsLegales from '@/components/MentionsLegales';

export const metadata: Metadata = {
  title: 'Mentions Légales | Bouëxière Méca Perf',
  description: 'Mentions légales de Bouëxière Méca Perf - Service de mécanique automobile premium',
  openGraph: {
    title: 'Mentions Légales | Bouëxière Méca Perf',
    description: 'Mentions légales de Bouëxière Méca Perf - Service de mécanique automobile premium',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function Page() {
  return <MentionsLegales />;
}
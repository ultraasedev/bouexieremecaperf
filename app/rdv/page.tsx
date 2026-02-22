// app/rdv/page.tsx
import type { Metadata } from 'next';
import RendezVous from '@/components/rdv/RendezVous';

export const metadata: Metadata = {
  title: 'Prendre Rendez-vous | Bouëxière Méca Perf',
  description: 'Réservez votre rendez-vous pour un diagnostic, une réparation mécanique ou une optimisation performance.',
  openGraph: {
    title: 'Prendre Rendez-vous | Bouëxière Méca Perf',
    description: 'Réservez votre rendez-vous pour un diagnostic, une réparation mécanique ou une optimisation performance.',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function Page() {
  return <RendezVous />;
}
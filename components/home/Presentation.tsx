// components/home/Presentation.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

export function Presentation() {
    return (
      <section className="bg-black py-24">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-red-600 uppercase tracking-wider text-sm font-semibold">NOTRE QUALITÉ</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-6">
              POURQUOI NOUS<br />
              FAIRE CONFIANCE ?
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Fort d'une expérience solide dans la mécanique premium, nous nous distinguons par notre service mobile unique qui s'adapte à votre emploi du temps. Notre expertise technique, combinée à l'utilisation d'outils de diagnostic de dernière génération, garantit des interventions précises et efficaces directement à votre domicile ou sur votre lieu de travail dans toute la région de Dinan.
            </p>
            <Link 
              href="/rdv" 
              className="inline-block bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3 font-semibold transition-colors"
            >
              PRENDRE RENDEZ-VOUS →
            </Link>
          </div>
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <Image
              src="/presentation.jpg"
              alt="Mécanicien expert"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    );
  }
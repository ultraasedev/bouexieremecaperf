'use client';
import Image from 'next/image';
import { ArrowUpRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRef } from 'react';

const services = [
  {
    title: 'DIAGNOSTIC',
    image: '/services/diagnostic.jpg',
    description: 'Diagnostic électronique complet de votre véhicule avec les derniers outils professionnels pour une détection précise.',
  },
  {
    title: 'MÉCANIQUE',
    image: '/services/mecanique.jpg',
    description: 'Entretien et réparation de votre véhicule par un expert passionné avec une garantie de qualité premium.',
  },
  {
    title: 'PIÈCES PREMIUM',
    image: '/services/powder.jpg',
    description: 'Installation de pièces haute performance sélectionnées pour optimiser les performances de votre véhicule.',
  },
  {
    title: 'FREINAGE',
    image: '/services/freinage.jpg',
    description: 'Upgrade et maintenance de vos systèmes de freinage pour une sécurité et des performances optimales.',
  },
  {
    title: 'REPROGRAMMATION',
    image: '/services/performance.jpg',
    description: 'Optimisation moteur sur mesure pour améliorer les performances et la consommation de votre véhicule.',
    comingSoon: true,
  },
  {
    title: 'ENTRETIEN',
    image: '/services/maintenance.jpg',
    description: 'Maintenance préventive et suivi régulier pour garantir la fiabilité et la longévité de votre véhicule.',
  },
];

export default function Services() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-black py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-16">
          <span className="text-red-600 uppercase tracking-wider text-sm font-semibold">NOS SERVICES</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2">
            UNE GAMME COMPLÈTE<br />
            DE SERVICES PREMIUM
          </h2>
        </div>

        {/* Carousel de services */}
        <div className="relative">
          <button 
            onClick={() => scroll('left')} 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70"
          >
            <ChevronLeftIcon className="h-6 w-6 text-white" />
          </button>
          <button 
            onClick={() => scroll('right')} 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70"
          >
            <ChevronRightIcon className="h-6 w-6 text-white" />
          </button>

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto hide-scrollbar gap-6 px-4 snap-x snap-mandatory"
          >
            {services.map((service, index) => (
              <div 
                key={index}
                className="min-w-[300px] md:min-w-[350px] bg-[#111] rounded-lg overflow-hidden snap-start relative"
              >
                <div className="relative h-[200px] group">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRightIcon className="h-5 w-5 text-white" />
                  </div>
                  {service.comingSoon && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      SERVICE PROCHAINEMENT DISPONIBLE
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-gray-400">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-center gap-4 mt-12">
          <button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3 font-semibold">
            PRENDRE RENDEZ-VOUS
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white rounded-full px-8 py-3 font-semibold">
            VOIR NOS SERVICES
          </button>
        </div>
      </div>
    </section>
  );
}

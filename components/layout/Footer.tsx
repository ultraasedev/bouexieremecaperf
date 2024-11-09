'use client';

import Image from 'next/image';
import Link from 'next/link';
export function Footer() {
    return (
      <footer className="bg-black pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
            <div>
              <h3 className="text-white font-bold mb-6">NAVIGATION</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Link href="/" className="block text-gray-400 hover:text-white">Accueil</Link>
                  <Link href="/services" className="block text-gray-400 hover:text-white">Services</Link>
                  <Link href="/blog" className="block text-gray-400 hover:text-white">Blog</Link>
                  <Link href="/about" className="block text-gray-400 hover:text-white">À propos</Link>
                </div>
                <div className="space-y-3">
                  <Link href="/contact" className="block text-gray-400 hover:text-white">Contact</Link>
                  <Link href="/rdv" className="block text-gray-400 hover:text-white">Rendez-vous</Link>
                  <Link href="/mentions-legales" className="block text-gray-400 hover:text-white">Mentions légales</Link>
                </div>
              </div>
            </div>
  
            <div>
              <h3 className="text-white font-bold mb-6">CONTACT</h3>
              <div className="space-y-3 text-gray-400">
                <p>06 61 86 55 43</p>
                <p>contact@bouexiere-meca-perf.fr</p>
              </div>
            </div>
  
            <div>
              <Image
                src="/logo.png"
                alt="Bouëxière Méca Perf"
                width={200}
                height={80}
                className="mb-6"
              />
              <p className="text-gray-400">
                Service de mécanique premium et mobile<br />
                Intervention à domicile sur toute les Cotes d'Armor et L'ille-Et-Vilaine
              </p>
            </div>
          </div>
  
          <div className="pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 Bouëxière Méca Perf - Tous droits réservés</p>
          </div>
        </div>
      </footer>
    );
  }
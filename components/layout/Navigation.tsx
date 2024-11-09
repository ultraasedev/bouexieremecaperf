// components/layout/Navigation.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Services', href: '#services' },
  { name: 'Performance', href: '#performance' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '#contact' },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Gestion du scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Empêcher le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  return (
    <header 
      className={`fixed w-full z-50 top-0 transition-all duration-300 ${
        isScrolled ? 'bg-black shadow-lg' : 'bg-transparent'
      }`}
    >
      {/* Container principal avec padding adaptatif */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <nav className="flex items-center justify-between h-16 sm:h-20 lg:h-24" aria-label="Global">
          {/* Logo avec tailles responsives */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-shrink-0"
          >
            <Link href="/" className="relative block">
              <span className="sr-only">KB Performance</span>
              <div className={`relative transition-all duration-300 ${
                isScrolled 
                  ? 'w-[80px] xs:w-[220px] sm:w-[270px] md:w-["400px]' 
                  : 'w-[120px] xs:w-[270px] sm:w-[300px] md:w-[330px] lg:w-[350px]'
              }`}>
                <img
                  src="/logo.png"
                  alt="KB Performance"
                  className="w-full h-auto object-contain"
                />
              </div>
            </Link>
          </motion.div>

          {/* Bouton menu mobile avec taille adaptée */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-1.5 sm:p-2.5 text-white hover:bg-red-600/10 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Ouvrir le menu</span>
              <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation desktop */}
          <div className="hidden lg:flex lg:items-center lg:gap-8 xl:gap-12">
            <div className="flex gap-x-4 xl:gap-x-8 items-center">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-semibold leading-6 text-white hover:text-red-500 transition-colors relative group whitespace-nowrap ${
                    pathname === item.href ? 'text-red-500' : ''
                  }`}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all group-hover:w-full" />
                </Link>
              ))}
            </div>
            {/* Bouton RDV desktop avec taille adaptative */}
            <Link
              href="/rdv"
              className="rounded-full bg-red-600 px-4 py-2 lg:px-6 lg:py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-red-500 transition-colors ml-4 whitespace-nowrap"
            >
              Prendre RDV
            </Link>
          </div>
        </nav>
      </div>

      {/* Menu mobile optimisé */}
      <Dialog 
        as="div" 
        className="lg:hidden" 
        open={mobileMenuOpen} 
        onClose={setMobileMenuOpen}
      >
        {/* Overlay avec blur */}
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
        
        {/* Panneau mobile avec largeur adaptative */}
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-[280px] xs:w-[320px] sm:w-[380px] overflow-y-auto bg-black/95 px-4 xs:px-6 py-4 xs:py-6">
          <div className="flex items-center justify-between">
            {/* Logo mobile avec taille adaptative */}
            <Link 
              href="/" 
              className="block" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">KB Performance</span>
              <div className="h-[60px] xs:h-[160px] sm:h-[200px] w-auto">
                <img
                  src="/logo.png"
                  alt="KB Performance"
                  className="h-full w-auto object-contain"
                />
              </div>
            </Link>
            
            {/* Bouton fermer adaptatif */}
            <button
              type="button"
              className="rounded-md p-1.5 xs:p-2.5 text-white hover:bg-red-600/10 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Fermer le menu</span>
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Menu mobile avec espacement adaptatif */}
          <div className="mt-4 xs:mt-6 flow-root">
            <div className="space-y-1 xs:space-y-2 py-4 xs:py-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group -mx-3 block rounded-lg px-3 py-1.5 xs:py-2 text-base font-semibold leading-7 text-white hover:bg-red-600/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {/* Bouton RDV mobile avec taille adaptative */}
              <div className="mt-6 xs:mt-8">
                <Link
                  href="/rdv"
                  className="w-full rounded-full bg-red-600 px-4 py-2 xs:px-6 xs:py-3 text-center text-sm font-semibold text-white shadow-lg hover:bg-red-500 transition-colors block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Prendre RDV
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
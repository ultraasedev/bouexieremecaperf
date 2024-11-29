// app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import { Loader2 } from 'lucide-react';
import type { UserPayload } from '@/types/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Vérification de l'authentification
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/login', {
          credentials: 'include',
        });

        if (!response.ok) {
          router.push('/login');
          return;
        }

        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Erreur:', error);
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  // État de chargement
  if (!user) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">BM</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Bouexière Méca Perf
          </h1>
        </div>
        
        {/* Loader */}
        <div className="relative">
          {/* Cercle de fond */}
          <div className="absolute inset-0 w-16 h-16 border-4 border-gray-800 rounded-full"></div>
          
          {/* Cercle animé principal */}
          <div className="w-16 h-16">
            <div className="absolute inset-0 border-4 border-red-900 rounded-full animate-spin border-t-transparent"></div>
          </div>
          
          {/* Effet de pulse */}
          <div className="absolute inset-0 w-16 h-16">
            <div className="absolute inset-0 border-4 border-red-700 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>
        
        {/* Texte de chargement */}
        <p className="mt-6 text-gray-400 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement de votre espace...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Sidebar */}
      <Sidebar 
        user={user}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Contenu principal */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <Topbar 
          user={user}
          onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
        />
        
        {/* Zone de contenu principale */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <div className="max-w-[2000px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
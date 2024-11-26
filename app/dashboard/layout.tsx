// app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import Loading from '@/components/shared/loading';
import type { UserPayload } from '@/types/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const router = useRouter();

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

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-8">
          Bouexière Méca Perf
        </h1>
        
        <div className="relative">
          <div className="absolute inset-0 w-16 h-16 border-4 border-gray-800 rounded-full"></div>
          <div className="w-16 h-16">
            <div className="absolute inset-0 border-4 border-red-900 rounded-full animate-spin border-t-transparent"></div>
            <div className="absolute inset-0 border-4 border-red-700 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>
        
        <p className="mt-4 text-gray-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C1C1C] text-white">
      <div className="flex h-screen overflow-hidden">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar user={user} />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
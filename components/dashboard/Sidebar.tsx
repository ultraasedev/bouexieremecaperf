// components/dashboard/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { UserPayload } from '@/types/auth';
import { 
  Squares2X2Icon,
  BellIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  NewspaperIcon,
  PhotoIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface MenuItem {
  name: string;
  icon: any;
  href: string;
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  user: UserPayload;
}


export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const menuSections: MenuSection[] = [
    {
      title: 'TABLEAU DE BORD',
      items: [
        {
          name: 'Vue générale',
          icon: Squares2X2Icon,
          href: '/dashboard',
        },
        {
          name: 'Notifications',
          icon: BellIcon,
          href: '/dashboard/notifications',
          badge: 4 // Nombre de nouvelles notifications
        },
      ]
    },
    {
      title: 'GESTION',
      items: [
        {
          name: 'Rendez-vous',
          icon: CalendarDaysIcon,
          href: '/dashboard/appointments',
          badge: 2 // Nombre de nouveaux RDV
        },
        {
          name: 'Devis',
          icon: DocumentTextIcon,
          href: '/dashboard/quotes',
          badge: 3 // Devis en attente
        },
        {
          name: 'Factures',
          icon: CurrencyEuroIcon,
          href: '/dashboard/invoices',
        },
        {
          name: 'Clients',
          icon: UserGroupIcon,
          href: '/dashboard/clients',
        },
        {
          name: 'Services',
          icon: WrenchScrewdriverIcon,
          href: '/dashboard/services',
        },
        {
          name: 'Performance',
          icon: ChartBarIcon,
          href: '/dashboard/performance',
        },
      ]
    },
    {
      title: 'CONTENU',
      items: [
        {
          name: 'Blog',
          icon: NewspaperIcon,
          href: '/dashboard/blog',
        },
        {
          name: 'Médias',
          icon: PhotoIcon,
          href: '/dashboard/media',
        },
      ]
    },
    {
      title: 'ADMIN',
      items: [
        {
          name: 'Paramètres',
          icon: Cog6ToothIcon,
          href: '/dashboard/settings',
        },
        {
          name: 'Déconnexion',
          icon: ArrowRightOnRectangleIcon,
          href: '/api/auth/signout',
        },
      ]
    },
  ];

  return (
    <div className="w-64 min-h-screen bg-black border-r border-white/10">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center border-b border-white/10">
        <Link href="/" className="text-xl font-semibold text-white">
          Bouëxiere Meca Perf
        </Link>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-8">
        {menuSections.map((section, index) => (
          <div key={index}>
            <h3 className="text-xs text-gray-500 font-medium mb-3">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm group transition-colors ${
                      isActive 
                        ? 'text-white bg-white/10' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
}

// components/dashboard/Topbar.tsx
import { Bell, Search, ChevronDown, LogOut, Settings, Menu, User } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type { UserPayload } from '@/types/auth';

interface TopbarProps {
  user: UserPayload;
  onMobileMenuToggle: () => void;
}

// Titres des pages pour le breadcrumb
const pageTitles: Record<string, string> = {
  '/dashboard': "Vue d'ensemble",
  '/dashboard/appointments': 'Rendez-vous',
  '/dashboard/clients': 'Clients',
  '/dashboard/quotes': 'Devis',
  '/dashboard/quotes/create': 'Nouveau devis',
  '/dashboard/factures': 'Factures',
  '/dashboard/factures/create': 'Nouvelle facture',
  '/dashboard/paiements': 'Paiements',
  '/dashboard/mecanique': 'Mécanique',
  '/dashboard/pieces': 'Pièces Premium',
  '/dashboard/reprog': 'Reprog & Carto',
  '/dashboard/blog': 'Blog',
  '/dashboard/slider': 'Slider',
  '/dashboard/presentation': 'Présentation',
  '/dashboard/faq': 'FAQ',
  '/dashboard/reviews': 'Avis clients',
  '/dashboard/emails': 'Messagerie',
  '/dashboard/messages': 'Messages',
  '/dashboard/settings': 'Paramètres',
};

export default function Topbar({ user, onMobileMenuToggle }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const pageTitle = pageTitles[pathname] || 'Dashboard';

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const initials = user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="h-14 border-b border-gray-800/60 px-4 sm:px-6 flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-40">
      {/* Gauche : Menu Mobile + Titre page */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 shrink-0 hover:bg-gray-800"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden sm:flex items-center gap-2 min-w-0">
          <h1 className="text-base font-semibold text-white truncate">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Centre : Recherche */}
      <div className="hidden md:block flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Rechercher clients, devis, factures..."
            className="pl-9 h-9 bg-white/5 border-gray-800/60 text-white text-sm placeholder:text-gray-500 focus:bg-white/10 focus:border-gray-700 transition-colors"
          />
        </div>
      </div>

      {/* Droite : Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 hover:bg-white/5"
            >
              <Bell className="h-[18px] w-[18px] text-gray-400" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-[#0a0a0a]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-[#1a1a1a] border-gray-800 text-white">
            <DropdownMenuLabel className="text-gray-400 font-normal text-xs">
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-800" />
            <div className="py-6 text-center">
              <Bell className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Aucune notification</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Séparateur */}
        <div className="hidden sm:block h-6 w-px bg-gray-800" />

        {/* Profil */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2.5 hover:bg-white/5 px-2 h-9"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-700 text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white leading-tight">{user.name}</p>
                <p className="text-[10px] text-gray-500 leading-tight">
                  {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-gray-500 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#1a1a1a] border-gray-800 text-white">
            {/* Info mobile */}
            <div className="sm:hidden px-3 py-2">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">
                {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </p>
            </div>
            <DropdownMenuSeparator className="sm:hidden bg-gray-800" />

            <Link href="/dashboard/settings">
              <DropdownMenuItem className="hover:bg-white/5 cursor-pointer focus:bg-white/5 py-2.5">
                <Settings className="mr-2.5 h-4 w-4 text-gray-400" />
                <span>Paramètres</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="hover:bg-red-500/10 cursor-pointer focus:bg-red-500/10 text-red-400 focus:text-red-400 py-2.5"
            >
              <LogOut className="mr-2.5 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

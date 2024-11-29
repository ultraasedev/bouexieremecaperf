// components/dashboard/Topbar.tsx
import { Bell, Search, ChevronDown, LogOut, Settings, Menu, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { UserPayload } from '@/types/auth';

interface TopbarProps {
  user: UserPayload;
  onMobileMenuToggle: () => void;
}

export default function Topbar({ user, onMobileMenuToggle }: TopbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="h-16 border-b border-gray-800 px-4 sm:px-6 flex items-center justify-between bg-black sticky top-0 z-40">
      {/* Menu Mobile & Recherche */}
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-8 bg-[#2B2B2B] border-none text-white w-full"
          />
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-[#2B2B2B]"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 bg-[#2B2B2B] border-gray-800 text-white p-4">
            <p className="text-gray-400 text-sm text-center">
              Vous n'avez pas de notifications
            </p>
          </HoverCardContent>
        </HoverCard>
        
        {/* Profil */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost"
              className="flex items-center gap-3 hover:bg-[#2B2B2B] p-2"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">
                  {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                </p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-red-900">
                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#2B2B2B] border-gray-800 text-white">
            <div className="sm:hidden px-2 py-1.5">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">
                {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </p>
            </div>
            <DropdownMenuSeparator className="sm:hidden bg-gray-800" />
            <Link href="/dashboard/settings">
              <DropdownMenuItem className="hover:bg-red-900 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="hover:bg-red-900 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

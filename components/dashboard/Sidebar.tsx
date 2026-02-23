// components/dashboard/Sidebar.tsx
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard, Users, Calendar, FileText,
  Settings, Mail, ImageIcon, LogOut, StarHalf,
  Wrench, Car, Key, BookOpen, Globe, MessageSquare,
  ScrollText, FileQuestion, Receipt, CreditCard,
  X, ChevronRight
} from 'lucide-react';
import type { UserPayload } from '@/types/auth';

interface MenuItem {
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  user: UserPayload;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const menuItems: MenuSection[] = [
  {
    title: "PRINCIPAL",
    items: [
      { title: "Vue d'ensemble", icon: LayoutDashboard, href: "/dashboard" },
      { title: "Rendez-vous", icon: Calendar, href: "/dashboard/appointments" },
    ]
  },
  {
    title: "GESTION CLIENTS",
    items: [
      { title: "Clients", icon: Users, href: "/dashboard/clients" },
      { title: "Devis", icon: ScrollText, href: "/dashboard/quotes" },
      { title: "Factures", icon: Receipt, href: "/dashboard/factures" },
      { title: "Paiements", icon: CreditCard, href: "/dashboard/paiements" },
    ]
  },
  {
    title: "PRESTATIONS",
    items: [
      { title: "Mécanique", icon: Key, href: "/dashboard/mecanique" },
      { title: "Pièces Premium", icon: Wrench, href: "/dashboard/pieces" },
      { title: "Reprog & Carto", icon: Car, href: "/dashboard/reprog", badge: "Bientôt" },
    ]
  },
  {
    title: "SITE WEB",
    items: [
      { title: "Blog", icon: BookOpen, href: "/dashboard/blog" },
      { title: "Slider", icon: ImageIcon, href: "/dashboard/slider" },
      { title: "Présentation", icon: Globe, href: "/dashboard/presentation" },
      { title: "FAQ", icon: FileQuestion, href: "/dashboard/faq" },
      { title: "Avis clients", icon: StarHalf, href: "/dashboard/reviews" },
    ]
  },
  {
    title: "COMMUNICATION",
    items: [
      { title: "Messagerie", icon: Mail, href: "/dashboard/emails" },
      { title: "Messages", icon: MessageSquare, href: "/dashboard/messages" },
    ]
  }
];

export default function Sidebar({ user, isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

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

  return (
    <>
      {/* Overlay pour mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col",
        "bg-gradient-to-b from-[#0a0a0a] to-[#111] border-r border-gray-800/60",
        "transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800/60">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:shadow-red-900/50 transition-shadow">
              <span className="text-white font-bold text-sm tracking-tight">BMP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">Bouexière</span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Méca Performance</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="lg:hidden h-8 w-8 hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Menu scrollable */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-5">
            {menuItems.map((section, i) => (
              <div key={i}>
                <h2 className="px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-[0.15em] mb-2">
                  {section.title}
                </h2>
                <div className="space-y-0.5">
                  {section.items.map((item, j) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={j}
                        href={item.href}
                        onClick={onMobileClose}
                        className={cn(
                          "group flex items-center gap-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 relative",
                          isActive
                            ? "bg-red-600/15 text-white font-medium"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {/* Indicateur actif */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-red-500 rounded-r-full" />
                        )}

                        <item.icon className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                          isActive ? "text-red-400" : "text-gray-500 group-hover:text-gray-300"
                        )} />

                        <span className="truncate">{item.title}</span>

                        {item.badge ? (
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700/50">
                            {item.badge}
                          </span>
                        ) : isActive ? (
                          <ChevronRight className="ml-auto h-3.5 w-3.5 text-red-400/70" />
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer - User & Settings */}
        <div className="border-t border-gray-800/60 p-3 space-y-1">
          <Link
            href="/dashboard/settings"
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-200",
              pathname === "/dashboard/settings"
                ? "bg-red-600/15 text-white font-medium"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Settings className={cn(
              "h-[18px] w-[18px] shrink-0",
              pathname === "/dashboard/settings" ? "text-red-400" : "text-gray-500"
            )} />
            <span>Paramètres</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-x-3 px-3 py-2 text-sm rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </>
  );
}

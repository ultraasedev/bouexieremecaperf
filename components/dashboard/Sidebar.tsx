// components/dashboard/Sidebar.tsx
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Users, Calendar, FileText, 
  Settings, Mail, ImageIcon, LogOut, StarHalf,
  Wrench, Car, Key, BookOpen, Globe, MessageSquare,
  ScrollText, FileQuestion, Receipt, CreditCard,
  Menu, X
} from 'lucide-react';
import type { UserPayload } from '@/types/auth';

interface SidebarProps {
  user: UserPayload;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const menuItems = [
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
  
  return (
    <>
      {/* Overlay pour mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-gray-800 flex flex-col",
        "transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold">BMP</span>
            </div>
            <span className="text-lg font-bold">Bouexière Méca Perf</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu scrollable */}
        <ScrollArea className="flex-1 px-3 py-3">
          <div className="space-y-6">
            {menuItems.map((section, i) => (
              <div key={i} className="mb-6">
                <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {section.title}
                </h2>
                <div className="space-y-1">
                  {section.items.map((item, j) => (
                    <Link
                      key={j}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center gap-x-3 px-4 py-2.5 text-sm rounded-lg transition-all",
                        "hover:bg-red-900/50 active:bg-red-900/70",
                        pathname === item.href 
                          ? "bg-red-900 text-white font-medium" 
                          : "text-gray-400 hover:text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

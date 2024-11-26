// components/dashboard/Sidebar.tsx
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, Users, Calendar, FileText, 
  Settings, Mail, ImageIcon, LogOut, StarHalf,
  Wrench, Car, Key, BookOpen, Globe, MessageSquare,
  ScrollText, FileQuestion, Receipt, CreditCard
} from 'lucide-react';
import type { UserPayload } from '@/types/auth';

interface SidebarProps {
  user: UserPayload;
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

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-black border-r border-gray-800 flex flex-col min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Bouexière Méca Perf</h1>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-6">
          {menuItems.map((section, i) => (
            <div key={i} className="mb-6">
              <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item, j) => (
                  <Link
                    key={j}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-x-3 px-4 py-2 text-sm rounded-lg transition-colors",
                      pathname === item.href 
                        ? "bg-red-900 text-white" 
                        : "text-gray-400 hover:text-white hover:bg-red-900/50"
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
  );
}
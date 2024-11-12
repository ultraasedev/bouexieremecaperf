// components/dashboard/Topbar.tsx
'use client';

import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { UserPayload } from '@/types/auth';

// components/dashboard/Topbar.tsx
interface TopbarProps {
  user: UserPayload;
}

export default function Topbar({ user }: TopbarProps) {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-black border-b border-white/10 px-6 flex items-center justify-between">
      <div className="flex-1 flex items-center">
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Search Anything...."
            className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-white">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-white">{session?.user?.name}</span>
          <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
            <span className="text-white font-semibold">
              {session?.user?.name?.charAt(0) || 'A'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await verifyAuth();

  if (!auth) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-[#111] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

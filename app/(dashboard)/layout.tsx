// app/(dashboard)/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import { UserPayload } from '@/types/auth';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'votre-secret-tres-securise'
);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Vérification et extraction des données utilisateur
    const userPayload: UserPayload = {
      id: payload.id as string,
      email: (payload.email as string) || null,
      name: (payload.name as string) || null,
      role: payload.role as string
    };

    // Vérification de l'expiration
    if (payload.exp && typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        redirect('/login');
      }
    }

    return (
      <div className="flex h-screen bg-black">
        <Sidebar user={userPayload} />
        <div className="flex-1 flex flex-col">
          <Topbar user={userPayload} />
          <main className="flex-1 overflow-auto bg-[#111] p-6">
            {children}
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    redirect('/login');
  }
}
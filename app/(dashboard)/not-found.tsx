// app/(dashboard)/not-found.tsx
import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Page non trouvée</h2>
        <p className="text-gray-400 mb-8">La page que vous recherchez n'existe pas.</p>
        <Link
          href="/dashboard"
          className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-colors"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
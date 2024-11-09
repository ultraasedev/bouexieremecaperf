// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="space-y-6">
          <h1 className="text-9xl font-bold text-red-600">404</h1>
          <h2 className="text-3xl font-bold text-white">Page introuvable</h2>
          <p className="text-gray-400">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

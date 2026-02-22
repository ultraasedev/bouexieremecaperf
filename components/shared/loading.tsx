// components/shared/Loading.tsx
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
      {/* Logo ou texte */}
      <h1 className="text-2xl font-bold text-white mb-8">
        Bouexière Méca Perf
      </h1>
      
      {/* Spinner */}
      <div className="relative w-16 h-16">
        {/* Cercle de fond */}
        <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
        
        {/* Cercle animé */}
        <div className="absolute inset-0 border-4 border-red-900 rounded-full animate-spin border-t-transparent"></div>
      </div>
      
      {/* Texte de chargement */}
      <p className="mt-4 text-gray-400">Chargement...</p>
    </div>
  );
}
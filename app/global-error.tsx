// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="space-y-6">
              <h1 className="text-9xl font-bold text-red-600">505</h1>
              <h2 className="text-3xl font-bold text-white">Erreur critique</h2>
              <p className="text-gray-400">
                Une erreur critique s'est produite. Veuillez réessayer ultérieurement.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => reset()}
                  className="inline-block bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
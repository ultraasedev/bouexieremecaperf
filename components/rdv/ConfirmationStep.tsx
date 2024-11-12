// components/rdv/ConfirmationStep.tsx
'use client';

import { useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConfirmationStepProps {
  data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    brand: string;
    model: string;
    year: string;
    trim: string;
    serviceType: string;
    description: string;
    date: string;
    time: string;
  };
  onPrevious: () => void;
}

const serviceLabels: Record<string, string> = {
  diagnostic: 'Diagnostic',
  mecanique: 'Mécanique',
  'pieces-premium': 'Installation de pièces premium',
  reprog: 'Reprogrammation'
};

export default function ConfirmationStep({ data, onPrevious }: ConfirmationStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la soumission du rendez-vous');
      }

      setIsSubmitted(true);
      
      // Redirection après 5 secondes
      setTimeout(() => {
        window.location.href = '/';
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
        <h3 className="text-2xl font-bold text-white">Demande de rendez-vous envoyée !</h3>
        <p className="text-gray-400">
          Nous avons bien reçu votre demande de rendez-vous. Vous recevrez une confirmation
          par email et SMS dans les 48h.
        </p>
        <div className="mt-8">
          <a href="/" className="inline-block bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-3 font-semibold transition-colors">
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Résumé des informations */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-red-500 mb-3">
            Informations personnelles
          </h3>
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <p className="text-white">{data.firstName} {data.lastName}</p>
            <p className="text-gray-400">{data.email}</p>
            <p className="text-gray-400">{data.phone}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-red-500 mb-3">
            Véhicule
          </h3>
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <p className="text-white">{data.brand} {data.model}</p>
            <p className="text-gray-400">Année : {data.year}</p>
            {data.trim && <p className="text-gray-400">Motorisation : {data.trim}</p>}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-red-500 mb-3">
            Service demandé
          </h3>
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <p className="text-white">{serviceLabels[data.serviceType]}</p>
            {data.description && (
              <p className="text-gray-400">{data.description}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-red-500 mb-3">
            Date et heure
          </h3>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white">
              {format(new Date(data.date), 'EEEE d MMMM yyyy', { locale: fr })}
              {' à '}{data.time}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500">
          {error}
        </div>
      )}

      <div className="flex justify-between gap-4 pt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="w-full bg-white/10 hover:bg-white/20 text-white rounded-full py-3 font-semibold transition-colors flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Modifier
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full py-3 font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Confirmer le rendez-vous'}
        </button>
      </div>
    </div>
  );
}
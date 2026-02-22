// components/rdv/ConfirmationStep.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string; // Ajout du champ address
  brand: string;
  model: string;
  year: string;
  trim: string;
  serviceType: 'diagnostic' | 'mecanique' | 'pieces-premium' | 'reprog';
  description: string;
  date: string;
  time: string;
}

interface ConfirmationStepProps {
  data: FormState;
  onPrevious: () => void;
  onComplete: () => void;
}

export default function ConfirmationStep({
  data,
  onPrevious,
  onComplete,
}: ConfirmationStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const formatDate = (dateStr: string) => {
    try {
      const [day, month, year] = dateStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return dateStr;
    }
  };

  const getServiceLabel = (type: string) => {
    switch (type) {
      case 'diagnostic': return 'Diagnostic';
      case 'mecanique': return 'Mécanique';
      case 'pieces-premium': return 'Pièces Premium';
      case 'reprog': return 'Reprogrammation';
      default: return type;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        fullName: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        address: data.address,
        brand: data.brand,
        model: data.model,
        year: data.year,
        trim: data.trim,
        serviceType: data.serviceType,
        description: data.description,
        date: data.date,
        time: data.time
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Une erreur est survenue lors de la création du rendez-vous');
      }

      // Toast de succès
      toast({
        title: "✅ Demande envoyée avec succès",
        description: "Votre demande de rendez-vous a bien été prise en compte. Vous recevrez par mail un récapitulatif de votre demande, et sous 48h une réponse de notre part pour votre demande de rendez-vous.",
        variant: "default", // Vert par défaut dans votre thème
        duration: 5000,
      });

      // Attendre un peu avant la redirection
      setTimeout(() => {
        onComplete();
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        title: "❌ Erreur",
        description: error instanceof Error 
          ? error.message 
          : "Une erreur est survenue lors de l'envoi de votre demande. Veuillez vérifier vos informations et réessayer.",
        variant: "destructive", // Rouge pour les erreurs
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Confirmer votre rendez-vous</h2>
        <p className="text-gray-400">
          Veuillez vérifier les informations ci-dessous avant de confirmer votre rendez-vous
        </p>
      </div>

      <div className="bg-white/5 rounded-lg p-6 space-y-6">
        {/* Informations personnelles */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Informations personnelles</h3>
          <div className="space-y-2 text-gray-300">
            <p>Nom : <span className="text-white">{data.lastName}</span></p>
            <p>Prénom : <span className="text-white">{data.firstName}</span></p>
            <p>Email : <span className="text-white">{data.email}</span></p>
            <p>Téléphone : <span className="text-white">{data.phone}</span></p>
            <p>Adresse : <span className="text-white">{data.address}</span></p>
          </div>
        </div>

        {/* Informations véhicule */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Informations véhicule</h3>
          <div className="space-y-2 text-gray-300">
            <p>Marque : <span className="text-white">{data.brand}</span></p>
            <p>Modèle : <span className="text-white">{data.model}</span></p>
            <p>Année : <span className="text-white">{data.year}</span></p>
            {data.trim && <p>Motorisation : <span className="text-white">{data.trim}</span></p>}
          </div>
        </div>

        {/* Service demandé */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Service demandé</h3>
          <div className="space-y-2 text-gray-300">
            <p>Type : <span className="text-white">{getServiceLabel(data.serviceType)}</span></p>
            {data.description && (
              <div>
                <p className="font-medium mb-1">Description :</p>
                <p className="text-sm bg-white/5 rounded p-3 text-white">{data.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Date et heure */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Date et heure</h3>
          <div className="space-y-2 text-gray-300">
            <p>Date : <span className="text-white">{formatDate(data.date)}</span></p>
            <p>Heure : <span className="text-white">{data.time}</span></p>
          </div>
        </div>
      </div>

      {/* Message d'information */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-200">
        <p>En confirmant ce rendez-vous :</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Vous recevrez un email de confirmation</li>
          <li>Nous étudierons votre demande sous 48h</li>
          <li>Nous vous contacterons si nécessaire pour plus d'informations</li>
        </ul>
      </div>

      <div className="flex justify-between gap-4 pt-4">
        <Button 
          variant="outline"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="w-full"
        >
          Retour
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Confirmation en cours...
            </>
          ) : (
            'Confirmer le rendez-vous'
          )}
        </Button>
      </div>
    </div>
  );
}
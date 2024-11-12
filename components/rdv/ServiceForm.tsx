// components/rdv/ServiceForm.tsx
'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { 
  WrenchIcon, 
  MagnifyingGlassIcon,
  CogIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ServiceData {
  serviceType: 'diagnostic' | 'mecanique' | 'pieces-premium' | 'reprog';
  description: string;
}

interface ServiceDefinition {
  id: ServiceData['serviceType'];
  name: string;
  description: string;
  icon: typeof WrenchIcon;
  needsDescription: boolean;
  comingSoon?: boolean;
}

interface ServiceFormProps {
  data: ServiceData;
  updateData: (data: Partial<ServiceData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const services: ServiceDefinition[] = [
  {
    id: 'diagnostic',
    name: 'Diagnostic',
    description: 'Analyse complète de votre véhicule',
    icon: MagnifyingGlassIcon,
    needsDescription: true,
    comingSoon: false
  },
  {
    id: 'mecanique',
    name: 'Mécanique',
    description: 'Réparation et entretien',
    icon: WrenchIcon,
    needsDescription: true,
    comingSoon: false
  },
  {
    id: 'pieces-premium',
    name: 'Pièces Premium',
    description: 'Installation de pièces performance',
    icon: SparklesIcon,
    needsDescription: true,
    comingSoon: false
  },
  {
    id: 'reprog',
    name: 'Reprogrammation',
    description: 'Optimisation moteur',
    icon: CogIcon,
    needsDescription: false,
    comingSoon: true
  }
];

export default function ServiceForm({ data, updateData, onNext, onPrevious }: ServiceFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.serviceType) {
      newErrors.serviceType = 'Veuillez sélectionner un service';
    }
    
    const selectedService = services.find(s => s.id === data.serviceType);
    if (selectedService?.needsDescription && !data.description.trim()) {
      newErrors.description = 'Veuillez décrire votre besoin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  const selectedService = services.find(service => service.id === data.serviceType);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            disabled={service.comingSoon}
            onClick={() => updateData({ 
              serviceType: service.id,
              description: ''
            })}
            className={`relative p-6 rounded-lg border-2 transition-all ${
              data.serviceType === service.id
                ? 'border-red-500 bg-red-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/30'
            } ${service.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <service.icon className="w-8 h-8 text-white mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">{service.name}</h3>
            <p className="text-sm text-gray-400">{service.description}</p>
            {service.comingSoon && (
              <span className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                Bientôt disponible
              </span>
            )}
          </button>
        ))}
      </div>

      {errors.serviceType && (
        <p className="text-sm text-red-500">{errors.serviceType}</p>
      )}

      {selectedService?.needsDescription && (
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Description de votre besoin *
          </label>
          <textarea
            required
            rows={4}
            className={`w-full bg-white/5 border ${
              errors.description ? 'border-red-500' : 'border-white/10'
            } rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500`}
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder={`Décrivez votre besoin...`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>
      )}

      <div className="flex justify-between gap-4 pt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="w-full bg-white/10 hover:bg-white/20 text-white rounded-full py-3 font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          Précédent
        </button>
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full py-3 font-semibold transition-colors flex items-center justify-center gap-2"
        >
          Suivant
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
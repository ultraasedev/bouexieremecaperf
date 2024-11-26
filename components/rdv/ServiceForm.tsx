// components/rdv/ServiceForm.tsx
'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { 
  WrenchIcon, 
  MagnifyingGlassIcon,
  CogIcon,
  SparklesIcon,
  ArrowRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";

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
  examples?: string[];
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
    description: 'Analyse complète de votre véhicule pour identifier les problèmes',
    icon: MagnifyingGlassIcon,
    needsDescription: true,
    examples: [
      'Voyant moteur allumé',
      'Bruits anormaux',
      'Problèmes de démarrage',
      'Consommation excessive'
    ]
  },
  {
    id: 'mecanique',
    name: 'Mécanique',
    description: 'Réparation et entretien de votre véhicule',
    icon: WrenchIcon,
    needsDescription: true,
    examples: [
      'Vidange et révision',
      'Changement de pièces',
      'Freinage',
      'Distribution'
    ]
  },
  {
    id: 'pieces-premium',
    name: 'Pièces Premium',
    description: 'Installation de pièces performance sur mesure',
    icon: SparklesIcon,
    needsDescription: true,
    examples: [
      'Ligne d\'échappement',
      'Admission d\'air',
      'Suspensions sport',
      'Kit turbo'
    ]
  },
  {
    id: 'reprog',
    name: 'Reprogrammation',
    description: 'Optimisation électronique de votre moteur',
    icon: CogIcon,
    needsDescription: false,
    comingSoon: true,
    examples: [
      'Stage 1',
      'Stage 2',
      'Stage 3',
      'Suppression FAP'
    ]
  }
];

const MotionArrowRight = motion(ArrowRightIcon);

export default function ServiceForm({
  data,
  updateData,
  onNext,
  onPrevious
}: ServiceFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showExamples, setShowExamples] = useState<string | null>(null);
  const { toast } = useToast();

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
      if (data.serviceType === 'reprog') {
        toast({
          title: "Service bientôt disponible",
          description: "La reprogrammation n'est pas encore disponible. Veuillez choisir un autre service.",
          variant: "destructive"
        });
        return;
      }
      onNext();
    }
  };

  const handleServiceSelect = (serviceId: ServiceData['serviceType']) => {
    if (services.find(s => s.id === serviceId)?.comingSoon) {
      toast({
        title: "Service bientôt disponible",
        description: "Ce service n'est pas encore disponible. Veuillez choisir un autre service.",
        variant: "destructive"
      });
      return;
    }
    updateData({ 
      serviceType: serviceId,
      description: ''
    });
  };

  const selectedService = services.find(service => service.id === data.serviceType);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div key={service.id} className="relative">
            <button
              type="button"
              disabled={service.comingSoon}
              onClick={() => handleServiceSelect(service.id)}
              onMouseEnter={() => setShowExamples(service.id)}
              onMouseLeave={() => setShowExamples(null)}
              className={`w-full h-full p-6 rounded-lg border-2 transition-all text-left ${
                data.serviceType === service.id
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/30'
              } ${service.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <service.icon className="w-8 h-8 text-white mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {service.name}
              </h3>
              <p className="text-sm text-gray-400">{service.description}</p>
              
              {service.comingSoon && (
                <span className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                  Bientôt disponible
                </span>
              )}

              {showExamples === service.id && service.examples && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-black border border-white/10 rounded-lg p-4 z-10 shadow-xl"
                >
                  <h4 className="text-sm font-semibold text-white mb-2">Exemples :</h4>
                  <ul className="space-y-1">
                    {service.examples.map((example, index) => (
                      <li key={index} className="text-sm text-gray-400 flex items-center gap-2">
                        <MotionArrowRight
                          initial={{ x: -5 }}
                          animate={{ x: 0 }}
                          className="w-3 h-3"
                        />
                        {example}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </button>
          </div>
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
            rows={4}
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Décrivez votre besoin en détail..."
            className={`w-full bg-white/5 border ${
              errors.description ? 'border-red-500' : 'border-white/10'
            } rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500`}
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
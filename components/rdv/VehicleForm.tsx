// components/rdv/VehicleForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useCarQuery } from '@/lib/useCarQuery';
import type { CarMake, CarModel, CarTrim } from '@/lib/useCarQuery';

interface VehicleData {
  brand: string;
  model: string;
  year: string;
  trim: string;
}

interface VehicleFormProps {
  data: VehicleData;
  updateData: (data: Partial<VehicleData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function VehicleForm({
  data,
  updateData,
  onNext,
  onPrevious,
}: VehicleFormProps) {
  const { getMakes, getModels, getTrims, getAvailableYears, isLoading } = useCarQuery();
  
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [trims, setTrims] = useState<CarTrim[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Charger les marques au montage du composant
    const loadMakes = async () => {
      const makesData = await getMakes();
      setMakes(makesData);
    };
    loadMakes();
  }, []);

  useEffect(() => {
    // Charger les modèles quand la marque et l'année sont sélectionnées
    if (data.brand && data.year) {
      const loadModels = async () => {
        const modelsData = await getModels(data.brand, parseInt(data.year));
        setModels(modelsData);
      };
      loadModels();
    }
  }, [data.brand, data.year]);

  useEffect(() => {
    // Charger les motorisations quand le modèle est sélectionné
    if (data.brand && data.model && data.year) {
      const loadTrims = async () => {
        const trimsData = await getTrims(data.brand, data.model, parseInt(data.year));
        setTrims(trimsData);
      };
      loadTrims();
    }
  }, [data.brand, data.model, data.year]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!data.brand) newErrors.brand = 'Veuillez sélectionner une marque';
    if (!data.model) newErrors.model = 'Veuillez sélectionner un modèle';
    if (!data.year) newErrors.year = 'Veuillez sélectionner une année';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Année du véhicule *
        </label>
        <select
          value={data.year}
          onChange={(e) => updateData({ year: e.target.value, model: '', trim: '' })}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 [&>option]:text-black"
        >
          <option value="">Sélectionnez une année</option>
          {getAvailableYears().map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        {errors.year && (
          <p className="mt-1 text-sm text-red-500">{errors.year}</p>
        )}
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Marque du véhicule *
        </label>
        <select
          value={data.brand}
          onChange={(e) => updateData({ brand: e.target.value, model: '', trim: '' })}
          disabled={!data.year}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 [&>option]:text-black disabled:opacity-50"
        >
          <option value="">Sélectionnez une marque</option>
          {makes.map((make) => (
            <option key={make.make_id} value={make.make_id}>
              {make.make_display}
            </option>
          ))}
        </select>
        {errors.brand && (
          <p className="mt-1 text-sm text-red-500">{errors.brand}</p>
        )}
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Modèle *
        </label>
        <select
          value={data.model}
          onChange={(e) => updateData({ model: e.target.value, trim: '' })}
          disabled={!data.brand || isLoading}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 [&>option]:text-black disabled:opacity-50"
        >
          <option value="">Sélectionnez un modèle</option>
          {models.map((model) => (
            <option key={model.model_name} value={model.model_name}>
              {model.model_name}
            </option>
          ))}
        </select>
        {errors.model && (
          <p className="mt-1 text-sm text-red-500">{errors.model}</p>
        )}
      </div>

      {trims.length > 0 && (
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Motorisation
          </label>
          <select
            value={data.trim}
            onChange={(e) => updateData({ trim: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 [&>option]:text-black"
          >
            <option value="">Sélectionnez une motorisation</option>
            {trims.map((trim) => (
              <option key={trim.model_id} value={trim.model_id}>
                {`${trim.model_engine_type} ${trim.model_engine_cc}cc - ${trim.model_engine_power_ps}ch`}
              </option>
            ))}
          </select>
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
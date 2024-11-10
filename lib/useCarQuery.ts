// lib/useCarQuery.ts
import { useState } from 'react';

// Types
export interface CarMake {
  make_id: string;
  make_display: string;
  make_country: string;
}

export interface CarModel {
  model_name: string;
  model_make_id: string;
}

export interface CarTrim {
  model_id: string;
  model_name: string;
  model_trim: string;
  model_engine_power_ps: string;
  model_engine_torque_nm: string;
  model_engine_fuel: string;
  model_engine_type: string;
  model_year: string;
}

export interface TuningResult {
  originalPower: number;
  originalTorque: number;
  powerGain: number;
  torqueGain: number;
  newPower: number;
  newTorque: number;
  price: number | null;
}

interface CarQueryResponse {
  Makes?: CarMake[];
  Models?: CarModel[];
  Trims?: CarTrim[];
}

// Configuration de l'API
const BASE_URL = 'https://www.carqueryapi.com/api/0.3/';

export function useCarQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupère toutes les marques
  const getMakes = async (): Promise<CarMake[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}?cmd=getMakes&format=json`);
      if (!response.ok) throw new Error('Erreur réseau');
      const data = await response.json();
      return data.Makes || [];
    } catch (err) {
      setError('Erreur lors de la récupération des marques');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Récupère les modèles pour une marque et une année donnée
  const getModels = async (make: string, year: number): Promise<CarModel[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}?cmd=getModels&make=${make}&year=${year}&format=json`
      );
      if (!response.ok) throw new Error('Erreur réseau');
      const data = await response.json();
      return data.Models || [];
    } catch (err) {
      setError('Erreur lors de la récupération des modèles');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Récupère les motorisations pour un modèle spécifique
  const getTrims = async (
    make: string,
    model: string,
    year: number
  ): Promise<CarTrim[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}?cmd=getTrims&make=${make}&model=${model}&year=${year}&format=json`
      );
      if (!response.ok) throw new Error('Erreur réseau');
      const data = await response.json();
      return data.Trims || [];
    } catch (err) {
      setError('Erreur lors de la récupération des motorisations');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Calcule les gains de performances
  const calculateTuningGains = (
    power: number,
    torque: number,
    fuelType: string,
    stage: number
  ): TuningResult => {
    const isDiesel = fuelType.toLowerCase().includes('diesel');

    type StageGains = {
      power: number;
      torque: number;
      price: number | null;
    };

    const gains: Record<'diesel' | 'petrol', Record<1 | 2 | 3, StageGains>> = {
      diesel: {
        1: { power: 0.30, torque: 0.25, price: 599 },
        2: { power: 0.45, torque: 0.40, price: null },
        3: { power: 0.60, torque: 0.55, price: null }
      },
      petrol: {
        1: { power: 0.25, torque: 0.20, price: 499 },
        2: { power: 0.40, torque: 0.35, price: null },
        3: { power: 0.55, torque: 0.50, price: null }
      }
    };

    const engineType = isDiesel ? 'diesel' : 'petrol';
    const stageGains = gains[engineType][stage as 1 | 2 | 3];

    const powerGain = Math.round(power * stageGains.power);
    const torqueGain = Math.round(torque * stageGains.torque);

    return {
      originalPower: power,
      originalTorque: torque,
      powerGain,
      torqueGain,
      newPower: power + powerGain,
      newTorque: torque + torqueGain,
      price: stageGains.price
    };
  };

  // Liste des années disponibles
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 30 }, (_, i) => currentYear - i);
  };

  return {
    getMakes,
    getModels,
    getTrims,
    calculateTuningGains,
    getAvailableYears,
    isLoading,
    error,
  };
}

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
  model_trim: string;
  model_year: string;
}

export interface CarTrim {
  model_id: string;
  model_make_id: string;
  model_name: string;
  model_trim: string;
  model_year: string;
  model_engine_position: string;
  model_engine_cc: string;
  model_engine_cyl: string;
  model_engine_type: string;
  model_engine_power_ps: string;
  model_engine_torque_nm: string;
  model_engine_fuel: string;
  model_top_speed_kph: string;
  model_transmission_type: string;
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

type StageGains = {
  power: number;
  torque: number;
  price: number | null;
};

export function useCarQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction utilitaire pour les requêtes
  const fetchCarData = async (params: Record<string, string>) => {
    const queryString = new URLSearchParams(params).toString();
    try {
      const response = await fetch(`/api/cars?${queryString}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      return await response.json();
    } catch (err) {
      console.error('Erreur API:', err);
      throw err;
    }
  };

  // Récupérer toutes les marques
  const getMakes = async (): Promise<CarMake[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCarData({ cmd: 'getMakes' });
      return data.Makes || [];
    } catch (err) {
      setError('Erreur lors de la récupération des marques');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les modèles pour une marque et une année
  const getModels = async (make: string, year: number): Promise<CarModel[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCarData({
        cmd: 'getModels',
        make,
        year: year.toString(),
      });
      return data.Models || [];
    } catch (err) {
      setError('Erreur lors de la récupération des modèles');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les motorisations
  const getTrims = async (
    make: string,
    model: string,
    year: number
  ): Promise<CarTrim[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCarData({
        cmd: 'getTrims',
        make,
        model,
        year: year.toString(),
      });
      return data.Trims || [];
    } catch (err) {
      setError('Erreur lors de la récupération des motorisations');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Calcul des gains de performances
  const calculateTuningGains = (
    power: number,
    torque: number,
    fuelType: string,
    stage: number
  ): TuningResult => {
    const isDiesel = fuelType.toLowerCase().includes('diesel');

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

  // Obtenir la liste des années disponibles
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: 30 },
      (_, i) => currentYear - i
    );
  };

  // Fonction pour formater les données de motorisation
  const formatTrimData = (trim: CarTrim) => {
    return {
      ...trim,
      model_engine_power_ps: trim.model_engine_power_ps || '0',
      model_engine_torque_nm: trim.model_engine_torque_nm || '0',
      model_engine_fuel: trim.model_engine_fuel || 'Essence'
    };
  };

  return {
    getMakes,
    getModels,
    getTrims,
    calculateTuningGains,
    getAvailableYears,
    formatTrimData,
    isLoading,
    error
  };
}
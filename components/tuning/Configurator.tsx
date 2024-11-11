// components/tuning/Configurator.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useCarQuery, type CarMake, type CarModel, type CarTrim } from '@/lib/useCarQuery';

type Step = 'marque' | 'annee' | 'modele' | 'motorisation' | 'resultats';

interface Selection {
  marque: string;
  annee: number;
  modele: string;
  motorisation: CarTrim | null;
}

// Les marques mises en avant
const FEATURED_BRANDS: { [key: string]: string } = {
  'BMW': '/logos/bmw.png',
  'Audi': '/logos/audi.png',
  'Mercedes': '/logos/mercedes.png',
  'Volkswagen': '/logos/vw.png',
  'Renault': '/logos/renault.png',
  'Peugeot': '/logos/peugeot.png',
  'Citroen': '/logos/citroen.png',
  'Fiat': '/logos/fiat.png',
  'Seat': '/logos/seat.png',
  'Nissan': '/logos/nissan.png',
  'Subaru': '/logos/subaru.png',
  'Lamborghini': '/logos/lamborghini.png',
  'Mazda': '/logos/mazda.png',
  'Ferrari': '/logos/ferrari.png',
  'Dacia': '/logos/dacia.png',
  'Kia': '/logos/kia.png',
  'Hyundai': '/logos/hyundai.png',
  'Skoda': '/logos/skoda.png',
  'Toyota': '/logos/toyota.png',
};

export default function Configurator(): JSX.Element {
  // États
  const [currentStep, setCurrentStep] = useState<Step>('marque');
  const [selection, setSelection] = useState<Selection>({
    marque: '',
    annee: 0,
    modele: '',
    motorisation: null,
  });
  const [allMakes, setAllMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [trims, setTrims] = useState<CarTrim[]>([]);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Hook CarQuery
  const { getMakes, getModels, getTrims, calculateTuningGains, getAvailableYears, isLoading, error } = useCarQuery();

  // Charger toutes les marques au démarrage
  useEffect(() => {
    const loadMakes = async () => {
      const makes = await getMakes();
      setAllMakes(makes);
    };
    loadMakes();
  }, []);

  // Variants d'animation
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  // Handlers
  const handleBack = () => {
    const stepOrder: Step[] = ['marque', 'annee', 'modele', 'motorisation', 'resultats'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleReset = () => {
    setSelection({
      marque: '',
      annee: 0,
      modele: '',
      motorisation: null
    });
    setCurrentStep('marque');
    setShowAllBrands(false);
  };

  const handleMarqueSelect = async (marque: string) => {
    setSelection(prev => ({
      ...prev,
      marque,
      annee: 0,
      modele: '',
      motorisation: null
    }));
    setCurrentStep('annee');
  };

  const handleAnneeSelect = async (annee: number) => {
    try {
      const modelData = await getModels(selection.marque, annee);
      setModels(modelData);
      setSelection(prev => ({ ...prev, annee, modele: '', motorisation: null }));
      setCurrentStep('modele');
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error);
    }
  };

  const handleModeleSelect = async (modele: string) => {
    try {
      const trimData = await getTrims(selection.marque, modele, selection.annee);
      setTrims(trimData);
      setSelection(prev => ({ ...prev, modele, motorisation: null }));
      setCurrentStep('motorisation');
    } catch (error) {
      console.error('Erreur lors du chargement des motorisations:', error);
    }
  };

  const handleMotorisationSelect = (motorisation: CarTrim) => {
    setSelection(prev => ({ ...prev, motorisation }));
    setCurrentStep('resultats');
  };
   // Fonctions de rendu
   const renderStepIndicator = () => (
    <div className="flex justify-center mb-12 overflow-x-auto">
      <div className="flex items-center space-x-4">
        {[
          { step: 'marque', label: 'Marque' },
          { step: 'annee', label: 'Année' },
          { step: 'modele', label: 'Modèle' },
          { step: 'motorisation', label: 'Motorisation' },
          { step: 'resultats', label: 'Résultats' }
        ].map((item, index) => (
          <div key={item.step} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
              ${currentStep === item.step 
                ? 'bg-red-600 text-white' 
                : 'bg-white/10 text-white/50'}
            `}>
              {index + 1}
            </div>
            {index < 4 && <div className="w-8 h-0.5 mx-2 bg-white/10" />}
          </div>
        ))}
      </div>
    </div>
  );

  const renderMarqueSelection = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Object.entries(FEATURED_BRANDS).map(([marque, logo]) => (
          <button
            key={marque}
            onClick={() => handleMarqueSelect(marque)}
            className={`
              relative group p-8 rounded-xl transition-all duration-300
              ${selection.marque === marque 
                ? 'bg-red-600/20 ring-2 ring-red-600' 
                : 'bg-white/5 hover:bg-white/10'}
            `}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-24 h-24">
                <Image
                  src={logo}
                  alt={marque}
                  width={96}
                  height={96}
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    // Fallback pour les images qui ne chargent pas
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <span className="text-white font-bold text-lg">{marque}</span>
            </div>
          </button>
        ))}
      </div>
  
      {showAllBrands && allMakes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {allMakes
            .filter(make => !FEATURED_BRANDS[make.make_display])
            .map(make => (
              <button
                key={make.make_id}
                onClick={() => handleMarqueSelect(make.make_id)}
                className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-white">{make.make_display}</span>
              </button>
            ))}
        </motion.div>
      )}
    </motion.div>
  );

  const renderAnneeSelection = () => {
    const years = getAvailableYears();
    
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
      >
        {years.map(year => (
          <button
            key={year}
            onClick={() => handleAnneeSelect(year)}
            className={`
              p-3 rounded-xl text-center transition-all duration-300
              ${selection.annee === year 
                ? 'bg-red-600/20 ring-2 ring-red-600' 
                : 'bg-white/5 hover:bg-white/10'}
            `}
          >
            <span className="text-white font-bold text-lg">{year}</span>
          </button>
        ))}
      </motion.div>
    );
  };

  const renderModeleSelection = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {models.map((model) => (
        <button
          key={model.model_name}
          onClick={() => handleModeleSelect(model.model_name)}
          className={`
            p-6 rounded-xl transition-all duration-300
            ${selection.modele === model.model_name 
              ? 'bg-red-600/20 ring-2 ring-red-600' 
              : 'bg-white/5 hover:bg-white/10'}
          `}
        >
          <h3 className="text-white font-bold text-lg">{model.model_name}</h3>
        </button>
      ))}
    </motion.div>
  );

  const renderMotorisationSelection = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {trims.map((trim) => {
        const power = parseInt(trim.model_engine_power_ps) || 0;
        const torque = parseInt(trim.model_engine_torque_nm) || 0;
        
        return (
          <button
            key={trim.model_id}
            onClick={() => handleMotorisationSelect(trim)}
            className={`
              p-6 rounded-xl transition-all duration-300
              ${selection.motorisation?.model_id === trim.model_id 
                ? 'bg-red-600/20 ring-2 ring-red-600' 
                : 'bg-white/5 hover:bg-white/10'}
            `}
          >
            <div className="space-y-4 text-left">
              <h3 className="text-white font-bold text-xl">{trim.model_engine_type}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Puissance:</span>
                  <span className="text-white font-semibold">{power} ch</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Couple:</span>
                  <span className="text-white font-semibold">{torque} Nm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Carburant:</span>
                  <span className="text-white font-semibold">{trim.model_engine_fuel}</span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </motion.div>
  );

  const renderResultats = () => {
    if (!selection.motorisation) return null;

    const power = parseInt(selection.motorisation.model_engine_power_ps) || 0;
    const torque = parseInt(selection.motorisation.model_engine_torque_nm) || 0;
    const fuelType = selection.motorisation.model_engine_fuel;

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3].map((stage) => {
            const gains = calculateTuningGains(power, torque, fuelType, stage);

            return (
              <div
                key={stage}
                className="bg-white/5 rounded-xl p-6 xs:p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-red-600/20 text-red-600 px-4 py-2 rounded-bl-xl font-bold">
                  Stage {stage}
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl xs:text-2xl font-bold text-white mb-4">
                      Gains de performance
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-400 mb-1">Puissance</p>
                        <div className="flex flex-col xs:flex-row xs:items-end gap-2">
                          <div className="flex items-end space-x-2">
                            <span className="text-2xl xs:text-3xl font-bold text-white">
                              {gains.newPower}
                            </span>
                            <span className="text-gray-400 mb-1">ch</span>
                          </div>
                          <span className="text-green-500">
                            (+{gains.powerGain} ch)
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Couple</p>
                        <div className="flex flex-col xs:flex-row xs:items-end gap-2">
                          <div className="flex items-end space-x-2">
                            <span className="text-2xl xs:text-3xl font-bold text-white">
                              {gains.newTorque}
                            </span>
                            <span className="text-gray-400 mb-1">Nm</span>
                          </div>
                          <span className="text-green-500">
                            (+{gains.torqueGain} Nm)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {gains.price ? (
                    <div className="space-y-4">
                      <p className="text-3xl font-bold text-white">{gains.price}€</p>
                      <button className="w-full bg-red-600 text-white rounded-full py-3 hover:bg-red-700 transition-colors">
                        Prendre RDV
                      </button>
                      <p className="text-sm text-gray-400 text-center">
                        Service bientôt disponible
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button className="w-full bg-white/10 text-white rounded-full py-3 hover:bg-white/20 transition-colors">
                        Demander un devis
                      </button>
                      <p className="text-sm text-gray-400 text-center">
                        Sur mesure uniquement
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  // Rendu principal
  return (
    <section className="bg-black py-12 xs:py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 xs:mb-12 lg:mb-16">
          <span className="inline-block bg-red-600/10 px-4 py-2 rounded-full text-red-600 font-semibold">
            SIMULATEUR
          </span>
          <h2 className="text-3xl xs:text-4xl font-bold text-white mt-4 mb-4">
            Reprogrammation Moteur
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Découvrez le potentiel de performance de votre véhicule !
          </p>
        </div>

        {renderStepIndicator()}

        {error && (
          <div className="mb-8 p-4 bg-red-600/10 border border-red-600 rounded-xl">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
            </div>
          ) : (
            <>
              {currentStep === 'marque' && renderMarqueSelection()}
              {currentStep === 'annee' && renderAnneeSelection()}
              {currentStep === 'modele' && renderModeleSelection()}
              {currentStep === 'motorisation' && renderMotorisationSelection()}
              {currentStep === 'resultats' && renderResultats()}
            </>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {currentStep !== 'marque' && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white hover:text-red-500 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
              Retour
            </button>
          )}
          
          {currentStep === 'resultats' && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-white hover:text-red-500 transition-colors ml-auto"
            >
              Nouvelle simulation
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Résumé de la sélection */}
        {currentStep !== 'marque' && (
          <div className="mt-8 xs:mt-12 p-4 xs:p-6 bg-white/5 rounded-xl">
            <h3 className="text-white font-semibold mb-4">Votre sélection :</h3>
            <div className="flex flex-wrap gap-2 xs:gap-4">
              {selection.marque && (
                <span className="bg-white/10 px-3 xs:px-4 py-2 rounded-full text-white">
                  {selection.marque}
                </span>
              )}
              {selection.annee > 0 && (
                <span className="bg-white/10 px-3 xs:px-4 py-2 rounded-full text-white">
                  {selection.annee}
                </span>
              )}
              {selection.modele && (
                <span className="bg-white/10 px-3 xs:px-4 py-2 rounded-full text-white">
                  {selection.modele}
                </span>
              )}
              {selection.motorisation && (
                <span className="bg-white/10 px-3 xs:px-4 py-2 rounded-full text-white">
                  {selection.motorisation.model_engine_type} {selection.motorisation.model_engine_power_ps}ch
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
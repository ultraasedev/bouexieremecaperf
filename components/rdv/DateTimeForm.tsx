// components/rdv/DateTimeForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format, addMonths, startOfToday, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, PhoneIcon, Mail } from 'lucide-react';

interface DateTimeData {
  date: string;
  time: string;
}

interface Availability {
  timeSlots: string[];
  bookedSlots: string[];
}

interface DateTimeFormProps {
  data: DateTimeData;
  updateData: (data: Partial<DateTimeData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function DateTimeForm({
  data,
  updateData,
  onNext,
  onPrevious,
}: DateTimeFormProps) {
  const [availableDates, setAvailableDates] = useState<Record<string, Availability>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    data.date ? new Date(data.date.split('-').reverse().join('-')) : undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfToday());
  const { toast } = useToast();

  // Charger les disponibilités
  useEffect(() => {
    const loadAvailabilities = async () => {
      setIsLoading(true);
      try {
        const start = startOfToday();
        const end = addMonths(start, 2);
        const response = await fetch(
          `/api/availability?start=${format(start, 'yyyy-MM-dd')}&end=${format(end, 'yyyy-MM-dd')}`
        );

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des disponibilités');
        }

        const data = await response.json();
        setAvailableDates(data);
      } catch (error) {
        console.error('Erreur:', error);
        toast({
          title: "❌ Erreur",
          description: "Impossible de charger les disponibilités",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailabilities();
  }, [toast]);

  const handleDateSelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    if (!availableDates[formattedDate]?.timeSlots?.length) {
      toast({
        title: "❌ Date non disponible",
        description: "Aucune disponibilité pour cette date",
        variant: "destructive",
      });
      return;
    }

    setSelectedDate(date);
    updateData({
      date: format(date, 'dd-MM-yyyy'),
      time: '' // Réinitialiser l'heure lors du changement de date
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!data.date) newErrors.date = 'Veuillez sélectionner une date';
    if (!data.time) newErrors.time = 'Veuillez sélectionner un créneau horaire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  const handleMonthChange = (increment: number) => {
    setCurrentMonth(prev => addMonths(prev, increment));
  };

  // Composant pour afficher le message d'absence de disponibilités
  const NoAvailabilityMessage = () => (
    <div className="bg-white/5 rounded-lg p-6 text-center">
      <p className="text-white text-lg mb-4">
        Aucune disponibilité configurée pour le moment.
      </p>
      <p className="text-white/70 mb-6">
        En cas d'urgence, merci de nous contacter :
      </p>
      <div className="space-y-4">
        <a 
          href="tel:0661865543" 
          className="flex items-center justify-center gap-2 text-red-500 hover:text-red-400 transition-colors"
        >
          <PhoneIcon className="w-4 h-4" />
          06 61 86 55 43
        </a>
        <div className="text-white/50">ou</div>
        <a 
          href="/contact" 
          className="flex items-center justify-center gap-2 text-red-500 hover:text-red-400 transition-colors"
        >
          <Mail className="w-4 h-4" />
          via le formulaire de contact
        </a>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    );
  }

  const hasAvailabilities = Object.keys(availableDates).length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-7xl mx-auto">
    <div className="space-y-4">
      <label className="block text-white text-base sm:text-lg font-medium">
        1. Sélectionnez une date
      </label>

  {/* Header du calendrier */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
  <h3 className="text-base sm:text-lg text-white font-medium capitalize order-2 sm:order-1">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h3>
          <div className="flex items-center justify-between sm:justify-end gap-2 order-1 sm:order-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              disabled={format(currentMonth, 'M') === format(startOfToday(), 'M')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 w-full sm:w-auto"
            >
              <span className="sr-only">Mois précédent</span>
              <ChevronLeftIcon className="w-5 h-5 text-white mx-auto" />
            </button>
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              disabled={format(currentMonth, 'M') === format(addMonths(startOfToday(), 2), 'M')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 w-full sm:w-auto"
            >
              <span className="sr-only">Mois suivant</span>
              <ChevronRightIcon className="w-5 h-5 text-white mx-auto" />
            </button>
          </div>
        </div>

        {!hasAvailabilities ? (
          <NoAvailabilityMessage />
        ) : (
          <div className="space-y-4">
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center text-white/60 text-xs sm:text-sm font-medium">
                {day}
              </div>
            ))}
          </div>
            
          {/* Grille des dates */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: 35 }, (_, i) => {
                const date = addDays(currentMonth, i);
                const formattedDate = format(date, 'yyyy-MM-dd');
                const hasAvailability = availableDates[formattedDate]?.timeSlots?.length > 0;
                const isCurrentMonth = format(date, 'M') === format(currentMonth, 'M');
                const isPastDate = date < startOfToday();

              return (
                <button
                  key={formattedDate}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  disabled={!hasAvailability || isPastDate}
                  className={`
                    aspect-square p-1 sm:p-2 rounded-md sm:rounded-lg text-center transition-all
                    ${selectedDate && format(selectedDate, 'yyyy-MM-dd') === formattedDate
                      ? 'bg-red-600 text-white'
                      : hasAvailability && !isPastDate
                        ? 'bg-white/5 hover:bg-white/10 text-white'
                        : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >

                   <span className="text-sm sm:text-base md:text-lg font-semibold">
                      {format(date, 'd')}
                    </span>
                </button>
              );
            })}
          </div>
          </div>
        )}

        {errors.date && (
          <p className="mt-2 text-xs sm:text-sm text-red-500">{errors.date}</p>
        )}
      </div>

      {/* Sélection de l'heure */}
      {selectedDate && hasAvailabilities && (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <label className="block text-white text-base sm:text-lg font-medium">
              2. Choisissez un créneau horaire
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {availableDates[format(selectedDate, 'yyyy-MM-dd')]?.timeSlots
                ?.filter(time => !availableDates[format(selectedDate, 'yyyy-MM-dd')]?.bookedSlots?.includes(time))
                ?.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => updateData({ time })}
                    className={`
                      p-2 sm:p-3 rounded-md sm:rounded-lg text-center transition-all
                      ${data.time === time
                        ? 'bg-red-600 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-white'
                      }
                    `}
                  >
                    <Clock className="w-4 h-4 mb-1 mx-auto" />
                    <span className="text-sm sm:text-base">{time}</span>
                  </button>
                ))}
            </div>

            {errors.time && (
               <p className="mt-2 text-xs sm:text-sm text-red-500">{errors.time}</p>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Boutons de navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="w-full sm:w-auto px-6 bg-white/10 hover:bg-white/20 text-white rounded-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          Précédent
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 bg-red-600 hover:bg-red-700 text-white rounded-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          disabled={!data.date || !data.time}
        >
          Suivant
          <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </form>
  );
}
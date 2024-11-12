// components/rdv/DateTimeForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DateTimeData {
  date: string;
  time: string;
}

interface DateTimeFormProps {
  data: DateTimeData;
  updateData: (data: Partial<DateTimeData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Simuler les créneaux disponibles
const generateTimeSlots = (date: Date) => {
  const slots = [];
  // De 9h à 18h
  for (let hour = 9; hour <= 18; hour++) {
    // Exclure la pause déjeuner
    if (hour !== 12 && hour !== 13) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
  }
  return slots;
};

export default function DateTimeForm({ data, updateData, onNext, onPrevious }: DateTimeFormProps) {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Générer les dates disponibles (14 jours à partir d'aujourd'hui)
    const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));
    setAvailableDates(dates);
  }, []);

  useEffect(() => {
    if (data.date) {
      const slots = generateTimeSlots(new Date(data.date));
      setAvailableSlots(slots);
    }
  }, [data.date]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!data.date) {
      newErrors.date = 'Veuillez sélectionner une date';
    }
    if (!data.time) {
      newErrors.time = 'Veuillez sélectionner un créneau horaire';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Date du rendez-vous *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableDates.map((date) => (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => updateData({ date: date.toISOString(), time: '' })}
              className={`p-3 rounded-lg text-center transition-all ${
                data.date === date.toISOString()
                  ? 'bg-red-600 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              <div className="text-sm font-semibold">
                {format(date, 'EEEE', { locale: fr })}
              </div>
              <div className="text-lg">
                {format(date, 'd', { locale: fr })}
              </div>
              <div className="text-sm">
                {format(date, 'MMMM', { locale: fr })}
              </div>
            </button>
          ))}
        </div>
        {errors.date && (
          <p className="mt-1 text-sm text-red-500">{errors.date}</p>
        )}
      </div>

      {data.date && (
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Heure du rendez-vous *
          </label>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => updateData({ time: slot })}
                className={`p-3 rounded-lg text-center transition-all ${
                  data.time === slot
                    ? 'bg-red-600 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-white'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
          {errors.time && (
            <p className="mt-1 text-sm text-red-500">{errors.time}</p>
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
          disabled={!data.date || !data.time}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full py-3 font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
// components/rdv/ContactForm.tsx
'use client';

import { useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ContactFormProps {
  data: ContactData;
  updateData: (data: Partial<ContactData>) => void;
  onNext: () => void;
}

export default function ContactForm({ data, updateData, onNext }: ContactFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validation du prénom
    if (!data.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    // Validation du nom
    if (!data.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim() || !emailRegex.test(data.email)) {
      newErrors.email = 'Email invalide';
    }

    // Validation du téléphone
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    if (!data.phone.trim() || !phoneRegex.test(data.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Numéro de téléphone invalide';
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Prénom *
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
            className={`w-full bg-white/5 border ${
              errors.firstName ? 'border-red-500' : 'border-white/10'
            } rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Nom *
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
            className={`w-full bg-white/5 border ${
              errors.lastName ? 'border-red-500' : 'border-white/10'
            } rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Email *
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => updateData({ email: e.target.value })}
          className={`w-full bg-white/5 border ${
            errors.email ? 'border-red-500' : 'border-white/10'
          } rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Téléphone *
        </label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => updateData({ phone: e.target.value })}
          placeholder="06 12 34 56 78"
          className={`w-full bg-white/5 border ${
            errors.phone ? 'border-red-500' : 'border-white/10'
          } rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500`}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full py-3 font-semibold transition-colors flex items-center justify-center gap-2"
      >
        Suivant
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </form>
  );
}
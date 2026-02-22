// components/rdv/ContactForm.tsx
'use client';

import { useState, useCallback } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

interface ContactFormProps {
  data: ContactData;
  updateData: (data: Partial<ContactData>) => void;
  onNext: () => void;
}

interface AddressSuggestion {
  label: string;
  context: string;
}

// Simple debounce function
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
}

export default function ContactForm({ data, updateData, onNext }: ContactFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  const fetchAddresses = useCallback(async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setIsLoadingAddresses(true);
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      
      const suggestions = data.features.map((feature: any) => ({
        label: feature.properties.label,
        context: feature.properties.context
      }));
      
      setAddressSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresses:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les suggestions d'adresses",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [toast]);

  const debouncedFetchAddresses = useDebounce(fetchAddresses, 300);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!data.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!data.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim() || !emailRegex.test(data.email)) {
      newErrors.email = 'Email invalide';
    }

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

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    updateData({ address: suggestion.label });
    setShowSuggestions(false);
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

      <div className="relative">
        <label className="block text-white text-sm font-medium mb-2">
          Adresse *
        </label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => {
            updateData({ address: e.target.value });
            debouncedFetchAddresses(e.target.value);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Commencez à taper votre adresse..."
          className={`w-full bg-white/5 border ${
            errors.address ? 'border-red-500' : 'border-white/10'
          } rounded-lg px-4 py-2.5 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500`}
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-500">{errors.address}</p>
        )}
        
        {/* Suggestions d'adresses */}
        {showSuggestions && (data.address.length >= 3) && (
          <div className="absolute z-10 w-full mt-1 bg-black border border-white/10 rounded-lg shadow-lg">
            {isLoadingAddresses ? (
              <div className="p-4 text-center text-white/70">
                <Loader2 className="animate-spin inline mr-2 h-4 w-4" />
                Recherche d'adresses...
              </div>
            ) : addressSuggestions.length > 0 ? (
              <ul className="max-h-60 overflow-auto">
                {addressSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleAddressSelect(suggestion)}
                    className="px-4 py-2 hover:bg-white/5 cursor-pointer text-white border-b border-white/5 last:border-0"
                  >
                    <div className="font-medium">{suggestion.label}</div>
                    <div className="text-sm text-white/70">{suggestion.context}</div>
                  </li>
                ))}
              </ul>
            ) : data.address.length >= 3 && (
              <div className="p-4 text-center text-white/70">
                Aucune adresse trouvée
              </div>
            )}
          </div>
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
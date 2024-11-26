// components/quotes/ClientSection.tsx
"use client";

import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Search } from 'lucide-react';

interface ClientSectionProps {
  form: UseFormReturn<any>;
}

interface CompanySuggestion {
  name: string;
  siret: string;
  address: string;
  zipCode: string;
  city: string;
}

export default function ClientSection({ form }: ClientSectionProps) {
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [companySuggestions, setCompanySuggestions] = useState<CompanySuggestion[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  const clientType = form.watch('clientInfo.type');

  // Recherche d'entreprise via l'API INSEE
  const searchCompanies = async (search: string) => {
    if (search.length < 3) return;

    setIsLoadingCompanies(true);
    try {
      const response = await fetch(
        `https://api.insee.fr/entreprises/sirene/V3/siret?q=denominationUniteLegale:"${search}*"`, 
        {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_INSEE_API_KEY}`,
          }
        }
      );

      if (!response.ok) throw new Error('Erreur lors de la recherche d\'entreprises');

      const data = await response.json();
      const suggestions = data.etablissements.map((etab: any) => ({
        name: etab.uniteLegale.denominationUniteLegale,
        siret: etab.siret,
        address: etab.adresseEtablissement.numeroVoieEtablissement + ' ' + 
                etab.adresseEtablissement.typeVoieEtablissement + ' ' + 
                etab.adresseEtablissement.libelleVoieEtablissement,
        zipCode: etab.adresseEtablissement.codePostalEtablissement,
        city: etab.adresseEtablissement.libelleCommuneEtablissement
      }));

      setCompanySuggestions(suggestions);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  // Recherche d'adresse via l'API adresse.data.gouv.fr
  const searchAddress = async (search: string) => {
    if (search.length < 3) return;

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(search)}&limit=5`
      );
      const data = await response.json();
      setAddressSuggestions(data.features.map((f: any) => f.properties.label));
    } catch (error) {
      console.error('Erreur:', error);
      setAddressSuggestions([]);
    }
  };

  // Sélection d'une entreprise
  const handleCompanySelect = (company: CompanySuggestion) => {
    form.setValue('clientInfo.company.name', company.name);
    form.setValue('clientInfo.company.siret', company.siret);
    form.setValue('clientInfo.address', `${company.address}, ${company.zipCode} ${company.city}`);
    setCompanySuggestions([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations client</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type de client */}
        <FormField
          control={form.control}
          name="clientInfo.type"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>Type de client</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <label htmlFor="individual">Particulier</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company" />
                    <label htmlFor="company">Entreprise</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Champs spécifiques selon le type de client */}
        {clientType === 'individual' ? (
          // Champs pour particulier
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="clientInfo.individual.firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Prénom" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientInfo.individual.lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          // Champs pour entreprise
          <div className="space-y-4">
            <div className="relative">
              <FormField
                control={form.control}
                name="clientInfo.company.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l&apos;entreprise</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Rechercher une entreprise..."
                          onChange={(e) => {
                            field.onChange(e);
                            setCompanySearchTerm(e.target.value);
                            searchCompanies(e.target.value);
                          }}
                        />
                        <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isLoadingCompanies && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                </div>
              )}
              {companySuggestions.length > 0 && (
                <Card className="absolute z-50 w-full mt-1">
                  <CardContent className="p-0">
                    <ul className="max-h-[200px] overflow-y-auto">
                      {companySuggestions.map((company, index) => (
                        <li
                          key={company.siret}
                          className="p-2 hover:bg-accent cursor-pointer"
                          onClick={() => handleCompanySelect(company)}
                        >
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-muted-foreground">
                            SIRET: {company.siret}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {company.address}, {company.zipCode} {company.city}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            <FormField
              control={form.control}
              name="clientInfo.company.siret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SIRET</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="XXX XXX XXX XXXXX" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Champs communs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clientInfo.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <PhoneInput
                    country={'fr'}
                    value={field.value}
                    onChange={(phone) => field.onChange(phone)}
                    inputClass="w-full"
                    containerClass="phone-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientInfo.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="email@exemple.fr" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="clientInfo.address"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Adresse complète"
                  onChange={(e) => {
                    field.onChange(e);
                    searchAddress(e.target.value);
                  }}
                />
              </FormControl>
              {addressSuggestions.length > 0 && (
                <Card className="absolute z-50 w-full mt-1">
                  <CardContent className="p-0">
                    <ul className="max-h-[200px] overflow-y-auto">
                      {addressSuggestions.map((address, index) => (
                        <li
                          key={index}
                          className="p-2 hover:bg-accent cursor-pointer"
                          onClick={() => {
                            field.onChange(address);
                            setAddressSuggestions([]);
                          }}
                        >
                          {address}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
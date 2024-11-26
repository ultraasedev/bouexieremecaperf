// components/quotes/PaymentSection.tsx
"use client";

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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import { QUOTE_CONSTANTS } from '@/types/quote';
import { addDays } from 'date-fns';

interface PaymentSectionProps {
  form: UseFormReturn<any>;
}

export default function PaymentSection({ form }: PaymentSectionProps) {
  // Définition des périodes de validité possibles
  const validityPeriods = [
    { value: '15', label: '15 jours' },
    { value: '30', label: '30 jours' },
    { value: '60', label: '60 jours' },
    { value: '90', label: '90 jours' },
  ];

  // Calcul automatique de la date d'échéance en fonction des conditions
  const updateDueDate = (condition: string) => {
    let daysToAdd = 0;
    switch (condition) {
      case 'cash':
        daysToAdd = 0;
        break;
      case 'upon_receipt':
        daysToAdd = 0;
        break;
      case 'fifteen_days':
        daysToAdd = 15;
        break;
      case 'thirty_days':
        daysToAdd = 30;
        break;
      case 'fortyfive_days':
        daysToAdd = 45;
        break;
      case 'sixty_days':
        daysToAdd = 60;
        break;
      default:
        daysToAdd = 0;
    }
    
    const dueDate = addDays(new Date(), daysToAdd);
    form.setValue('paymentDetails.dueDate', dueDate);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conditions de règlement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Condition de paiement */}
          <FormField
            control={form.control}
            name="paymentDetails.condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mode de règlement</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    updateDueDate(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez les conditions de paiement" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="deposit">Acompte</SelectItem>
                    <SelectItem value="cash">Comptant</SelectItem>
                    <SelectItem value="upon_receipt">À réception</SelectItem>
                    <SelectItem value="fifteen_days">Sous 15 jours</SelectItem>
                    <SelectItem value="thirty_days">Sous 30 jours</SelectItem>
                    <SelectItem value="fortyfive_days">Sous 45 jours</SelectItem>
                    <SelectItem value="sixty_days">Sous 60 jours</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Acompte si sélectionné */}
          {form.watch('paymentDetails.condition') === 'deposit' && (
            <FormField
              control={form.control}
              name="paymentDetails.depositPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pourcentage d&apos;acompte</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Montant de l&apos;acompte : 
                    {((form.watch('totals.totalTTC') || 0) * 
                      (field.value || 0) / 100).toFixed(2)}€
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Validité du devis */}
          <FormField
            control={form.control}
            name="validityPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée de validité</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={String(field.value || 30)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez la durée de validité" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {validityPeriods.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Date limite de validité : {addDays(new Date(), field.value || 30).toLocaleDateString()}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations complémentaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notes générales */}
          <Accordion type="single" collapsible>
            <AccordionItem value="notes">
              <AccordionTrigger>Notes et conditions</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes additionnelles</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Ajoutez des notes qui apparaîtront sur le devis..."
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conditions particulières</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Conditions spécifiques à ce devis..."
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Mentions légales par défaut */}
          <div className="text-sm text-muted-foreground space-y-2 border-t pt-4">
            <p>Mentions légales par défaut :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>TVA non applicable, art. 293 B du CGI</li>
              <li>Devis valable {form.watch('validityPeriod') || 30} jours</li>
              <li>En cas d'acceptation, merci de retourner le devis signé avec la mention "Bon pour accord"</li>
              {form.watch('paymentDetails.condition') === 'deposit' && (
                <li>Un acompte de {form.watch('paymentDetails.depositPercentage')}% sera demandé à la commande</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
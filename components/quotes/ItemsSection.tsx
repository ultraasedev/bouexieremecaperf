// components/quotes/ItemsSection.tsx
"use client";

import { useState, useEffect } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calculator } from 'lucide-react';
import { QUOTE_CONSTANTS } from '@/types/quote';

interface ItemsSectionProps {
  form: UseFormReturn<any>;
}

interface Totals {
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  totalRemise: number;
}

export default function ItemsSection({ form }: ItemsSectionProps) {
  const [totals, setTotals] = useState<Totals>({
    totalHT: 0,
    totalTVA: 0,
    totalTTC: 0,
    totalRemise: 0,
  });

  // Utilisation de useFieldArray pour gérer le tableau d'articles
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Calcul des totaux
  const calculateTotals = () => {
    const items = form.getValues('items') || [];
    let totalHT = 0;
    let totalTVA = 0;
    let totalRemise = 0;
  
    items.forEach((item: any) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPriceHT = parseFloat(item.unitPriceHT) || 0;
      const vatRate = parseFloat(item.vatRate) || 0;
      
      const lineTotal = quantity * unitPriceHT;
      let discount = 0;
  
      if (item.discount && item.discount.value) {
        if (item.discount.type === 'percentage') {
          discount = lineTotal * (parseFloat(item.discount.value) / 100);
        } else {
          discount = parseFloat(item.discount.value);
        }
      }
  
      const lineTotalAfterDiscount = lineTotal - discount;
      const lineTVA = lineTotalAfterDiscount * (vatRate / 100);
  
      totalHT += lineTotalAfterDiscount;
      totalTVA += lineTVA;
      totalRemise += discount;
    });
  
    const totalTTC = totalHT + totalTVA;
  
    const roundToTwo = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;
  
    setTotals({
      totalHT: roundToTwo(totalHT),
      totalTVA: roundToTwo(totalTVA),
      totalTTC: roundToTwo(totalTTC),
      totalRemise: roundToTwo(totalRemise)
    });
  
    form.setValue('totals', {
      totalHT: roundToTwo(totalHT),
      totalTVA: roundToTwo(totalTVA),
      totalTTC: roundToTwo(totalTTC),
      totalRemise: roundToTwo(totalRemise)
    });
  };
  // Recalcul des totaux à chaque changement des articles
  useEffect(() => {
    calculateTotals();
  }, [form.watch('items')]);

  // Ajout d'un nouvel article
  const addItem = () => {
    append({
      description: '',
      quantity: 1,
      unit: 'heure',
      unitPriceHT: 0,
      vatRate: 20,
      discount: {
        type: 'percentage',
        value: 0,
      },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Articles et prestations</CardTitle>
        <Button onClick={addItem} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une ligne
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Description</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Unité</TableHead>
                <TableHead>Prix HT</TableHead>
                <TableHead>TVA (%)</TableHead>
                <TableHead>Remise</TableHead>
                <TableHead>Total HT</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} placeholder="Description de l'article ou du service" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                              onChange={(e) => {
                                field.onChange(Number(e.target.value));
                                calculateTotals();
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`items.${index}.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Unité" />
                            </SelectTrigger>
                            <SelectContent>
                              {QUOTE_CONSTANTS.UNITS.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPriceHT`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                               className="w-32"
                              onChange={(e) => {
                                field.onChange(Number(e.target.value));
                                calculateTotals();
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`items.${index}.vatRate`}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(Number(value));
                              calculateTotals();
                            }}
                            defaultValue={String(field.value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="TVA" />
                            </SelectTrigger>
                            <SelectContent>
                              {QUOTE_CONSTANTS.VAT_RATES.map((rate) => (
                                <SelectItem key={rate} value={String(rate)}>
                                  {rate}%
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.discount.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-20"
                                onChange={(e) => {
                                  field.onChange(Number(e.target.value));
                                  calculateTotals();
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.discount.type`}
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                calculateTotals();
                              }}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">%</SelectItem>
                                <SelectItem value="amount">€</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {((form.watch(`items.${index}.quantity`) || 0) * 
                      (form.watch(`items.${index}.unitPriceHT`) || 0)).toFixed(2)}€
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="border-t">
        <div className="ml-auto space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total HT:</span>
            <span className="font-medium">{totals.totalHT.toFixed(2)}€</span>
          </div>
          {totals.totalRemise > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Remise totale:</span>
              <span>-{totals.totalRemise.toFixed(2)}€</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>TVA:</span>
            <span>{totals.totalTVA.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total TTC:</span>
            <span>{totals.totalTTC.toFixed(2)}€</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
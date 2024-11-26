// components/quotes/QuoteForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { quoteSchema, Quote, VatRate, ClientInfo, QuoteItem, PaymentCondition } from "@/types/quote";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import ClientSection from '@/components/quotes/ClientSection';
import ItemsSection from '@/components/quotes/ItemsSection';
import PaymentSection from '@/components/quotes/PaymentSection';
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";

interface QuoteFormProps {
  initialData?: Quote;
  mode: 'create' | 'edit';
}

interface QuoteFormData {
  clientInfo: ClientInfo;
  clientId?: string;
  items: QuoteItem[];
  paymentDetails: {
    condition: PaymentCondition;
    depositPercentage?: number;
  };
  validityPeriod: number;
  notes?: string;
  totals: {
    totalHT: number;
    totalTTC: number;
    totalTVA: number;
    totalRemise: number;
  };
}

export function QuoteForm({ initialData, mode }: QuoteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: initialData || {
      clientInfo: {
        type: 'individual',
        email: '',
        phone: '',
        address: '',
        individual: {
          firstName: '',
          lastName: ''
        }
      },
      items: [
        {
          description: '',
          quantity: 1,
          unit: 'heure',
          unitPriceHT: 0,
          vatRate: 20 as VatRate,
          totalHT: 0,
        }
      ],
      paymentDetails: {
        condition: 'cash',
      },
      validityPeriod: 30,
      totals: {
        totalHT: 0,
        totalTVA: 0,
        totalTTC: 0,
        totalRemise: 0,
      },
    }
  });

  const onSubmit = async (data: QuoteFormData) => {
    setIsLoading(true);
    try {
      toast({
        title: mode === 'edit' ? "Modification" : "Création",
        description: `${mode === 'edit' ? 'Modification' : 'Création'} du devis en cours...`,
        duration: 2000,
      });

      const quoteData = {
        ...data,
        ...(mode === 'create' && {
          number: `DEV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
          date: new Date().toISOString(),
          status: 'DRAFT',
        })
      };

      const url = mode === 'edit' && initialData?.id
        ? `/api/quotes/${initialData.id}`
        : '/api/quotes';

      const response = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur lors de la ${mode === 'edit' ? 'modification' : 'création'} du devis`);
      }

      toast({
        title: "Succès",
        description: `Le devis a été ${mode === 'edit' ? 'modifié' : 'créé'} avec succès`,
        duration: 3000,
      });

      router.push('/dashboard/quotes');
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : `Impossible de ${mode === 'edit' ? 'modifier' : 'créer'} le devis`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">
            {mode === 'edit' ? 'Modifier le devis' : 'Créer un devis'}
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="client" className="w-full">
            <TabsList>
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="items">Articles</TabsTrigger>
              <TabsTrigger value="payment">Paiement</TabsTrigger>
            </TabsList>

            <TabsContent value="client">
              <ClientSection form={form} />
            </TabsContent>

            <TabsContent value="items">
              <ItemsSection form={form} />
            </TabsContent>

            <TabsContent value="payment">
              <PaymentSection form={form} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/quotes')}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-[200px]"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'edit' ? 'Modification...' : 'Création...'}
                </span>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {mode === 'edit' ? 'Modifier' : 'Créer'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  quoteSchema,
  VatRate,
  Quote,
  ClientInfo,
  QuoteItem,
  PaymentCondition,
} from "@/types/quote";
import { transformFormDataToQuote, calculateQuoteTotals } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Printer,
  Mail,
  Save,
  Trash,
  Plus,
  ArrowLeft,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import ClientSection from "@/components/quotes/ClientSection";
import ItemsSection from "@/components/quotes/ItemsSection";
import PaymentSection from "@/components/quotes/PaymentSection";
import PreviewModal from "@/components/quotes/PreviewModal";
import SendQuoteModal from "@/components/quotes/SendQuoteModal";

import { addDays } from 'date-fns';
import "@/app/styles/print.css";

interface SavedQuote extends Quote {
  id: string;
  number: string;
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

interface ExistingClient {
  id: string;
  type: "individual" | "company";
  individual?: {
    firstName: string;
    lastName: string;
  };
  company?: {
    name: string;
    siret: string;
    vatNumber?: string;
  };
  email: string;
  phone: string;
  address: string;
}

export default function CreateQuotePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [existingClients, setExistingClients] = useState<ExistingClient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedQuote, setSavedQuote] = useState<SavedQuote | null>(null);
  const router = useRouter();

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      clientInfo: {
        type: "individual" as const,
        email: "",
        phone: "",
        address: "",
        individual: {
          firstName: "",
          lastName: "",
        },
      },
      items: [
        {
          description: "",
          quantity: 1,
          unit: "heure",
          unitPriceHT: 0,
          vatRate: 20 as VatRate,
          totalHT: 0,
        },
      ],
      paymentDetails: {
        condition: "cash" as const,
      },
      validityPeriod: 30,
      totals: {
        totalHT: 0,
        totalTVA: 0,
        totalTTC: 0,
        totalRemise: 0,
      },
    },
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients");
        const data = await response.json();
        setExistingClients(data);
      } catch (error) {
        console.error("Erreur lors du chargement des clients:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les clients",
          variant: "destructive",
          duration: 3000,
        });
      }
    };
    fetchClients();
  }, []);

  const onSubmit = async (data: QuoteFormData) => {
    setIsLoading(true);
    try {
      toast({
        title: "En cours",
        description: "Création du devis en cours...",
        duration: 2000,
      });

      // Générer le numéro de devis
      const quoteNumber = `DEV-${new Date().getFullYear()}-${String(
        Date.now()
      ).slice(-4)}`;

      // Créer l'objet pour l'API
      const quoteData = {
        ...data,
        number: quoteNumber,
        date: new Date().toISOString(),
        clientId: data.clientId || "", // Assurez-vous d'avoir l'ID du client
        status: "DRAFT",
      };

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la création du devis"
        );
      }

      const newQuote = await response.json();
      setSavedQuote(newQuote);

      toast({
        title: "Succès",
        description: "Le devis a été créé avec succès",
        duration: 3000,
      });

      router.push("/dashboard/quotes");
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de créer le devis",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setShowResetAlert(true);
  };

  const handleClientSelect = (client: ExistingClient) => {
    form.setValue("clientInfo", {
      type: client.type,
      email: client.email,
      phone: client.phone,
      address: client.address,
      ...(client.type === "individual" && client.individual
        ? { individual: client.individual }
        : {}),
      ...(client.type === "company" && client.company
        ? { company: client.company }
        : {}),
    });
    form.setValue("clientId", client.id);
    setShowClientSearch(false);
  };

  const handleSendQuote = () => {
    if (!savedQuote?.id) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord sauvegarder le devis",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    setShowSendModal(true);
  };

  const handlePrint = (data: QuoteFormData) => {
    const printContent = document.querySelector(".preview-content")?.innerHTML;
    if (!printContent) {
      toast({
        title: "Erreur",
        description: "Impossible de préparer l'impression",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const quoteNumber = savedQuote?.number || "BROUILLON";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Devis ${quoteNumber}</title>
          <link href="${window.location.origin}/print.css" rel="stylesheet" />
          <style>
            body { margin: 0; padding: 20mm; }
            .page { width: 210mm; min-height: 297mm; }
            @media print {
              .page { margin: 0; }
            }
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="page">
            ${printContent}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const filteredClients = searchTerm
    ? existingClients.filter((client) =>
        client.type === "company"
          ? client.company?.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          : `${client.individual?.firstName} ${client.individual?.lastName}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
      )
    : existingClients;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Créer un devis</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowClientSearch(true)}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            <span>Rechercher un client</span>
          </Button>
          <Button variant="destructive" onClick={handleReset}>
            <Trash className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <Button variant="default" onClick={() => setShowPreview(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Aperçu
          </Button>
          <Button
            variant="default"
            onClick={() => handlePrint(form.getValues())}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="default" onClick={handleSendQuote}>
            <Mail className="h-4 w-4 mr-2" />
            Envoyer
          </Button>
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
            <Button type="submit" disabled={isLoading} className="w-[200px]">
              {isLoading ? "Création..." : "Créer le devis"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Modales */}
      {showPreview && (
        <PreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          data={{
            ...form.getValues(),
            id: savedQuote?.id,
            number: savedQuote?.number || "BROUILLON",
            // Ajout des propriétés manquantes
            date: savedQuote?.date || new Date(),
            validityDate:
              savedQuote?.validityDate ||
              addDays(new Date(), form.getValues().validityPeriod),
            status: savedQuote?.status || "DRAFT",
            totalHT: form.getValues().totals.totalHT,
            totalTTC: form.getValues().totals.totalTTC,
            totalVAT: form.getValues().totals.totalTVA,
            totalRemise: form.getValues().totals.totalRemise,
            createdAt: savedQuote?.createdAt || new Date(),
            updatedAt: savedQuote?.updatedAt || new Date(),
            sentAt: savedQuote?.sentAt,
            viewedAt: savedQuote?.viewedAt,
          }}
          onPrint={handlePrint}
        />
      )}

{showSendModal && (
  <SendQuoteModal
    open={showSendModal}
    onClose={() => setShowSendModal(false)}
    data={{
      ...form.getValues(),
      id: savedQuote?.id,
      number: savedQuote?.number || 'BROUILLON',
      date: savedQuote?.date || new Date(),
      validityDate: savedQuote?.validityDate || addDays(new Date(), form.getValues().validityPeriod),
      status: savedQuote?.status || 'DRAFT',
      totalHT: form.getValues().totals.totalHT,
      totalTTC: form.getValues().totals.totalTTC,
      totalVAT: form.getValues().totals.totalTVA,
      totalRemise: form.getValues().totals.totalRemise,
      createdAt: savedQuote?.createdAt || new Date(),
      updatedAt: savedQuote?.updatedAt || new Date(),
      sentAt: savedQuote?.sentAt,
      viewedAt: savedQuote?.viewedAt,
    }}
  />
)}

      <AlertDialog open={showResetAlert} onOpenChange={setShowResetAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser le formulaire ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Toutes les informations
              saisies seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                form.reset();
                setSavedQuote(null);
                setShowResetAlert(false);
              }}
            >
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showClientSearch} onOpenChange={setShowClientSearch}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rechercher un client existant</DialogTitle>
            <DialogDescription>
              Sélectionnez un client pour pré-remplir les informations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="grid gap-4">
              {filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleClientSelect(client)}
                >
                  <CardContent className="p-4">
                    <div className="font-medium">
                      {client.type === "company"
                        ? client.company?.name
                        : `${client.individual?.firstName} ${client.individual?.lastName}`}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <div>{client.email}</div>
                      <div>{client.email}</div>
                      <div>{client.phone}</div>
                      <div>{client.address}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredClients.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Aucun client trouvé
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

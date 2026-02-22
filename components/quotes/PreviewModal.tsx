// components/quotes/PreviewModal.tsx
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Quote, QuoteItem, QuoteFormData } from "@/types/quote";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Printer, Download } from "lucide-react";

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  data: Quote;
  onPrint?: (data: QuoteFormData) => void;
}

export default function PreviewModal({
  open,
  onClose,
  data,
  onPrint,
}: PreviewModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const handleDownloadPDF = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/quotes/${data.id}/pdf`);
      if (!response.ok) throw new Error('Erreur lors du téléchargement');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devis-${data.number}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Succès",
        description: "Le PDF a été téléchargé"
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le PDF",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async () => {
    if (onPrint) {
      onPrint(data as unknown as QuoteFormData);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/quotes/${data.id}/pdf`);
      if (!response.ok) throw new Error('Erreur lors de la génération du PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const printFrame = document.createElement('iframe');
      printFrame.style.display = 'none';
      document.body.appendChild(printFrame);
      printFrame.src = url;

      printFrame.onload = () => {
        try {
          printFrame.contentWindow?.print();
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Impossible d'imprimer le document",
            variant: "destructive"
          });
        } finally {
          setTimeout(() => {
            document.body.removeChild(printFrame);
            window.URL.revokeObjectURL(url);
          }, 1000);
        }
      };
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de préparer l'impression",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateLineTotals = (item: QuoteItem) => {
    const quantity = Number(item.quantity) || 0;
    const unitPriceHT = Number(item.unitPriceHT) || 0;
    const lineTotal = quantity * unitPriceHT;

    let discount = 0;
    if (item.discount) {
      if (item.discount.type === "percentage") {
        discount = lineTotal * (item.discount.value / 100);
      } else {
        discount = Number(item.discount.value) || 0;
      }
    }

    const totalHT = lineTotal - discount;
    return {
      totalHT,
      discount,
    };
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aperçu du devis n°{data.number}</DialogTitle>
          <DialogDescription>
            Aperçu du devis avant envoi ou impression
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 p-6 preview-content">
          {/* En-tête */}
          <div className="flex justify-between">
            <div>
              <Image
                src="/logo.png"
                alt="Logo"
                width={200}
                height={80}
                className="mb-4"
              />
              <div className="text-sm space-y-1">
                <p className="font-bold">Bouexiere Meca Performance</p>
                <p>1 rue de la Mécanique</p>
                <p>35340 La Bouexière</p>
                <p>Tél : 02.99.XX.XX.XX</p>
                <p>Email : contact@bmp.resend.dev</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold mb-2">DEVIS</h2>
              <p className="text-sm">Devis n° {data.number}</p>
              <p className="text-sm">
                Date : {format(new Date(data.date), "dd/MM/yyyy", { locale: fr })}
              </p>
              <p className="text-sm">
                Validité : {format(new Date(data.validityDate), "dd/MM/yyyy", { locale: fr })}
              </p>
            </div>
          </div>

          {/* Informations client */}
          <div className="border p-4 rounded-lg bg-muted/50">
            <h3 className="font-bold mb-2">CLIENT</h3>
            <div className="text-sm space-y-1">
              {data.clientInfo.type === "company" && data.clientInfo.company ? (
                <>
                  <p className="font-semibold">{data.clientInfo.company.name}</p>
                  <p>SIRET : {data.clientInfo.company.siret}</p>
                  {data.clientInfo.company.vatNumber && (
                    <p>TVA : {data.clientInfo.company.vatNumber}</p>
                  )}
                </>
              ) : data.clientInfo.type === "individual" &&
                data.clientInfo.individual ? (
                <p className="font-semibold">
                  {data.clientInfo.individual.firstName}{" "}
                  {data.clientInfo.individual.lastName}
                </p>
              ) : null}
              <p>{data.clientInfo.address}</p>
              <p>Tél : {data.clientInfo.phone}</p>
              <p>Email : {data.clientInfo.email}</p>
            </div>
          </div>

          {/* Tableau des articles */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Description</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Prix unitaire HT</TableHead>
                <TableHead className="text-right">TVA</TableHead>
                <TableHead className="text-right">Remise</TableHead>
                <TableHead className="text-right">Total HT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item, index) => {
                const lineTotals = calculateLineTotals(item);
                return (
                  <TableRow key={index}>
                    <TableCell className="align-top">
                      <div>
                        <p className="font-medium">{item.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(item.unitPriceHT)}
                    </TableCell>
                    <TableCell className="text-right">{item.vatRate}%</TableCell>
                    <TableCell className="text-right">
                      {item.discount && item.discount.value > 0
                        ? item.discount.type === "percentage"
                          ? `${item.discount.value}%`
                          : formatPrice(item.discount.value)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(lineTotals.totalHT)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Totaux */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between">
                <span>Total HT :</span>
                <span className="font-medium">{formatPrice(data.totalHT)}</span>
              </div>
              {data.totalRemise > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Remise totale :</span>
                  <span>-{formatPrice(data.totalRemise)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>TVA :</span>
                <span>{formatPrice(data.totalVAT)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total TTC :</span>
                <span>{formatPrice(data.totalTTC)}</span>
              </div>
            </div>
          </div>

          {/* Conditions de paiement et mentions légales */}
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-bold mb-2">CONDITIONS DE RÈGLEMENT</h3>
              <p>Paiement à réception de facture</p>
            </div>

            {data.notes && (
              <div>
                <h3 className="font-bold mb-2">NOTES</h3>
                <p className="whitespace-pre-wrap">{data.notes}</p>
              </div>
            )}

            <div className="border-t pt-4 text-muted-foreground">
              <p>TVA non applicable, art. 293 B du CGI</p>
              <p>Auto-entrepreneur - Dispensé d'immatriculation au RCS et au RM</p>
              <p className="mt-2">
                En cas d'acceptation, merci de retourner ce devis signé avec la mention
                "Bon pour accord"
              </p>
            </div>

            {/* Zone de signature */}
            <div className="border-t pt-4 mt-8">
              <div className="flex justify-end gap-16">
                <div>
                  <p className="font-bold mb-2">Bon pour accord</p>
                  <p className="text-muted-foreground">
                    Date et signature du client
                  </p>
                  <div className="border border-dashed w-[200px] h-[100px] mt-2"></div>
                </div>
                <div>
                  <p className="font-bold mb-2">Bouexiere Meca Performance</p>
                  <div className="w-[200px] h-[100px] mt-2 flex items-end justify-end">
                    <Image
                      src="/signature.png"
                      alt="Signature"
                      width={150}
                      height={60}
                      className="opacity-80"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Fermer
          </Button>

          <Button variant="outline" onClick={handlePrint} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Préparation...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" />
                Imprimer
              </>
            )}
          </Button>

          <Button onClick={handleDownloadPDF} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Téléchargement...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
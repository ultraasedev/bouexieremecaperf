// components/quotes/QuoteDialogs.tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Quote } from '@/types/quote';
import PreviewModal from './PreviewModal';
import SendQuoteModal from './SendQuoteModal';

interface QuoteDialogsProps {
  quote: Quote | null;
  isPreviewOpen: boolean;
  isSendOpen: boolean;
  isDeleteDialogOpen: boolean;
  isLoading: boolean;
  onPreviewClose: () => void;
  onSendClose: () => void;
  onDeleteClose: () => void;
  onConfirmDelete: () => void;
  onPrint?: (data: any) => void;
}

export default function QuoteDialogs({
  quote,
  isPreviewOpen,
  isSendOpen,
  isDeleteDialogOpen,
  isLoading,
  onPreviewClose,
  onSendClose,
  onDeleteClose,
  onConfirmDelete,
  onPrint
}: QuoteDialogsProps) {
  if (!quote) return null;

  // Transformer les données du devis pour le PreviewModal
  const previewData = {
    ...quote,
    number: quote.number,
    validityPeriod: 30, // ou calculer à partir de quote.validityDate
    clientInfo: quote.clientInfo,
    items: quote.items,
    paymentDetails: {
      condition: quote.paymentDetails.condition,
      depositPercentage: quote.paymentDetails.depositPercentage
    },
    notes: quote.notes,
    totals: {
      totalHT: quote.totalHT,
      totalTTC: quote.totalTTC,
      totalTVA: quote.totalVAT,
      totalRemise: quote.totalRemise
    }
  };

  // Fonction pour calculer la période de validité en jours
  const calculateValidityPeriod = (validityDate: Date): number => {
    const today = new Date();
    const validity = new Date(validityDate);
    const diffTime = Math.abs(validity.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Transformer les données pour l'envoi
  const sendData = {
    ...quote,
    validityPeriod: calculateValidityPeriod(new Date(quote.validityDate))
  };

  return (
    <>
      <PreviewModal
        open={isPreviewOpen}
        onClose={onPreviewClose}
        onPrint={onPrint || (() => {})}
        data={previewData}
      />

      <SendQuoteModal
        open={isSendOpen}
        onClose={onSendClose}
        data={sendData}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={onDeleteClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              {quote.status === 'DRAFT' ? (
                "Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible."
              ) : (
                "Seuls les devis en brouillon peuvent être supprimés. Veuillez d'abord annuler ce devis."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onDeleteClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={isLoading || quote.status !== 'DRAFT'}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Suppression en cours...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
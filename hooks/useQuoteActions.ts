// hooks/useQuoteActions.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Quote } from '@/types/quote';
import { useToast } from '@/components/ui/use-toast';

export function useQuoteActions() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePreview = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsPreviewOpen(true);
  };

  const handleSend = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsSendOpen(true);
  };

  const handleEdit = (quote: Quote) => {
    router.push(`/dashboard/quotes/${quote.id}/edit`);
  };

  const handlePrint = async (quote: Quote) => {
    try {
      const response = await fetch(`/api/quotes/${quote.id}/pdf`);
      if (!response.ok) throw new Error('Erreur lors de la génération du PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devis-${quote.number}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (quote: Quote) => {
    setSelectedQuote(quote);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedQuote) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/quotes/${selectedQuote.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      toast({
        title: "Succès",
        description: "Le devis a été supprimé",
      });
      
      // Rafraîchir la liste
      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le devis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedQuote(null);
    }
  };

  return {
    isPreviewOpen,
    isSendOpen,
    isDeleteDialogOpen,
    isLoading,
    selectedQuote,
    setIsPreviewOpen,
    setIsSendOpen,
    setIsDeleteDialogOpen,
    handlePreview,
    handleSend,
    handleEdit,
    handlePrint,
    handleDelete,
    confirmDelete,
  };
}
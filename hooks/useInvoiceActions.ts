// hooks/useInvoiceActions.ts
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import type { Invoice } from '@/types/invoice';

export function useInvoiceActions() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleView = (invoice: Invoice) => {
    router.push(`/dashboard/factures/${invoice.id}`);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`);
      if (!response.ok) throw new Error('Erreur PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${invoice.number}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le PDF',
        variant: 'destructive',
      });
    }
  };

  const handleSend = async (invoice: Invoice) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: 'POST',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur');
      }
      toast({
        title: 'Succès',
        description: 'Facture marquée comme envoyée',
      });
      return true;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : "Erreur lors de l'envoi",
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedInvoice) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur');
      }
      toast({
        title: 'Succès',
        description: 'Facture supprimée',
      });
      setIsDeleteDialogOpen(false);
      return true;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de la suppression',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsCancelDialogOpen(true);
  };

  const confirmCancel = async (reason: string) => {
    if (!selectedInvoice) return;
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invoices/${selectedInvoice.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur');
      }
      toast({
        title: 'Succès',
        description: 'Facture annulée',
      });
      setIsCancelDialogOpen(false);
      return true;
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : "Erreur lors de l'annulation",
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  return {
    selectedInvoice,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isLoading,
    handleView,
    handleDownloadPDF,
    handleSend,
    handleDelete,
    confirmDelete,
    handleCancel,
    confirmCancel,
    handlePayment,
  };
}

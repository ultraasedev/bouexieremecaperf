// app/dashboard/factures/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Invoice, InvoiceStatus } from '@/types/invoice';
import { INVOICE_CONSTANTS } from '@/types/invoice';
import { useInvoiceActions } from '@/hooks/useInvoiceActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import PaymentModal from '@/components/invoices/PaymentModal';
import {
  Plus, Search, MoreVertical, Eye, Download, Mail,
  Trash, Ban, CreditCard, Receipt,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusColors: Record<InvoiceStatus, string> = {
  DRAFT: 'text-yellow-600 bg-yellow-100',
  SENT: 'text-blue-600 bg-blue-100',
  PAID: 'text-green-600 bg-green-100',
  PARTIAL: 'text-orange-600 bg-orange-100',
  OVERDUE: 'text-red-600 bg-red-100',
  CANCELLED: 'text-gray-600 bg-gray-100',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const actions = useInvoiceActions();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (!response.ok) throw new Error('Erreur');
      const data = await response.json();
      setInvoices(data);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les factures',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

  const getClientName = (invoice: Invoice) => {
    const info = invoice.clientInfo as { type: string; individual?: { firstName: string; lastName: string }; company?: { name: string } };
    if (info.type === 'company') return info.company?.name || 'Client';
    return `${info.individual?.firstName || ''} ${info.individual?.lastName || ''}`.trim() || 'Client';
  };

  const filteredInvoices = invoices.filter(invoice => {
    const search = searchQuery.toLowerCase();
    return invoice.number.toLowerCase().includes(search) ||
      getClientName(invoice).toLowerCase().includes(search);
  });

  const handleSendAndRefresh = async (invoice: Invoice) => {
    const success = await actions.handleSend(invoice);
    if (success) fetchInvoices();
  };

  const handleDeleteAndRefresh = async () => {
    const success = await actions.confirmDelete();
    if (success) fetchInvoices();
  };

  const handleCancelAndRefresh = async () => {
    if (!cancelReason.trim()) {
      toast({ title: 'Erreur', description: "La raison d'annulation est obligatoire", variant: 'destructive' });
      return;
    }
    const success = await actions.confirmCancel(cancelReason);
    if (success) {
      setCancelReason('');
      fetchInvoices();
    }
  };

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Factures</h1>
          <Button onClick={() => router.push('/dashboard/factures/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle facture
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-6 w-1/3">
              <Search className="h-4 w-4 mr-2 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher une facture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Facture</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant TTC</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead className="text-right">Plus</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{invoice.number}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.date), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>{getClientName(invoice)}</TableCell>
                      <TableCell>{formatPrice(invoice.totalTTC)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[invoice.status]}`}>
                          {INVOICE_CONSTANTS.STATUS_LABELS[invoice.status]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                            onClick={() => actions.handleView(invoice)} title="Voir">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                            onClick={() => actions.handleDownloadPDF(invoice)} title="PDF">
                            <Download className="h-4 w-4" />
                          </Button>
                          {(invoice.status === 'DRAFT' || invoice.status === 'SENT' || invoice.status === 'PARTIAL') && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                              onClick={() => actions.handlePayment(invoice)} title="Paiement">
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => actions.handleView(invoice)}>
                              <Eye className="h-4 w-4 mr-2" /> Détail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => actions.handleDownloadPDF(invoice)}>
                              <Receipt className="h-4 w-4 mr-2" /> Télécharger PDF
                            </DropdownMenuItem>
                            {invoice.status === 'DRAFT' && (
                              <DropdownMenuItem onClick={() => handleSendAndRefresh(invoice)}>
                                <Mail className="h-4 w-4 mr-2" /> Envoyer
                              </DropdownMenuItem>
                            )}
                            {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
                              <DropdownMenuItem onClick={() => actions.handlePayment(invoice)}>
                                <CreditCard className="h-4 w-4 mr-2" /> Enregistrer paiement
                              </DropdownMenuItem>
                            )}
                            {invoice.status !== 'CANCELLED' && (
                              <DropdownMenuItem className="text-orange-600" onClick={() => actions.handleCancel(invoice)}>
                                <Ban className="h-4 w-4 mr-2" /> Annuler
                              </DropdownMenuItem>
                            )}
                            {invoice.status === 'DRAFT' && (
                              <DropdownMenuItem className="text-red-600" onClick={() => actions.handleDelete(invoice)}>
                                <Trash className="h-4 w-4 mr-2" /> Supprimer
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Aucune facture trouvée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal paiement */}
      <PaymentModal
        open={actions.isPaymentModalOpen}
        onClose={() => actions.setIsPaymentModalOpen(false)}
        invoice={actions.selectedInvoice}
        onSuccess={fetchInvoices}
      />

      {/* Dialog suppression */}
      <AlertDialog open={actions.isDeleteDialogOpen} onOpenChange={actions.setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette facture ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Seules les factures en brouillon peuvent être supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAndRefresh} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog annulation */}
      <AlertDialog open={actions.isCancelDialogOpen} onOpenChange={actions.setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette facture ?</AlertDialogTitle>
            <AlertDialogDescription>
              La facture sera marquée comme annulée. Cette action est obligatoirement accompagnée d&apos;un motif.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Motif d'annulation (obligatoire)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelReason('')}>Retour</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelAndRefresh} className="bg-orange-600 hover:bg-orange-700">
              Confirmer l&apos;annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

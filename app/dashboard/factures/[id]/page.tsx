// app/dashboard/factures/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Invoice, InvoicePayment } from '@/types/invoice';
import { INVOICE_CONSTANTS } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import PaymentModal from '@/components/invoices/PaymentModal';
import {
  ArrowLeft, Download, Mail, CreditCard, Ban, FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  SENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  PARTIAL: 'bg-orange-100 text-orange-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<{ payments: InvoicePayment[]; totalPaid: number; remaining: number }>({ payments: [], totalPaid: 0, remaining: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const fetchInvoice = async () => {
    try {
      const [invoiceRes, paymentsRes] = await Promise.all([
        fetch(`/api/invoices/${params.id}`),
        fetch(`/api/invoices/${params.id}/payment`),
      ]);
      if (!invoiceRes.ok) throw new Error('Facture non trouvée');
      setInvoice(await invoiceRes.json());
      if (paymentsRes.ok) setPayments(await paymentsRes.json());
    } catch {
      toast({ title: 'Erreur', description: 'Facture non trouvée', variant: 'destructive' });
      router.push('/dashboard/factures');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchInvoice(); }, [params.id]);

  const handleDownload = async () => {
    if (!invoice) return;
    const response = await fetch(`/api/invoices/${invoice.id}/pdf`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facture-${invoice.number}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSend = async () => {
    if (!invoice) return;
    const response = await fetch(`/api/invoices/${invoice.id}/send`, { method: 'POST' });
    if (response.ok) {
      toast({ title: 'Succès', description: 'Facture marquée comme envoyée' });
      fetchInvoice();
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!invoice) return null;

  const clientInfo = invoice.clientInfo as {
    type: string;
    individual?: { firstName: string; lastName: string };
    company?: { name: string; siret?: string };
    email: string; phone: string; address: string;
  };

  const clientName = clientInfo.type === 'company'
    ? clientInfo.company?.name
    : `${clientInfo.individual?.firstName || ''} ${clientInfo.individual?.lastName || ''}`;

  const items = (invoice.items || []) as Array<{
    description: string; quantity: number; unitPriceHT: number;
    vatRate: number; totalHT?: number;
  }>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard/factures')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
          <h1 className="text-2xl font-bold">Facture {invoice.number}</h1>
          <Badge className={statusColors[invoice.status]}>
            {INVOICE_CONSTANTS.STATUS_LABELS[invoice.status]}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
          {invoice.status === 'DRAFT' && (
            <Button onClick={handleSend}>
              <Mail className="h-4 w-4 mr-2" /> Envoyer
            </Button>
          )}
          {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
            <Button onClick={() => setIsPaymentOpen(true)}>
              <CreditCard className="h-4 w-4 mr-2" /> Paiement
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Infos facture */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Informations</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Date :</span> {format(new Date(invoice.date), 'dd MMMM yyyy', { locale: fr })}</p>
            <p><span className="font-medium">Échéance :</span> {format(new Date(invoice.dueDate), 'dd MMMM yyyy', { locale: fr })}</p>
            {invoice.sentAt && <p><span className="font-medium">Envoyée le :</span> {format(new Date(invoice.sentAt), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>}
            {invoice.paidAt && <p><span className="font-medium">Payée le :</span> {format(new Date(invoice.paidAt), 'dd/MM/yyyy', { locale: fr })}</p>}
            {invoice.cancelledAt && (
              <>
                <p className="text-red-600"><span className="font-medium">Annulée le :</span> {format(new Date(invoice.cancelledAt), 'dd/MM/yyyy', { locale: fr })}</p>
                {invoice.cancellationReason && <p className="text-red-600"><span className="font-medium">Motif :</span> {invoice.cancellationReason}</p>}
              </>
            )}
          </CardContent>
        </Card>

        {/* Client */}
        <Card>
          <CardHeader><CardTitle>Client</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{clientName}</p>
            <p>{clientInfo.address}</p>
            <p>{clientInfo.phone}</p>
            <p>{clientInfo.email}</p>
            {clientInfo.type === 'company' && clientInfo.company?.siret && (
              <p className="text-gray-500">SIRET : {clientInfo.company.siret}</p>
            )}
          </CardContent>
        </Card>

        {/* Montants */}
        <Card>
          <CardHeader><CardTitle>Montants</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Total HT</span><span>{formatPrice(invoice.totalHT)}</span></div>
            <div className="flex justify-between"><span>TVA</span><span>{formatPrice(invoice.totalVAT)}</span></div>
            {invoice.totalDiscount > 0 && <div className="flex justify-between"><span>Remise</span><span>-{formatPrice(invoice.totalDiscount)}</span></div>}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total TTC</span><span>{formatPrice(invoice.totalTTC)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-green-600"><span>Payé</span><span>{formatPrice(payments.totalPaid)}</span></div>
              <div className="flex justify-between text-orange-600 font-medium"><span>Reste dû</span><span>{formatPrice(payments.remaining)}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles */}
      <Card>
        <CardHeader><CardTitle>Lignes de facture</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Qté</TableHead>
                <TableHead>Prix U. HT</TableHead>
                <TableHead>TVA</TableHead>
                <TableHead className="text-right">Total HT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatPrice(item.unitPriceHT)}</TableCell>
                  <TableCell>{item.vatRate}%</TableCell>
                  <TableCell className="text-right">{formatPrice(item.totalHT ?? item.quantity * item.unitPriceHT)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Historique paiements */}
      {payments.payments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Historique des paiements</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(new Date(payment.date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                    <TableCell className="font-medium text-green-600">{formatPrice(payment.amount)}</TableCell>
                    <TableCell>{INVOICE_CONSTANTS.PAYMENT_METHODS[payment.method as keyof typeof INVOICE_CONSTANTS.PAYMENT_METHODS] || payment.method}</TableCell>
                    <TableCell>{payment.reference || '-'}</TableCell>
                    <TableCell>{payment.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <PaymentModal
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        invoice={invoice}
        onSuccess={fetchInvoice}
      />
    </div>
  );
}

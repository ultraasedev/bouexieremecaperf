// app/dashboard/factures/create/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, Trash, Save } from 'lucide-react';
import { QUOTE_CONSTANTS } from '@/types/quote';

interface Client {
  id: string;
  type: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPriceHT: number;
  vatRate: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentCondition, setPaymentCondition] = useState('upon_receipt');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPriceHT: 0, vatRate: 0 },
  ]);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPriceHT: 0, vatRate: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const totalHT = items.reduce((sum, item) => sum + item.quantity * item.unitPriceHT, 0);
  const totalVAT = items.reduce((sum, item) => sum + item.quantity * item.unitPriceHT * (item.vatRate / 100), 0);
  const totalTTC = totalHT + totalVAT;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un client', variant: 'destructive' });
      return;
    }
    if (!dueDate) {
      toast({ title: 'Erreur', description: "Veuillez renseigner la date d'échéance", variant: 'destructive' });
      return;
    }
    if (items.some(item => !item.description || item.quantity <= 0)) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les articles', variant: 'destructive' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          date: new Date().toISOString(),
          dueDate: new Date(dueDate).toISOString(),
          items,
          paymentDetails: { condition: paymentCondition },
          totalHT,
          totalTTC,
          totalVAT,
          totalDiscount: 0,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur');
      }

      const invoice = await response.json();
      toast({ title: 'Succès', description: `Facture ${invoice.number} créée` });
      router.push(`/dashboard/factures/${invoice.id}`);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de la création',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getClientLabel = (client: Client) => {
    if (client.type === 'company') return client.name || client.email;
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/factures')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
        <h1 className="text-2xl font-bold">Nouvelle facture</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client */}
          <Card>
            <CardHeader><CardTitle>Client</CardTitle></CardHeader>
            <CardContent>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {getClientLabel(client)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardHeader><CardTitle>Conditions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dueDate">Date d&apos;échéance</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
              </div>
              <div>
                <Label>Conditions de paiement</Label>
                <Select value={paymentCondition} onValueChange={setPaymentCondition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QUOTE_CONSTANTS.PAYMENT_CONDITIONS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Articles</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" /> Ajouter
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>Quantité</Label>
                  <Input
                    type="number" min="1" step="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Prix U. HT</Label>
                  <Input
                    type="number" min="0" step="0.01"
                    value={item.unitPriceHT}
                    onChange={(e) => updateItem(index, 'unitPriceHT', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>TVA %</Label>
                  <Select
                    value={item.vatRate.toString()}
                    onValueChange={(val) => updateItem(index, 'vatRate', parseFloat(val))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {QUOTE_CONSTANTS.VAT_RATES.map(rate => (
                        <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 text-right font-medium text-sm pt-6">
                  {formatPrice(item.quantity * item.unitPriceHT)}
                </div>
                <div className="col-span-1">
                  <Button
                    type="button" variant="ghost" size="sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-red-500"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 space-y-1 text-right">
              <p>Total HT : <span className="font-medium">{formatPrice(totalHT)}</span></p>
              <p>TVA : <span className="font-medium">{formatPrice(totalVAT)}</span></p>
              <p className="text-lg font-bold">Total TTC : {formatPrice(totalTTC)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes visibles sur la facture (optionnel)"
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/factures')}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Création...' : 'Créer la facture'}
          </Button>
        </div>
      </form>
    </div>
  );
}

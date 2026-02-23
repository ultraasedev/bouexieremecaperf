// app/dashboard/paiements/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Euro, Search, TrendingUp, Clock, CheckCircle2, Loader2 } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  method: string;
  date: string;
  reference: string | null;
  notes: string | null;
  invoice: {
    id: string;
    number: string;
    client: {
      name: string | null;
      firstName: string | null;
      lastName: string | null;
    };
  };
}

const methodLabels: Record<string, string> = {
  CASH: 'Espèces',
  CHECK: 'Chèque',
  TRANSFER: 'Virement',
  CARD: 'Carte bancaire',
  DIRECT_DEBIT: 'Prélèvement',
};

const methodColors: Record<string, string> = {
  CASH: 'bg-green-500/10 text-green-400 border-green-500/20',
  CHECK: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  TRANSFER: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  CARD: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  DIRECT_DEBIT: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

export default function PaiementsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/invoices?include=payments', { credentials: 'include' });
      if (res.ok) {
        const invoices = await res.json();
        const allPayments: Payment[] = [];
        for (const invoice of invoices) {
          if (invoice.payments) {
            for (const payment of invoice.payments) {
              allPayments.push({
                ...payment,
                invoice: {
                  id: invoice.id,
                  number: invoice.number,
                  client: invoice.client,
                },
              });
            }
          }
        }
        allPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPayments(allPayments);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    const clientName = p.invoice.client.name || `${p.invoice.client.firstName} ${p.invoice.client.lastName}`;
    const matchSearch = !search ||
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.invoice.number.toLowerCase().includes(search.toLowerCase()) ||
      (p.reference && p.reference.toLowerCase().includes(search.toLowerCase()));
    const matchMethod = methodFilter === 'all' || p.method === methodFilter;
    return matchSearch && matchMethod;
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  const getClientName = (client: Payment['invoice']['client']) =>
    client.name || `${client.firstName} ${client.lastName}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#1a1a1a] border-gray-800">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-green-500/10">
              <Euro className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total encaissé</p>
              <p className="text-2xl font-bold text-white">{totalAmount.toFixed(2)} €</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-gray-800">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <CheckCircle2 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Paiements reçus</p>
              <p className="text-2xl font-bold text-white">{payments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-gray-800">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Moyenne par paiement</p>
              <p className="text-2xl font-bold text-white">
                {payments.length > 0 ? (totalAmount / payments.length).toFixed(2) : '0.00'} €
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher par client, facture, référence..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-black/50 border-gray-700 text-white"
              />
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-black/50 border-gray-700 text-white">
                <SelectValue placeholder="Méthode" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white">
                <SelectItem value="all">Toutes les méthodes</SelectItem>
                <SelectItem value="CASH">Espèces</SelectItem>
                <SelectItem value="CHECK">Chèque</SelectItem>
                <SelectItem value="TRANSFER">Virement</SelectItem>
                <SelectItem value="CARD">Carte bancaire</SelectItem>
                <SelectItem value="DIRECT_DEBIT">Prélèvement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardContent className="p-0">
          {filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <CreditCard className="h-12 w-12 mb-3 text-gray-600" />
              <p className="text-lg font-medium">Aucun paiement</p>
              <p className="text-sm">Les paiements apparaîtront ici une fois enregistrés.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Client</TableHead>
                  <TableHead className="text-gray-400">Facture</TableHead>
                  <TableHead className="text-gray-400">Méthode</TableHead>
                  <TableHead className="text-gray-400">Référence</TableHead>
                  <TableHead className="text-gray-400 text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="border-gray-800 hover:bg-white/5">
                    <TableCell className="text-white">
                      {new Date(payment.date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {getClientName(payment.invoice.client)}
                    </TableCell>
                    <TableCell>
                      <span className="text-red-400 font-mono text-sm">{payment.invoice.number}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={methodColors[payment.method] || ''}>
                        {methodLabels[payment.method] || payment.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {payment.reference || '-'}
                    </TableCell>
                    <TableCell className="text-right text-white font-semibold">
                      {payment.amount.toFixed(2)} €
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

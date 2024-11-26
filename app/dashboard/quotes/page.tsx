"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Quote, QuoteStatus } from '@/types/quote';
import { useQuoteActions } from '@/hooks/useQuoteActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import QuoteDialogs from '@/components/quotes/QuoteDialogs';
import {
  FileText,
  Mail,
  MoreVertical,
  Plus,
  Printer,
  Search,
  Trash,
  Download,
  Edit,
  Share,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusColors: Record<QuoteStatus, string> = {
  DRAFT: 'text-yellow-600 bg-yellow-100',
  SENT: 'text-blue-600 bg-blue-100',
  VIEWED: 'text-purple-600 bg-purple-100',
  ACCEPTED: 'text-green-600 bg-green-100',
  REJECTED: 'text-red-600 bg-red-100',
  EXPIRED: 'text-gray-600 bg-gray-100',
  CANCELLED: 'text-red-600 bg-red-100'
};

const statusTexts: Record<QuoteStatus, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyé',
  VIEWED: 'Consulté',
  ACCEPTED: 'Accepté',
  REJECTED: 'Refusé',
  EXPIRED: 'Expiré',
  CANCELLED: 'Annulé'
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const quoteActions = useQuoteActions();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes');
      if (!response.ok) throw new Error('Erreur lors du chargement des devis');
      const data = await response.json();
      setQuotes(data);
    } catch (error) {
      console.error('Erreur lors du chargement des devis:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les devis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuote = () => {
    router.push('/dashboard/quotes/create');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getClientName = (quote: Quote) => {
    if (quote.clientInfo.type === 'company' && quote.clientInfo.company) {
      return quote.clientInfo.company.name;
    }
    if (quote.clientInfo.type === 'individual' && quote.clientInfo.individual) {
      return `${quote.clientInfo.individual.firstName} ${quote.clientInfo.individual.lastName}`;
    }
    return 'Client inconnu';
  };

  const filteredQuotes = quotes.filter(quote => {
    const searchLower = searchQuery.toLowerCase();
    const numberMatch = quote.number.toLowerCase().includes(searchLower);
    const clientMatch = getClientName(quote).toLowerCase().includes(searchLower);
    return numberMatch || clientMatch;
  });

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Devis</h1>
          <Button onClick={handleNewQuote}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau devis
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center w-1/3">
                <Search className="h-4 w-4 mr-2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Rechercher un devis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="relative overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° de devis</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Montant HT</TableHead>
                      <TableHead>Montant TTC</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions rapides</TableHead>
                      <TableHead className="text-right">Plus</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((quote) => (
                      <TableRow key={quote.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{quote.number}</TableCell>
                        <TableCell>
                          {format(new Date(quote.date), 'dd MMM yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>{getClientName(quote)}</TableCell>
                        <TableCell>{formatPrice(quote.totalHT)}</TableCell>
                        <TableCell>{formatPrice(quote.totalTTC)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[quote.status]}`}>
                            {statusTexts[quote.status]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => quoteActions.handlePreview(quote)}
                              title="Voir"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => quoteActions.handleSend(quote)}
                              title="Envoyer"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => quoteActions.handlePrint(quote)}
                              title="Télécharger PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
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
                              <DropdownMenuItem onClick={() => quoteActions.handleEdit(quote)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => quoteActions.handlePreview(quote)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Aperçu
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => quoteActions.handlePrint(quote)}>
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => quoteActions.handleSend(quote)}>
                                <Share className="h-4 w-4 mr-2" />
                                Envoyer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => quoteActions.handleDelete(quote)}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredQuotes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Aucun devis trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <QuoteDialogs
        quote={quoteActions.selectedQuote}
        isPreviewOpen={quoteActions.isPreviewOpen}
        isSendOpen={quoteActions.isSendOpen}
        isDeleteDialogOpen={quoteActions.isDeleteDialogOpen}
        isLoading={quoteActions.isLoading}
        onPreviewClose={() => quoteActions.setIsPreviewOpen(false)}
        onSendClose={() => quoteActions.setIsSendOpen(false)}
        onDeleteClose={() => quoteActions.setIsDeleteDialogOpen(false)}
        onConfirmDelete={quoteActions.confirmDelete}
      />
    </>
  );
}
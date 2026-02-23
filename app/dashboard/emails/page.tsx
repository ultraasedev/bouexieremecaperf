// app/dashboard/emails/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Search, Loader2, Send } from 'lucide-react';

interface EmailRecord {
  id: string;
  messageId: string;
  recipients: string[];
  subject: string;
  sentAt: string;
  quote?: {
    number: string;
  };
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        // Fetch quotes with their email data
        const res = await fetch('/api/quotes', { credentials: 'include' });
        if (res.ok) {
          const quotes = await res.json();
          const allEmails: EmailRecord[] = [];
          for (const quote of quotes) {
            if (quote.emailData) {
              for (const email of quote.emailData) {
                allEmails.push({ ...email, quote: { number: quote.number } });
              }
            }
          }
          allEmails.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
          setEmails(allEmails);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  }, []);

  const filtered = emails.filter(e =>
    !search ||
    e.subject.toLowerCase().includes(search.toLowerCase()) ||
    e.recipients.some(r => r.toLowerCase().includes(search.toLowerCase())) ||
    (e.quote?.number && e.quote.number.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-violet-500/10">
          <Mail className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Messagerie</h2>
          <p className="text-sm text-gray-400">{emails.length} email{emails.length > 1 ? 's' : ''} envoyé{emails.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {emails.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher par sujet, destinataire..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#1a1a1a] border-gray-700 text-white"
          />
        </div>
      )}

      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Send className="h-12 w-12 mb-3 text-gray-600" />
              <p className="text-lg font-medium">{search ? 'Aucun résultat' : 'Aucun email envoyé'}</p>
              <p className="text-sm">Les emails envoyés depuis les devis et factures apparaîtront ici.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Destinataire(s)</TableHead>
                  <TableHead className="text-gray-400">Sujet</TableHead>
                  <TableHead className="text-gray-400">Document</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((email) => (
                  <TableRow key={email.id} className="border-gray-800 hover:bg-white/5">
                    <TableCell className="text-gray-400 text-sm whitespace-nowrap">
                      {new Date(email.sentAt).toLocaleDateString('fr-FR')} à {new Date(email.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="text-white text-sm">
                      {email.recipients.join(', ')}
                    </TableCell>
                    <TableCell className="text-white text-sm max-w-xs truncate">
                      {email.subject}
                    </TableCell>
                    <TableCell>
                      {email.quote && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                          Devis {email.quote.number}
                        </Badge>
                      )}
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

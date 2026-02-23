// app/dashboard/messages/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare, Search, Loader2, Trash2, Mail, Phone, Eye, MailOpen, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/contact-messages', { credentials: 'include' });
      if (res.ok) setMessages(await res.json());
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const markAsRead = async (id: string, read: boolean) => {
    try {
      await fetch(`/api/contact-messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ read }),
      });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read } : m));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleOpen = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.read) markAsRead(msg.id, true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      const res = await fetch(`/api/contact-messages/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        toast({ title: 'Message supprimé' });
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const filtered = messages.filter(m =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.read).length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10">
            <MessageSquare className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Messages</h2>
            <p className="text-sm text-gray-400">
              {messages.length} message{messages.length > 1 ? 's' : ''}
              {unreadCount > 0 && (
                <span className="ml-1 text-red-400">({unreadCount} non lu{unreadCount > 1 ? 's' : ''})</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher par nom, email, sujet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#1a1a1a] border-gray-700 text-white"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="bg-[#1a1a1a] border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Inbox className="h-12 w-12 mb-3 text-gray-600" />
            <p className="text-lg font-medium">{search ? 'Aucun résultat' : 'Aucun message'}</p>
            <p className="text-sm">Les messages du formulaire de contact apparaîtront ici.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((msg) => (
            <Card
              key={msg.id}
              className={`border-gray-800 cursor-pointer transition-all hover:border-gray-700 ${
                msg.read ? 'bg-[#1a1a1a]' : 'bg-[#1a1a1a] border-l-2 border-l-red-500'
              }`}
              onClick={() => handleOpen(msg)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${msg.read ? 'text-gray-300' : 'text-white'}`}>
                        {msg.name}
                      </span>
                      {!msg.read && (
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] px-1.5 py-0">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${msg.read ? 'text-gray-400' : 'text-gray-200'}`}>{msg.subject}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{msg.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-red-500/10 text-red-400"
                      onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white max-w-lg">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{selectedMessage.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="font-medium text-white">{selectedMessage.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="h-3.5 w-3.5" />
                    <a href={`mailto:${selectedMessage.email}`} className="hover:text-red-400 transition-colors">
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone className="h-3.5 w-3.5" />
                      <a href={`tel:${selectedMessage.phone}`} className="hover:text-red-400 transition-colors">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Reçu le {new Date(selectedMessage.createdAt).toLocaleDateString('fr-FR')} à{' '}
                    {new Date(selectedMessage.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-white/5 text-gray-400"
                    onClick={() => {
                      markAsRead(selectedMessage.id, !selectedMessage.read);
                      setSelectedMessage({ ...selectedMessage, read: !selectedMessage.read });
                    }}
                  >
                    {selectedMessage.read ? (
                      <><MailOpen className="h-4 w-4 mr-1.5" /> Marquer non lu</>
                    ) : (
                      <><Eye className="h-4 w-4 mr-1.5" /> Marquer lu</>
                    )}
                  </Button>
                  <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      <Mail className="h-4 w-4 mr-1.5" /> Répondre
                    </Button>
                  </a>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

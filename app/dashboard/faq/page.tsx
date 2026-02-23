// app/dashboard/faq/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FileQuestion, Plus, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
  published: boolean;
}

const emptyForm = { question: '', answer: '', published: true };

export default function FaqAdminPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchFaqs = useCallback(async () => {
    try {
      const res = await fetch('/api/faq', { credentials: 'include' });
      if (res.ok) setFaqs(await res.json());
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (faq: Faq) => {
    setEditing(faq);
    setForm({ question: faq.question, answer: faq.answer, published: faq.published });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      const url = editing ? `/api/faq/${editing.id}` : '/api/faq';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, order: editing?.order || faqs.length }),
      });
      if (res.ok) {
        toast({ title: editing ? 'Question modifiée' : 'Question ajoutée' });
        setDialogOpen(false);
        fetchFaqs();
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette question ?')) return;
    try {
      const res = await fetch(`/api/faq/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { toast({ title: 'Question supprimée' }); fetchFaqs(); }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">FAQ</h2>
          <p className="text-sm text-gray-400">{faqs.length} question{faqs.length > 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" /> Ajouter
        </Button>
      </div>

      {faqs.length === 0 ? (
        <Card className="bg-[#1a1a1a] border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
            <FileQuestion className="h-12 w-12 mb-3 text-gray-600" />
            <p className="text-lg font-medium">Aucune question</p>
            <p className="text-sm mb-4">Ajoutez des questions fréquentes pour vos visiteurs.</p>
            <Button onClick={openCreate} variant="outline" className="border-gray-700">
              <Plus className="h-4 w-4 mr-2" /> Ajouter une question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card key={faq.id} className="bg-[#1a1a1a] border-gray-800 group">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <span className="text-xs text-gray-600 font-mono w-5">{index + 1}.</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-white font-medium">{faq.question}</p>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{faq.answer}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="outline" className={faq.published
                          ? 'bg-green-500/10 text-green-400 border-green-500/20 text-xs'
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20 text-xs'
                        }>
                          {faq.published ? 'Publié' : 'Masqué'}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => openEdit(faq)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 text-red-400" onClick={() => handleDelete(faq.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier la question' : 'Nouvelle question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-gray-300">Question *</Label>
              <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="mt-1 bg-black/50 border-gray-700 text-white" placeholder="Ex: Quels sont vos horaires ?" />
            </div>
            <div>
              <Label className="text-gray-300">Réponse *</Label>
              <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="mt-1 bg-black/50 border-gray-700 text-white" rows={4} placeholder="Rédigez la réponse..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.published} onCheckedChange={(checked) => setForm({ ...form, published: checked })} />
              <Label className="text-gray-300">Publier</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="hover:bg-white/5">Annuler</Button>
            <Button onClick={handleSubmit} disabled={saving || !form.question.trim() || !form.answer.trim()} className="bg-red-600 hover:bg-red-700">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// app/dashboard/pieces/page.tsx
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wrench, Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number | null;
  unit: string | null;
  active: boolean;
  order: number;
}

const emptyForm = { name: '', description: '', price: '', unit: 'pièce', active: true };

export default function PiecesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/services?category=pieces', { credentials: 'include' });
      if (res.ok) setServices(await res.json());
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const filtered = services.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (service: Service) => {
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description || '',
      price: service.price?.toString() || '',
      unit: service.unit || 'pièce',
      active: service.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const url = editing ? `/api/services/${editing.id}` : '/api/services';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, category: 'pieces' }),
      });
      if (res.ok) {
        toast({ title: editing ? 'Pièce modifiée' : 'Pièce ajoutée' });
        setDialogOpen(false);
        fetchServices();
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette pièce ?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { toast({ title: 'Pièce supprimée' }); fetchServices(); }
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
          <h2 className="text-lg font-semibold text-white">Pièces Premium</h2>
          <p className="text-sm text-gray-400">{services.length} pièce{services.length > 1 ? 's' : ''} au catalogue</p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" /> Ajouter
        </Button>
      </div>

      {services.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher une pièce..."
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
              <Wrench className="h-12 w-12 mb-3 text-gray-600" />
              <p className="text-lg font-medium">{search ? 'Aucun résultat' : 'Aucune pièce'}</p>
              <p className="text-sm mb-4">{search ? 'Essayez un autre terme' : 'Ajoutez des pièces à votre catalogue.'}</p>
              {!search && (
                <Button onClick={openCreate} variant="outline" className="border-gray-700">
                  <Plus className="h-4 w-4 mr-2" /> Ajouter une pièce
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">Pièce</TableHead>
                  <TableHead className="text-gray-400">Description</TableHead>
                  <TableHead className="text-gray-400">Prix unitaire</TableHead>
                  <TableHead className="text-gray-400">Statut</TableHead>
                  <TableHead className="text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((service) => (
                  <TableRow key={service.id} className="border-gray-800 hover:bg-white/5">
                    <TableCell className="text-white font-medium">{service.name}</TableCell>
                    <TableCell className="text-gray-400 text-sm max-w-xs truncate">{service.description || '-'}</TableCell>
                    <TableCell className="text-white">
                      {service.price ? `${service.price.toFixed(2)} €` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={service.active
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }>
                        {service.active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => openEdit(service)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 text-red-400" onClick={() => handleDelete(service.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier la pièce' : 'Nouvelle pièce'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-gray-300">Nom *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 bg-black/50 border-gray-700 text-white" placeholder="Ex: Filtre à huile K&N" />
            </div>
            <div>
              <Label className="text-gray-300">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 bg-black/50 border-gray-700 text-white" rows={3} />
            </div>
            <div>
              <Label className="text-gray-300">Prix unitaire (€)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 bg-black/50 border-gray-700 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
              <Label className="text-gray-300">Actif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="hover:bg-white/5">Annuler</Button>
            <Button onClick={handleSubmit} disabled={saving || !form.name.trim()} className="bg-red-600 hover:bg-red-700">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

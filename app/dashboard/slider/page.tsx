// app/dashboard/slider/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ImageIcon, Plus, Pencil, Trash2, Loader2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SliderImage {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  order: number;
  active: boolean;
}

const emptyForm = { title: '', description: '', imageUrl: '', active: true };

export default function SliderPage() {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SliderImage | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch('/api/slider', { credentials: 'include' });
      if (res.ok) setImages(await res.json());
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (img: SliderImage) => {
    setEditing(img);
    setForm({ title: img.title || '', description: img.description || '', imageUrl: img.imageUrl, active: img.active });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.imageUrl.trim()) return;
    setSaving(true);
    try {
      const url = editing ? `/api/slider/${editing.id}` : '/api/slider';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, order: editing?.order || images.length }),
      });
      if (res.ok) {
        toast({ title: editing ? 'Image modifiée' : 'Image ajoutée' });
        setDialogOpen(false);
        fetchImages();
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette image ?')) return;
    try {
      const res = await fetch(`/api/slider/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { toast({ title: 'Image supprimée' }); fetchImages(); }
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
          <h2 className="text-lg font-semibold text-white">Slider accueil</h2>
          <p className="text-sm text-gray-400">{images.length} image{images.length > 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" /> Ajouter
        </Button>
      </div>

      {images.length === 0 ? (
        <Card className="bg-[#1a1a1a] border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
            <ImageIcon className="h-12 w-12 mb-3 text-gray-600" />
            <p className="text-lg font-medium">Aucune image</p>
            <p className="text-sm mb-4">Ajoutez des images au slider de la page d'accueil.</p>
            <Button onClick={openCreate} variant="outline" className="border-gray-700">
              <Plus className="h-4 w-4 mr-2" /> Ajouter une image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img) => (
            <Card key={img.id} className="bg-[#1a1a1a] border-gray-800 overflow-hidden group">
              <div className="aspect-video bg-black/50 relative">
                <img
                  src={img.imageUrl}
                  alt={img.title || 'Slider'}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                {!img.active && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">Inactif</Badge>
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button size="icon" className="h-8 w-8 bg-black/70 hover:bg-black" onClick={() => openEdit(img)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" className="h-8 w-8 bg-black/70 hover:bg-red-900" onClick={() => handleDelete(img.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-black/70 text-white text-xs">#{img.order + 1}</Badge>
                </div>
              </div>
              {img.title && (
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-white truncate">{img.title}</p>
                  {img.description && <p className="text-xs text-gray-400 truncate">{img.description}</p>}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier l\'image' : 'Nouvelle image'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-gray-300">URL de l'image *</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="mt-1 bg-black/50 border-gray-700 text-white" placeholder="https://..." />
            </div>
            {form.imageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden bg-black/50">
                <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
            <div>
              <Label className="text-gray-300">Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 bg-black/50 border-gray-700 text-white" />
            </div>
            <div>
              <Label className="text-gray-300">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 bg-black/50 border-gray-700 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
              <Label className="text-gray-300">Actif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="hover:bg-white/5">Annuler</Button>
            <Button onClick={handleSubmit} disabled={saving || !form.imageUrl.trim()} className="bg-red-600 hover:bg-red-700">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// app/dashboard/blog/page.tsx
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
import { BookOpen, Plus, Pencil, Trash2, Loader2, Eye, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  image: string | null;
  published: boolean;
  createdAt: string;
}

const emptyForm = { title: '', content: '', slug: '', image: '', published: false };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchPosts = useCallback(async () => {
    try {
      // Utilise une route directe pour les blog posts admin
      const res = await fetch('/api/blog', { credentials: 'include' });
      if (res.ok) setPosts(await res.json());
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      content: post.content,
      slug: post.slug,
      image: post.image || '',
      published: post.published,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    const slug = form.slug || slugify(form.title);
    try {
      const url = editing ? `/api/blog/${editing.id}` : '/api/blog';
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, slug }),
      });
      if (res.ok) {
        toast({ title: editing ? 'Article modifié' : 'Article créé' });
        setDialogOpen(false);
        fetchPosts();
      } else {
        const data = await res.json();
        toast({ title: 'Erreur', description: data.error || 'Erreur', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      const res = await fetch(`/api/blog/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { toast({ title: 'Article supprimé' }); fetchPosts(); }
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
          <h2 className="text-lg font-semibold text-white">Articles de blog</h2>
          <p className="text-sm text-gray-400">{posts.length} article{posts.length > 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openCreate} className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" /> Nouvel article
        </Button>
      </div>

      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardContent className="p-0">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <BookOpen className="h-12 w-12 mb-3 text-gray-600" />
              <p className="text-lg font-medium">Aucun article</p>
              <p className="text-sm mb-4">Rédigez votre premier article de blog.</p>
              <Button onClick={openCreate} variant="outline" className="border-gray-700">
                <Plus className="h-4 w-4 mr-2" /> Créer un article
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">Titre</TableHead>
                  <TableHead className="text-gray-400">Slug</TableHead>
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Statut</TableHead>
                  <TableHead className="text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id} className="border-gray-800 hover:bg-white/5">
                    <TableCell className="text-white font-medium max-w-xs truncate">{post.title}</TableCell>
                    <TableCell className="text-gray-400 text-sm font-mono">{post.slug}</TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={post.published
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }>
                        {post.published ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {post.published && (
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => openEdit(post)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 text-red-400" onClick={() => handleDelete(post.id)}>
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
        <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier l\'article' : 'Nouvel article'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-gray-300">Titre *</Label>
              <Input
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) });
                }}
                className="mt-1 bg-black/50 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1 bg-black/50 border-gray-700 text-white font-mono text-sm" />
            </div>
            <div>
              <Label className="text-gray-300">Contenu *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="mt-1 bg-black/50 border-gray-700 text-white min-h-[200px]"
                rows={10}
              />
            </div>
            <div>
              <Label className="text-gray-300">URL image</Label>
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="mt-1 bg-black/50 border-gray-700 text-white" placeholder="https://..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.published} onCheckedChange={(checked) => setForm({ ...form, published: checked })} />
              <Label className="text-gray-300">Publier</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="hover:bg-white/5">Annuler</Button>
            <Button onClick={handleSubmit} disabled={saving || !form.title.trim() || !form.content.trim()} className="bg-red-600 hover:bg-red-700">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

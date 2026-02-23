// app/dashboard/presentation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Globe, Loader2, Save, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url';
  placeholder: string;
}

const fields: ContentField[] = [
  { key: 'title', label: 'Titre principal', type: 'text', placeholder: 'Bouexière Méca Performance' },
  { key: 'subtitle', label: 'Sous-titre', type: 'text', placeholder: 'Votre garage de confiance' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Présentez votre garage...' },
  { key: 'experience', label: 'Années d\'expérience', type: 'text', placeholder: '15' },
  { key: 'speciality', label: 'Spécialité', type: 'text', placeholder: 'Mécanique & Reprogrammation' },
  { key: 'address', label: 'Adresse', type: 'text', placeholder: 'La Bouexière, 35340' },
  { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '06 61 86 55 43' },
  { key: 'email', label: 'Email', type: 'text', placeholder: 'contact@bouexiere-meca-perf.fr' },
  { key: 'image', label: 'URL image principale', type: 'url', placeholder: 'https://...' },
];

export default function PresentationPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/api/site-content?section=presentation', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const map: Record<string, string> = {};
          for (const item of data) {
            map[item.key] = item.value;
          }
          setValues(map);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const items = Object.entries(values)
        .filter(([_, value]) => value.trim())
        .map(([key, value]) => ({ section: 'presentation', key, value }));

      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items }),
      });

      if (res.ok) {
        setSaved(true);
        toast({ title: 'Contenu sauvegardé' });
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10">
            <Globe className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Présentation</h2>
            <p className="text-sm text-gray-400">Éditez le contenu de la section présentation</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700">
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-300" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saved ? 'Sauvegardé' : 'Sauvegarder'}
        </Button>
      </div>

      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardContent className="p-6 space-y-5">
          {fields.map((field) => (
            <div key={field.key}>
              <Label className="text-gray-300 text-sm">{field.label}</Label>
              {field.type === 'textarea' ? (
                <Textarea
                  value={values[field.key] || ''}
                  onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="mt-1.5 bg-black/50 border-gray-700 text-white"
                  rows={4}
                />
              ) : (
                <Input
                  value={values[field.key] || ''}
                  onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="mt-1.5 bg-black/50 border-gray-700 text-white"
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

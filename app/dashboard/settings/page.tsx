// app/dashboard/settings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

// === Onglet Compte ===
const settingsFormSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  address: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
}).refine((data) => {
  if (data.currentPassword && !data.newPassword) return false;
  if (!data.currentPassword && data.newPassword) return false;
  return true;
}, {
  message: "Les deux champs de mot de passe doivent être remplis ensemble",
  path: ["newPassword"],
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

// === Onglet Entreprise ===
interface CompanyFormData {
  companyName: string;
  legalForm: string;
  siret: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  bankName: string;
  bankIBAN: string;
  bankBIC: string;
  vatRegime: string;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // === Formulaire Compte ===
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: '', email: '', phone: '', address: '',
      currentPassword: '', newPassword: '',
    },
  });

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user/settings');
      if (!response.ok) throw new Error('Erreur');
      const data = await response.json();
      form.reset({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        address: data.user.address || '',
      });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger vos informations', variant: 'destructive' });
    }
  };

  const onSubmitUser = async (data: SettingsFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      toast({ title: 'Succès', description: 'Paramètres mis à jour' });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // === Formulaire Entreprise ===
  const [companyData, setCompanyData] = useState<CompanyFormData>({
    companyName: '', legalForm: 'Auto-entrepreneur', siret: '', address: '',
    phone: '', email: '', website: '', bankName: '', bankIBAN: '', bankBIC: '',
    vatRegime: 'TVA non applicable, art. 293 B du CGI',
  });
  const [companyLoading, setCompanyLoading] = useState(false);

  const loadCompanyData = async () => {
    try {
      const response = await fetch('/api/company/settings');
      if (!response.ok) throw new Error('Erreur');
      const data = await response.json();
      if (data) {
        setCompanyData({
          companyName: data.companyName || '',
          legalForm: data.legalForm || 'Auto-entrepreneur',
          siret: data.siret || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          bankName: data.bankName || '',
          bankIBAN: data.bankIBAN || '',
          bankBIC: data.bankBIC || '',
          vatRegime: data.vatRegime || 'TVA non applicable, art. 293 B du CGI',
        });
      }
    } catch {
      // Pas de settings encore, on garde les valeurs par défaut
    }
  };

  const onSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyLoading(true);
    try {
      const response = await fetch('/api/company/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erreur');
      }
      toast({ title: 'Succès', description: 'Paramètres entreprise mis à jour' });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur',
        variant: 'destructive',
      });
    } finally {
      setCompanyLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
    loadCompanyData();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Paramètres</h1>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">Mon compte</TabsTrigger>
          <TabsTrigger value="company">Entreprise</TabsTrigger>
        </TabsList>

        {/* Onglet Compte */}
        <TabsContent value="account">
          <Card>
            <CardHeader><CardTitle>Informations personnelles</CardTitle></CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitUser)} className="space-y-6">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nom</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Adresse</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">Changer le mot de passe</h3>
                    <FormField control={form.control} name="currentPassword" render={({ field }) => (
                      <FormItem><FormLabel>Mot de passe actuel</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="newPassword" render={({ field }) => (
                      <FormItem><FormLabel>Nouveau mot de passe</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Entreprise */}
        <TabsContent value="company">
          <form onSubmit={onSubmitCompany} className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Informations entreprise</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
                  <Input id="companyName" value={companyData.companyName}
                    onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="legalForm">Forme juridique</Label>
                  <Input id="legalForm" value={companyData.legalForm}
                    onChange={(e) => setCompanyData({ ...companyData, legalForm: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="siret">SIRET</Label>
                  <Input id="siret" value={companyData.siret}
                    onChange={(e) => setCompanyData({ ...companyData, siret: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="companyAddress">Adresse</Label>
                  <Input id="companyAddress" value={companyData.address}
                    onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Téléphone</Label>
                  <Input id="companyPhone" value={companyData.phone}
                    onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input id="companyEmail" type="email" value={companyData.email}
                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="website">Site web</Label>
                  <Input id="website" value={companyData.website}
                    onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="vatRegime">Régime TVA</Label>
                  <Input id="vatRegime" value={companyData.vatRegime}
                    onChange={(e) => setCompanyData({ ...companyData, vatRegime: e.target.value })} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Coordonnées bancaires</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bankName">Banque</Label>
                  <Input id="bankName" value={companyData.bankName}
                    onChange={(e) => setCompanyData({ ...companyData, bankName: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="bankIBAN">IBAN</Label>
                  <Input id="bankIBAN" value={companyData.bankIBAN}
                    onChange={(e) => setCompanyData({ ...companyData, bankIBAN: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="bankBIC">BIC</Label>
                  <Input id="bankBIC" value={companyData.bankBIC}
                    onChange={(e) => setCompanyData({ ...companyData, bankBIC: e.target.value })} />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={companyLoading}>
              {companyLoading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

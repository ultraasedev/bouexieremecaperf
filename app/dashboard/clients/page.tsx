"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Composants UI
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

// Types et interfaces
interface Vehicle {
  id?: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  plate: string;
  vin?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicles: Vehicle[];
}

interface AddressSuggestion {
  label: string;
  context: string;
}

// Schémas de validation
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

const clientSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("L'email n'est pas valide"),
  phone: z.string().regex(phoneRegex, "Le numéro de téléphone n'est pas valide"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
});

const vehicleSchema = z.object({
  brand: z.string().min(2, "La marque est requise"),
  model: z.string().min(2, "Le modèle est requis"),
  year: z.number()
    .min(1900, "L'année doit être supérieure à 1900")
    .max(new Date().getFullYear() + 1, "L'année ne peut pas être dans le futur"),
  type: z.string().min(2, "Le type est requis"),
  plate: z.string().min(4, "La plaque d'immatriculation est requise"),
  vin: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;
type VehicleFormData = z.infer<typeof vehicleSchema>;

export default function ClientsPage() {
  // États
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [temporaryVehicles, setTemporaryVehicles] = useState<Vehicle[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);

  const router = useRouter();

  // Forms
  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  const vehicleForm = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      type: '',
      plate: '',
      vin: '',
    },
  });

  // Effets
  useEffect(() => {
    fetchClients();
  }, []);

  // Fonctions API
  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des clients');
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de charger les clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAddressSuggestions = async (input: string) => {
    if (input.length > 2) {
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(input)}&limit=5`
        );
        if (!response.ok) throw new Error();
        const data = await response.json();
        setAddressSuggestions(
          data.features.map((feature: any) => ({
            label: feature.properties.label,
            context: feature.properties.context,
          }))
        );
      } catch {
        setAddressSuggestions([]);
      }
    } else {
      setAddressSuggestions([]);
    }
  };

  // Gestionnaires d'événements
  const handleCreateOrUpdateClient = async (formData: ClientFormData) => {
    try {
      const payload = {
        ...formData,
        vehicles: temporaryVehicles,
      };

      const url = isEditing && selectedClient ? 
        `/api/clients/${selectedClient.id}` : '/api/clients';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue");
      }

      toast({
        title: "Succès",
        description: isEditing ? "Client modifié avec succès" : "Client ajouté avec succès",
      });

      resetForms();
      fetchClients();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsEditing(true);
    setTemporaryVehicles(client.vehicles);
    clientForm.reset({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
    });
    setIsAddingClient(true);
  };

  const handleDeleteClient = async () => {
    if (!deleteClientId) return;

    try {
      const response = await fetch(`/api/clients/${deleteClientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      toast({
        title: "Succès",
        description: "Client supprimé avec succès",
      });

      fetchClients();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer le client",
        variant: "destructive",
      });
    } finally {
      setDeleteClientId(null);
    }
  };

  const handleAddVehicle = (data: VehicleFormData) => {
    setTemporaryVehicles(prev => [...prev, data]);
    setIsAddingVehicle(false);
    vehicleForm.reset();
  };

  const removeVehicle = (index: number) => {
    setTemporaryVehicles(prev => prev.filter((_, i) => i !== index));
  };

  const resetForms = () => {
    clientForm.reset();
    vehicleForm.reset();
    setTemporaryVehicles([]);
    setIsAddingClient(false);
    setIsAddingVehicle(false);
    setIsEditing(false);
    setSelectedClient(null);
  };
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gestion des clients</h1>
          <p className="text-muted-foreground mt-1">
            {clients.length} client{clients.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <Button onClick={() => {
          setIsEditing(false);
          setIsAddingClient(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau client
        </Button>
      </div>

      {/* Table des clients */}
      <div className="rounded-md border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead className="hidden md:table-cell">Adresse</TableHead>
                <TableHead>Véhicules</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-8">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span>Chargement des clients...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-8">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-muted-foreground">Aucun client enregistré</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingClient(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un client
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate" title={client.address}>
                      {client.address}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {client.vehicles.length} véhicule{client.vehicles.length > 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClient(client)}
                          className="h-8 w-8"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/90"
                          onClick={() => setDeleteClientId(client.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal Client */}
      <Dialog 
        open={isAddingClient} 
        onOpenChange={(open) => {
          if (!open) resetForms();
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Modifier le client' : 'Nouveau client'}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Modifiez les informations du client.' 
                : 'Ajoutez un nouveau client à votre base de données.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <Form {...clientForm}>
              <form onSubmit={clientForm.handleSubmit(handleCreateOrUpdateClient)} 
                    className="space-y-6" 
                    id="client-form">
                {/* Section Informations */}
                <div className="space-y-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    INFORMATIONS PERSONNELLES
                  </div>

                  <FormField
                    control={clientForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="client-name">Nom complet</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            id="client-name"
                            placeholder="John Doe"
                            autoComplete="name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clientForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="client-email">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            id="client-email"
                            type="email"
                            placeholder="john@exemple.fr"
                            autoComplete="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clientForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="client-phone">Téléphone</FormLabel>
                        <FormControl>
                          <PhoneInput
                            country={'fr'}
                            value={field.value}
                            onChange={(phone) => field.onChange(phone)}
                            inputProps={{
                              id: 'client-phone',
                              name: 'client-phone',
                              required: true,
                              autoComplete: 'tel'
                            }}
                            containerClass="phone-input"
                            containerStyle={{ width: '100%' }}
                            inputStyle={{ width: '100%', height: '40px' }}
                            buttonStyle={{ 
                              backgroundColor: 'transparent',
                              borderRadius: '6px 0 0 6px'
                            }}
                            specialLabel=""
                            enableSearch
                            searchPlaceholder="Rechercher un pays"
                            searchNotFound="Pays non trouvé"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clientForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel htmlFor="client-address">Adresse</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            id="client-address"
                            placeholder="Adresse complète"
                            autoComplete="street-address"
                            onChange={(e) => {
                              field.onChange(e);
                              fetchAddressSuggestions(e.target.value);
                            }}
                          />
                        </FormControl>
                        {addressSuggestions.length > 0 && (
                          <Card className="absolute z-50 w-full mt-1 max-h-[200px] overflow-y-auto">
                            <CardContent className="p-1">
                              {addressSuggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="p-2 hover:bg-muted rounded-sm cursor-pointer"
                                  onClick={() => {
                                    field.onChange(suggestion.label);
                                    setAddressSuggestions([]);
                                  }}
                                >
                                  <div className="font-medium">{suggestion.label}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {suggestion.context}
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Section Véhicules */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-muted-foreground">
                      VÉHICULES
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingVehicle(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un véhicule
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {temporaryVehicles.length === 0 ? (
                      <div className="text-center p-4 border border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Aucun véhicule enregistré
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {temporaryVehicles.map((vehicle, index) => (
                          <Card key={index}>
                            <CardContent className="p-4 flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  {vehicle.brand} {vehicle.model}
                                </p>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>Année: {vehicle.year}</p>
                                  <p>Type: {vehicle.type}</p>
                                  <p>Immatriculation: {vehicle.plate}</p>
                                  {vehicle.vin && <p>VIN: {vehicle.vin}</p>}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => removeVehicle(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={resetForms}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              form="client-form"
              disabled={clientForm.formState.isSubmitting}
            >
              {clientForm.formState.isSubmitting
                ? "Enregistrement..."
                : isEditing
                ? "Modifier"
                : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Véhicule */}
      <Dialog open={isAddingVehicle} onOpenChange={setIsAddingVehicle}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un véhicule</DialogTitle>
            <DialogDescription>
              Ajoutez les informations du véhicule
            </DialogDescription>
          </DialogHeader>

          <Form {...vehicleForm}>
            <form onSubmit={vehicleForm.handleSubmit(handleAddVehicle)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={vehicleForm.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marque</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Peugeot" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vehicleForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modèle</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="208" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={vehicleForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Année</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1900}
                          max={new Date().getFullYear() + 1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vehicleForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Berline" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={vehicleForm.control}
                name="plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Immatriculation</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="AA-123-BB" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={vehicleForm.control}
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro VIN (optionnel)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="17 caractères" />
                      </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddingVehicle(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Ajouter le véhicule
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <AlertDialog open={!!deleteClientId} onOpenChange={() => setDeleteClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-4">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
                </p>
                <p className="font-medium text-destructive mt-4">
                  Attention : Cette action supprimera également tous les véhicules 
                  et données associés à ce client.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
            <AlertDialogCancel 
              onClick={() => setDeleteClientId(null)}
              className="sm:mr-2"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
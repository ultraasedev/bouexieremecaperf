"use client";

import { useState, useEffect, BaseSyntheticEvent } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  User,
  Users,
  Building2,
  Eye,
  FilterX,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Composants UI
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
type ClientType = "individual" | "company";

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
  type: ClientType;
  name?: string; // Pour les entreprises
  firstName?: string; // Pour les particuliers
  lastName?: string; // Pour les particuliers
  contactFirstName?: string; // Pour les entreprises
  contactLastName?: string; // Pour les entreprises
  siret?: string;
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

const clientSchema = z
  .object({
    type: z.enum(["individual", "company"] as const),
    name: z.string().optional(),
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .optional(),
    lastName: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .optional(),
    contactFirstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .optional(),
    contactLastName: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .optional(),
    siret: z
      .string()
      .min(14, "Le SIRET doit contenir 14 caractères")
      .optional(),
    email: z.string().email("L'email n'est pas valide"),
    phone: z
      .string()
      .regex(phoneRegex, "Le numéro de téléphone n'est pas valide"),
    address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  })
  .refine(
    (data) => {
      if (data.type === "company") {
        return (
          data.name &&
          data.contactFirstName &&
          data.contactLastName &&
          data.siret
        );
      }
      return data.firstName && data.lastName;
    },
    {
      message: "Veuillez remplir tous les champs obligatoires",
    }
  );
const vehicleSchema = z.object({
  brand: z.string().min(2, "La marque est requise"),
  model: z.string().min(2, "Le modèle est requis"),
  year: z
    .number()
    .min(1900, "L'année doit être supérieure à 1900")
    .max(
      new Date().getFullYear() + 1,
      "L'année ne peut pas être dans le futur"
    ),
  type: z.string().min(2, "Le type est requis"),
  plate: z.string().min(4, "La plaque d'immatriculation est requise"),
  vin: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;
type VehicleFormData = z.infer<typeof vehicleSchema>;

export default function ClientsPage() {
  // États
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [temporaryVehicles, setTemporaryVehicles] = useState<Vehicle[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [clientTypeFilter, setClientTypeFilter] = useState<ClientType | "all">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  // Forms
  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      type: "individual",
      firstName: "",
      lastName: "",
      name: "",
      contactFirstName: "",
      contactLastName: "",
      siret: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const vehicleForm = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      type: "",
      plate: "",
      vin: "",
    },
  });

  // Effets
  useEffect(() => {
    fetchClients();
  }, []);

  // Effet pour le filtrage des clients
  useEffect(() => {
    let filtered = [...clients];

    // Filtre par type de client
    if (clientTypeFilter !== "all") {
      filtered = filtered.filter((client) => client.type === clientTypeFilter);
    }

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((client) => {
        const fullName =
          client.type === "individual"
            ? `${client.firstName} ${client.lastName}`
            : `${client.name} (${client.contactFirstName} ${client.contactLastName})`;
        return (
          fullName.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.phone.includes(searchTerm)
        );
      });
    }

    setFilteredClients(filtered);
  }, [clients, clientTypeFilter, searchTerm]);

  // Fonctions API
  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des clients");
      }
      const data = await response.json();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de charger les clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  // Gestionnaires d'événements et fonctions API suite...
  const fetchAddressSuggestions = async (input: string) => {
    if (input.length > 2) {
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            input
          )}&limit=5`
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

  const handleViewClient = (clientId: string) => {
    router.push(`/dashboard/clients/${clientId}`);
  };

  const handleCreateOrUpdateClient = async (formData: ClientFormData) => {
    try {
      const payload = {
        ...formData,
        vehicles: temporaryVehicles,
      };

      const url =
        isEditing && selectedClient
          ? `/api/clients/${selectedClient.id}`
          : "/api/clients";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue");
      }

      toast({
        title: "Succès",
        description: isEditing
          ? "Client modifié avec succès"
          : "Client ajouté avec succès",
      });

      resetForms();
      fetchClients();
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  // Composant de rendu des filtres
  const FiltersSection = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select
        value={clientTypeFilter}
        onValueChange={(value) =>
          setClientTypeFilter(value as ClientType | "all")
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Type de client" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Tous les clients</span>
            </div>
          </SelectItem>
          <SelectItem value="individual">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Particuliers</span>
            </div>
          </SelectItem>
          <SelectItem value="company">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Professionnels</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      {(clientTypeFilter !== "all" || searchTerm) && (
        <Button
          variant="outline"
          onClick={() => {
            setClientTypeFilter("all");
            setSearchTerm("");
          }}
          className="w-full sm:w-auto"
        >
          <FilterX className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      )}
    </div>
  );

  function cn(arg0: string, arg1: string | boolean): string | undefined {
    throw new Error("Function not implemented.");
  }

  function removeVehicle(index: number): void {
    throw new Error("Function not implemented.");
  }

  function handleAddVehicle(
    data: {
      type: string;
      brand: string;
      model: string;
      year: number;
      plate: string;
      vin?: string | undefined;
    },
    event?: BaseSyntheticEvent<object, any, any> | undefined
  ): unknown {
    throw new Error("Function not implemented.");
  }

  const handleDeleteClient = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Logique de suppression
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-[1600px]">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Gestion des clients</h1>
          <p className="text-muted-foreground mt-1">
            {filteredClients.length} client
            {filteredClients.length > 1 ? "s" : ""}
            {clientTypeFilter !== "all" && (
              <span>
                {" "}
                (
                {clientTypeFilter === "individual"
                  ? "particuliers"
                  : "professionnels"}
                )
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditing(false);
            setIsAddingClient(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau client
        </Button>
      </div>

      {/* Filtres */}
      <FiltersSection />
      {/* Table des clients */}
      <div className="rounded-md border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">
                  Téléphone
                </TableHead>
                <TableHead className="hidden lg:table-cell">Adresse</TableHead>
                <TableHead>Véhicules</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center p-8">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span>Chargement des clients...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center p-8">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-muted-foreground">
                        {searchTerm || clientTypeFilter !== "all"
                          ? "Aucun résultat ne correspond à votre recherche"
                          : "Aucun client enregistré"}
                      </div>
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
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="group">
                    <TableCell>
                      {client.type === "individual" ? (
                        <Badge variant="secondary" className="gap-1">
                          <User className="h-3 w-3" />
                          Particulier
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Building2 className="h-3 w-3" />
                          Pro
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {client.type === "individual"
                          ? `${client.firstName} ${client.lastName}`
                          : client.name}
                      </div>
                      {client.type === "company" && (
                        <div className="text-sm text-muted-foreground">
                          Contact: {client.contactFirstName}{" "}
                          {client.contactLastName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {client.email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {client.phone}
                    </TableCell>
                    <TableCell
                      className="hidden lg:table-cell max-w-[200px] truncate"
                      title={client.address}
                    >
                      {client.address}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {client.vehicles.length} véhicule
                        {client.vehicles.length > 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                      <Button
    variant="ghost"
    size="icon"
    onClick={() => handleViewClient(client.id)}
    className="h-8 w-8 hover:bg-accent transition-colors"
  >
    <Eye className="h-4 w-4" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    onClick={() => handleViewClient(client.id)}
    className="h-8 w-8 hover:bg-accent transition-colors"
  >
    <Edit className="h-4 w-4" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    className="h-8 w-8 text-destructive hover:bg-destructive/10 transition-colors"
    onClick={(e) => {
      e.stopPropagation();
      setDeleteClientId(client.id);
    }}
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
              {isEditing ? "Modifier le client" : "Nouveau client"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifiez les informations du client."
                : "Ajoutez un nouveau client à votre base de données."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <Form {...clientForm}>
              <form
                onSubmit={clientForm.handleSubmit(handleCreateOrUpdateClient)}
                className="space-y-6"
                id="client-form"
              >
                {/* Type de client */}
                <div className="space-y-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    TYPE DE CLIENT
                  </div>
                  <FormField
                    control={clientForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            type="button"
                            variant={
                              field.value === "individual"
                                ? "default"
                                : "outline"
                            }
                            className={cn(
                              "w-full",
                              field.value === "individual" &&
                                "ring-2 ring-primary"
                            )}
                            onClick={() => field.onChange("individual")}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Particulier
                          </Button>
                          <Button
                            type="button"
                            variant={
                              field.value === "company" ? "default" : "outline"
                            }
                            className={cn(
                              "w-full",
                              field.value === "company" && "ring-2 ring-primary"
                            )}
                            onClick={() => field.onChange("company")}
                          >
                            <Building2 className="mr-2 h-4 w-4" />
                            Professionnel
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Informations selon le type */}
                {clientForm.watch("type") === "company" ? (
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      INFORMATIONS DE L'ENTREPRISE
                    </div>
                    <FormField
                      control={clientForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raison sociale</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nom de l'entreprise"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={clientForm.control}
                      name="siret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SIRET</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123 456 789 00012" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={clientForm.control}
                        name="contactFirstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom du contact</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Prénom" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={clientForm.control}
                        name="contactLastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du contact</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nom" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      INFORMATIONS PERSONNELLES
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={clientForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Prénom" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={clientForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nom" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                {/* Informations de contact communes */}
                <div className="space-y-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    INFORMATIONS DE CONTACT
                  </div>

                  <FormField
                    control={clientForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="contact@exemple.fr"
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
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <PhoneInput
                            country={"fr"}
                            value={field.value}
                            onChange={(phone) => field.onChange(phone)}
                            inputProps={{
                              required: true,
                              autoComplete: "tel",
                            }}
                            containerClass="phone-input"
                            containerStyle={{ width: "100%" }}
                            inputStyle={{ width: "100%", height: "40px" }}
                            buttonStyle={{
                              backgroundColor: "transparent",
                              borderRadius: "6px 0 0 6px",
                            }}
                            dropdownStyle={{
                              width: "300px",
                              maxHeight: "300px",
                              overflow: "auto",
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
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
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
                                  <div className="font-medium">
                                    {suggestion.label}
                                  </div>
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
                          <Card key={index} className="group">
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
                                onClick={() => removeVehicle(index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
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
            <Button type="button" variant="outline" onClick={resetForms}>
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
            <form
              onSubmit={vehicleForm.handleSubmit(handleAddVehicle)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
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
                      <Input
                        {...field}
                        placeholder="AA-123-BB"
                        className="uppercase"
                      />
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
                      <Input
                        {...field}
                        placeholder="17 caractères"
                        className="uppercase"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingVehicle(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">Ajouter le véhicule</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <AlertDialog
        open={!!deleteClientId}
        onOpenChange={() => setDeleteClientId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-4">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Êtes-vous sûr de vouloir supprimer ce client ? Cette action
                  est irréversible.
                </p>
                <p className="font-medium text-destructive mt-4">
                  Attention : Cette action supprimera également tous les
                  véhicules, rendez-vous et données associés à ce client.
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

function resetForms() {
  throw new Error("Function not implemented.");
}

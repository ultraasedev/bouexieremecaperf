"use client";

// 1. Imports principaux
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import * as z from "zod";
import type { AppointmentStatus, QuoteStatus } from "@prisma/client";
import { useCarQuery } from "@/lib/useCarQuery";

// 2. Composants UI
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// 3. Icônes
import {
  Car,
  Calendar,
  FileText,
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Euro,
  Wrench,
  Edit,
  Plus,
  Download,
  Eye,
  Trash2,
  Clock,
} from "lucide-react";

// 4. Interfaces et Types
interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  totalTTC: number;
  status: "draft" | "sent" | "paid" | "overdue" | "reminder" | "unpaid";
  type: "invoice";
  items: InvoiceItem[];
  dueDate: string;
  createdAt: string;
}

interface Quote {
  id: string;
  number: string;
  date: string;
  validityDate: string;
  totalTTC: number;
  totalHT: number;
  totalVAT: number;
  status: QuoteStatus;
  type: "quote";
  items: InvoiceItem[];
  createdAt: string;
  paymentDetails: {
    terms: string;
    method: string;
  };
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  vin?: string;
  type: string;
}

interface Appointment {
  id: string;
  service: string;
  vehicle: Vehicle;
  description?: string;
  requestedDate: string;
  status: AppointmentStatus;
  token: string;
}

interface Client {
  id: string;
  type: "individual" | "company";
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  address: string;
  siret?: string;
  vatNumber?: string;
  createdAt: string;
  vehicles: Vehicle[];
  appointments: Appointment[];
  documents: (Invoice | Quote)[];
}
// 5. Schémas de validation
const clientSchema = z
  .object({
    type: z.enum(["individual", "company"]),
    email: z.string().email("L'email n'est pas valide"),
    phone: z.string().min(10, "Le numéro de téléphone n'est pas valide"),
    address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
    name: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    siret: z.string().nullable(),
    vatNumber: z.string().nullable(),
  })
  .refine(
    (data) => {
      if (data.type === "company") {
        return data.name !== null;
      }
      return data.firstName !== null && data.lastName !== null;
    },
    {
      message: "Les champs obligatoires doivent être remplis",
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
  plate: z
    .string()
    .min(4, "La plaque d'immatriculation est requise")
    .toUpperCase(),
  vin: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;
type VehicleFormData = z.infer<typeof vehicleSchema>;

export default function ClientDetailsPage() {
  // 6. Custom Hooks
  const {
    getMakes,
    getModels,
    getAvailableYears,
    isLoading: isLoadingCar,
  } = useCarQuery();
  const router = useRouter();
  const params = useParams();

  // 7. États
  // États principaux
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Invoice | Quote | null>(null);
  const [showDocumentActions, setShowDocumentActions] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // États pour les véhicules
  const [makes, setMakes] = useState<Array<any>>([]);
  const [models, setModels] = useState<Array<any>>([]);
  const [years] = useState(() => getAvailableYears());

  // 8. Forms
  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      type: client?.type || "individual",
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

  // 9. Callbacks mémorisés pour les watches
  const watchBrand = useCallback(() => vehicleForm.watch("brand"), [vehicleForm]);
  const watchYear = useCallback(() => vehicleForm.watch("year"), [vehicleForm]);
  // 10. Fonctions utilitaires
  const getPaymentStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-500",
      sent: "bg-blue-500",
      paid: "bg-green-500",
      pending: "bg-yellow-500",
      overdue: "bg-red-500",
      reminder: "bg-orange-500",
      unpaid: "bg-red-700",
      DRAFT: "bg-gray-500",
      SENT: "bg-blue-500",
      VIEWED: "bg-purple-500",
      ACCEPTED: "bg-green-500",
      REJECTED: "bg-red-500",
      EXPIRED: "bg-red-700",
      CANCELLED: "bg-gray-700",
      default: "bg-gray-500",
    };
    return colors[status as keyof typeof colors] || colors.default;
  };

  const getAppointmentStatusBadge = (status: AppointmentStatus) => {
    const statusConfig = {
      PENDING: {
        text: "En attente",
        className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      },
      CONFIRMED: {
        text: "Confirmé",
        className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      },
      COMPLETED: {
        text: "Terminé",
        className: "bg-green-500/10 text-green-500 border-green-500/20",
      },
      CANCELLED: {
        text: "Annulé",
        className: "bg-red-500/10 text-red-500 border-red-500/20",
      },
      MODIFIED: {
        text: "Modifié",
        className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      },
    };

    const config = statusConfig[status] || { text: "Inconnu", className: "" };
    return (
      <Badge variant="outline" className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const getStatistics = (client: Client) => {
    return {
      totalAppointments: client.appointments.length,
      completedAppointments: client.appointments.filter(
        (a) => a.status === "COMPLETED"
      ).length,
      totalVehicles: client.vehicles.length,
      vehiclesWithVin: client.vehicles.filter((v) => v.vin).length,
      totalDocuments: client.documents.length,
      unpaidDocuments: client.documents.filter(
        (d) => d.type === "invoice" && d.status === "unpaid"
      ).length,
      totalRevenue: client.documents
        .filter((d) => d.type === "invoice" && d.status === "paid")
        .reduce((sum, doc) => sum + doc.totalTTC, 0),
    };
  };

  // 11. Handlers
  const handleUpdateClient = async (formData: ClientFormData) => {
    if (!client) return;

    try {
      setIsSaving(true);
      const updateData = {
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        type: client.type,
        ...(client.type === "company"
          ? {
              name: formData.name,
              siret: formData.siret || null,
              vatNumber: formData.vatNumber || null,
              firstName: null,
              lastName: null,
            }
          : {
              firstName: formData.firstName,
              lastName: formData.lastName,
              name: null,
              siret: null,
              vatNumber: null,
            }),
      };

      const response = await fetch(`/api/clients/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const updatedClient = await response.json();
      setClient(updatedClient);
      setIsEditing(false);
      toast({
        title: "Succès",
        description: "Les modifications ont été enregistrées avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddVehicle = async (data: VehicleFormData) => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/clients/${params.id}/vehicles`, {
        method: selectedVehicle ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: selectedVehicle?.id,
          vin: data.vin || null,
        }),
      });

      if (!response.ok) throw new Error("Échec de l'opération");

      const updatedClient = await response.json();
      setClient(updatedClient);
      setShowVehicleForm(false);
      setSelectedVehicle(null);
      vehicleForm.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!client) return;

    try {
      setIsDeleting(true);
      const response = await fetch(
        `/api/clients/${client.id}/vehicles/${vehicleId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const updatedClient = await response.json();
      setClient(updatedClient);
      setIsConfirmingDelete(false);
      setSelectedVehicle(null);
      toast({
        title: "Succès",
        description: "Le véhicule a été supprimé",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le véhicule",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDeleteDocument = async (
    documentId: string,
    type: "invoice" | "quote"
  ) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Échec de la suppression");

      setClient((prev) =>
        prev
          ? {
              ...prev,
              documents: prev.documents.filter((doc) => doc.id !== documentId),
            }
          : null
      );

      toast({
        title: "Succès",
        description: "Le document a été supprimé",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadDocument = async (
    documentId: string,
    type: "invoice" | "quote"
  ) => {
    try {
      setIsDownloading(true);
      const response = await fetch(`/api/documents/${type}s/${documentId}/download`);

      if (!response.ok) throw new Error("Échec du téléchargement");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type === "invoice" ? "facture" : "devis"}-${documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // 12. useEffects
  // Effet pour charger les marques
  useEffect(() => {
    if (makes.length === 0) {
      const loadMakes = async () => {
        try {
          const makesList = await getMakes();
          setMakes(makesList);
        } catch (error) {
          console.error("Erreur lors du chargement des marques:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les marques de véhicules",
            variant: "destructive",
          });
        }
      };
      loadMakes();
    }
  }, [getMakes]); // Retiré makes.length des dépendances

  // Effet pour charger les modèles
  useEffect(() => {
    const brand = watchBrand();
    const year = watchYear();

    if (brand && year) {
      const loadModels = async () => {
        try {
          const modelsList = await getModels(brand, year);
          setModels(modelsList);
        } catch (error) {
          console.error("Erreur chargement modèles:", error);
        }
      };
      loadModels();
    } else {
      setModels([]);
    }
  }, [watchBrand, watchYear, getModels]);

  // Effet pour gérer le formulaire véhicule
  useEffect(() => {
    if (showVehicleForm) {
      if (selectedVehicle) {
        vehicleForm.reset({
          brand: selectedVehicle.brand,
          model: selectedVehicle.model,
          year: selectedVehicle.year,
          type: selectedVehicle.type,
          plate: selectedVehicle.plate,
          vin: selectedVehicle.vin || "",
        });
      } else {
        vehicleForm.reset({
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          type: "",
          plate: "",
          vin: "",
        });
        setModels([]);
      }
    }
  }, [showVehicleForm, selectedVehicle]); // Retiré vehicleForm des dépendances

  // Effet pour charger les données du client
  useEffect(() => {
    if (!client && params.id) {
      const fetchClientDetails = async () => {
        try {
          const response = await fetch(`/api/clients/${params.id}`);
          if (!response.ok) throw new Error("Client non trouvé");
          const data = await response.json();
          setClient(data);
          clientForm.reset({
            type: data.type,
            name: data.name,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            siret: data.siret,
            vatNumber: data.vatNumber,
          });
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Impossible de charger les informations du client",
            variant: "destructive",
          });
          router.push("/dashboard/clients");
        } finally {
          setLoading(false);
        }
      };

      fetchClientDetails();
    }
  }, [params.id, router, client]);

  // État de chargement
  if (loading || !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const isCompany = client.type === "company";
  const displayName = isCompany
    ? client.name
    : `${client.firstName} ${client.lastName}`;
  const stats = getStatistics(client);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* En-tête */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/clients")}
              className="mt-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                {isCompany ? (
                  <Building2 className="h-5 w-5" />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span className="line-clamp-1">{displayName}</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Client depuis le{" "}
                {format(parseISO(client.createdAt), "dd MMMM yyyy", {
                  locale: fr,
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-2 w-full md:w-auto md:flex-row md:space-y-0 md:space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="w-full md:w-auto justify-center text-black"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button
              className="w-full md:w-auto justify-center"
              onClick={() =>
                router.push(`/dashboard/appointments/new?clientId=${client.id}`)
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau rendez-vous
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Carte Rendez-vous */}
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Rendez-vous</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalAppointments}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.completedAppointments} terminé
                {stats.completedAppointments > 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          {/* Carte Véhicules */}
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Véhicules</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                {stats.vehiclesWithVin} avec VIN
              </p>
            </CardContent>
          </Card>

          {/* Carte Documents */}
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.unpaidDocuments} en attente de paiement
              </p>
            </CardContent>
          </Card>

          {/* Carte CA Total */}
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">CA Total</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">Depuis le début</p>
            </CardContent>
          </Card>
        </div>
        {/* Carte Informations de contact */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">Informations de contact</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Type de client */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Type de client</span>
              </div>
              <p className="font-medium">
                {isCompany ? "Professionnel" : "Particulier"}
              </p>
              {isCompany && (
                <>
                  <div className="text-sm text-muted-foreground mt-4">
                    Contact principal
                  </div>
                  <p className="font-medium">
                    {client.firstName} {client.lastName}
                  </p>
                </>
              )}
            </div>

            {/* Email et Téléphone */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <p className="font-medium mt-1 break-all">{client.email}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Téléphone</span>
                </div>
                <p className="font-medium mt-1">{client.phone}</p>
              </div>
            </div>

            {/* Adresse et SIRET */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Adresse</span>
                </div>
                <p className="font-medium mt-1">{client.address}</p>
              </div>
              {isCompany && client.siret && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>SIRET</span>
                  </div>
                  <p className="font-medium mt-1">{client.siret}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Onglets */}
        <Tabs defaultValue="vehicles" className="space-y-6">
          <TabsList className="w-full grid grid-cols-3 gap-1 h-auto p-1">
            <TabsTrigger
              value="vehicles"
              className="flex items-center gap-2 py-2.5 px-3"
            >
              <Car className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Véhicules</span>
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="flex items-center gap-2 py-2.5 px-3"
            >
              <Calendar className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Rendez-vous</span>
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="flex items-center gap-2 py-2.5 px-3"
            >
              <FileText className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Documents</span>
            </TabsTrigger>
          </TabsList>

          {/* Contenu des onglets */}
          {/* Onglet Véhicules */}
          <TabsContent value="vehicles">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => {
                  setSelectedVehicle(null);
                  setShowVehicleForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un véhicule
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {client.vehicles.length === 0 ? (
                <div className="col-span-full p-8 text-center border rounded-lg border-dashed">
                  <div className="flex flex-col items-center space-y-2">
                    <Car className="h-8 w-8 text-muted-foreground" />
                    <h3 className="font-medium">Aucun véhicule</h3>
                    <p className="text-sm text-muted-foreground">
                      Ce client n'a pas encore de véhicule enregistré.
                    </p>
                  </div>
                </div>
              ) : (
                client.vehicles.map((vehicle) => (
                  <Card
                    key={vehicle.id}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          {vehicle.brand} {vehicle.model}
                        </span>
                        <Badge variant="secondary">{vehicle.year}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Immatriculation
                          </span>
                          <span className="font-medium">{vehicle.plate}</span>
                        </div>
                        {vehicle.vin && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">VIN</span>
                            <span className="font-medium">{vehicle.vin}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Type</span>
                          <span className="font-medium">{vehicle.type}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowVehicleForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setIsConfirmingDelete(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          {/* Onglet Rendez-vous */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle>Historique des rendez-vous</CardTitle>
                  <Button
                    onClick={() =>
                      router.push(
                        `/dashboard/appointments/new?clientId=${client.id}`
                      )
                    }
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau rendez-vous
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {client.appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                      <h3 className="font-medium">Aucun rendez-vous</h3>
                      <p className="text-sm text-muted-foreground">
                        Ce client n'a pas encore de rendez-vous enregistré.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-auto -mx-6 px-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Véhicule
                          </TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead className="hidden md:table-cell">
                            Statut
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {client.appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(
                                parseISO(appointment.requestedDate),
                                "dd/MM/yyyy"
                              )}
                              <div className="text-xs text-muted-foreground">
                                {format(
                                  parseISO(appointment.requestedDate),
                                  "HH:mm"
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <div className="line-clamp-1">
                                {appointment.vehicle.brand}{" "}
                                {appointment.vehicle.model}
                                <div className="text-xs text-muted-foreground">
                                  {appointment.vehicle.plate}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="font-medium line-clamp-1">
                                  {appointment.service === "diagnostic"
                                    ? "Diagnostic"
                                    : appointment.service === "mecanique"
                                    ? "Mécanique"
                                    : appointment.service === "pieces-premium"
                                    ? "Pièces Premium"
                                    : "Reprogrammation"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {getAppointmentStatusBadge(appointment.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowAppointmentDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">
                                  Détails
                                </span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Documents */}
          <TabsContent value="documents">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {/* Factures */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle>Factures</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/dashboard/invoices/new?clientId=${client.id}`
                        )
                      }
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle facture
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {client.documents.filter((doc) => doc.type === "invoice")
                    .length === 0 ? (
                    <div className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <h3 className="font-medium">Aucune facture</h3>
                        <p className="text-sm text-muted-foreground">
                          Aucune facture n'a encore été émise.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-auto -mx-6 px-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>N°</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {client.documents
                            .filter((doc) => doc.type === "invoice")
                            .map((invoice) => (
                              <TableRow key={invoice.id}>
                                <TableCell>{invoice.number}</TableCell>
                                <TableCell>
                                  {format(parseISO(invoice.date), "dd/MM/yyyy")}
                                </TableCell>
                                <TableCell>
                                  {new Intl.NumberFormat("fr-FR", {
                                    style: "currency",
                                    currency: "EUR",
                                  }).format(invoice.totalTTC)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={`${getPaymentStatusColor(
                                      invoice.status
                                    )}/10`}
                                  >
                                    {invoice.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleDownloadDocument(
                                          invoice.id,
                                          "invoice"
                                        )
                                      }
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    {invoice.status !== "paid" && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setSelectedDocument(invoice);
                                          setIsConfirmingDelete(true);
                                        }}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Devis */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle>Devis</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/dashboard/quotes/new?clientId=${client.id}`
                        )
                      }
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nouveau devis
                    </Button>
                  </div>
                </CardHeader>
                {/* Contenu de la Card des Devis */}
                <CardContent>
                  {client.documents.filter((doc) => doc.type === "quote")
                    .length === 0 ? (
                    <div className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <h3 className="font-medium">Aucun devis</h3>
                        <p className="text-sm text-muted-foreground">
                          Aucun devis n'a encore été émis.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-auto -mx-6 px-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>N°</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {client.documents
                            .filter((doc) => doc.type === "quote")
                            .map((quote) => (
                              <TableRow key={quote.id}>
                                <TableCell>{quote.number}</TableCell>
                                <TableCell>
                                  {format(parseISO(quote.date), "dd/MM/yyyy")}
                                </TableCell>
                                <TableCell>
                                  {new Intl.NumberFormat("fr-FR", {
                                    style: "currency",
                                    currency: "EUR",
                                  }).format(quote.totalTTC)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={`${getPaymentStatusColor(
                                      quote.status
                                    )}/10`}
                                  >
                                    {{
                                      DRAFT: "Brouillon",
                                      SENT: "Envoyé",
                                      VIEWED: "Consulté",
                                      ACCEPTED: "Accepté",
                                      REJECTED: "Refusé",
                                      EXPIRED: "Expiré",
                                      CANCELLED: "Annulé",
                                    }[quote.status] || quote.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleDownloadDocument(
                                          quote.id,
                                          "quote"
                                        )
                                      }
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    {!["ACCEPTED", "CANCELLED"].includes(
                                      quote.status
                                    ) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setSelectedDocument(quote);
                                          setIsConfirmingDelete(true);
                                        }}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        {/* Modal de modification du client */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le client</DialogTitle>
              <DialogDescription>
                Modifiez les informations de {displayName}
              </DialogDescription>
            </DialogHeader>

            {/* Important: Nous devons garder le composant Form pour fournir le contexte */}
            <Form {...clientForm}>
              {/* Le form HTML va à l'intérieur du composant Form de shadcn */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  console.log("1. Début de la soumission");

                  const values = clientForm.getValues();
                  console.log("2. Valeurs du formulaire:", values);

                  const isValid = await clientForm.trigger();
                  console.log("3. Formulaire valide ?", isValid);

                  if (!isValid) {
                    console.log(
                      "4a. Erreurs de validation:",
                      clientForm.formState.errors
                    );
                    return;
                  }

                  console.log("4b. Appel de handleUpdateClient");
                  await handleUpdateClient(values);
                }}
                className="space-y-6"
              >
                {/* Type de client */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Type de client
                  </Label>
                  <div className="flex items-center space-x-2">
                    {isCompany ? (
                      <>
                        <Building2 className="h-4 w-4" />
                        <span>Professionnel</span>
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4" />
                        <span>Particulier</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Champs selon le type de client */}
                {isCompany ? (
                  <>
                    <FormField
                      control={clientForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raison sociale</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
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
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={clientForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="Prénom"
                            />
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
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="Nom"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Champs communs */}
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
                          placeholder="email@exemple.fr"
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
                        <Input
                          {...field}
                          type="tel"
                          placeholder="06 12 34 56 78"
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
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Adresse complète" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    variant="default" // Utilisation du variant par défaut
                    className="bg-black text-white hover:bg-black/90"
                  >
                    {isSaving ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Enregistrement...</span>
                      </>
                    ) : (
                      "Enregistrer les modifications"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal de gestion des véhicules */}
        <Dialog open={showVehicleForm} onOpenChange={setShowVehicleForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedVehicle
                  ? "Modifier le véhicule"
                  : "Ajouter un véhicule"}
              </DialogTitle>
              <DialogDescription>
                {selectedVehicle
                  ? "Modifiez les informations du véhicule"
                  : "Ajoutez un nouveau véhicule"}
              </DialogDescription>
            </DialogHeader>
            <Form {...vehicleForm}>
              <form
                onSubmit={vehicleForm.handleSubmit(handleAddVehicle)}
                className="space-y-4"
              >
                <FormField
                  control={vehicleForm.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marque</FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 border rounded-md"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            vehicleForm.setValue("model", "");
                          }}
                          disabled={isLoadingCar}
                        >
                          <option value="">
                            {isLoadingCar
                              ? "Chargement..."
                              : "Sélectionnez une marque"}
                          </option>
                          {makes.map((make) => (
                            <option key={make.make_id} value={make.make_id}>
                              {make.make_display}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vehicleForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Année</FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 border rounded-md"
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            vehicleForm.setValue("model", ""); // Reset model when year changes
                          }}
                        >
                          <option value="">Sélectionnez une année</option>
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
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
                        <select
                          className="w-full p-2 border rounded-md"
                          {...field}
                          disabled={
                            !vehicleForm.getValues("brand") ||
                            !vehicleForm.getValues("year")
                          }
                        >
                          <option value="">Sélectionnez un modèle</option>
                          {models.map((model) => (
                            <option
                              key={model.model_name}
                              value={model.model_name}
                            >
                              {model.model_name}
                            </option>
                          ))}
                        </select>
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
                        <Input {...field} placeholder="Type de véhicule" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vehicleForm.control}
                  name="plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Immatriculation</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="AB-123-CD" />
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
                        <Input {...field} placeholder="Numéro VIN" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowVehicleForm(false);
                      setSelectedVehicle(null);
                      vehicleForm.reset();
                    }}
                    disabled={isSaving}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <LoadingSpinner />
                        {selectedVehicle ? "Modification..." : "Ajout..."}
                      </>
                    ) : selectedVehicle ? (
                      "Modifier"
                    ) : (
                      "Ajouter"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        {/*Modal de suppression */}
        {/*Modal de suppression Vehicules */}
        <AlertDialog
          open={isConfirmingDelete}
          onOpenChange={setIsConfirmingDelete}
        >
          <AlertDialogContent className="sm:max-w-[425px] gap-6 p-6">
            <AlertDialogHeader className="space-y-3">
              <AlertDialogTitle className="text-xl font-semibold">
                Confirmer la suppression
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base text-muted-foreground">
                Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action
                est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <AlertDialogCancel
                disabled={isDeleting}
                className="mt-2 sm:mt-0 w-full sm:w-auto bg-black hover:bg-black/90 text-white"
              >
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (!selectedVehicle || !client) return;

                  try {
                    setIsDeleting(true);
                    const response = await fetch(
                      `/api/clients/${client.id}/vehicles/${selectedVehicle.id}`,
                      {
                        method: "DELETE",
                      }
                    );

                    if (!response.ok) {
                      throw new Error("Échec de la suppression");
                    }

                    const updatedClient = await response.json();
                    setClient(updatedClient);

                    setIsConfirmingDelete(false);
                    setSelectedVehicle(null);

                    toast({
                      title: "Succès",
                      description: "Le véhicule a été supprimé",
                    });
                  } catch (error) {
                    console.error("Erreur lors de la suppression:", error);
                    toast({
                      title: "Erreur",
                      description: "Impossible de supprimer le véhicule",
                      variant: "destructive",
                    });
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <LoadingSpinner />
                    <span>Suppression...</span>
                  </>
                ) : (
                  "Confirmer la suppression"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/*Details rdv */}
        <Dialog
          open={showAppointmentDetails}
          onOpenChange={setShowAppointmentDetails}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails du rendez-vous</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <div>
                    {format(
                      parseISO(selectedAppointment.requestedDate),
                      "PPP à HH:mm",
                      { locale: fr }
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Véhicule</Label>
                  <div>
                    {selectedAppointment.vehicle.brand}{" "}
                    {selectedAppointment.vehicle.model}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedAppointment.vehicle.plate}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Service</Label>
                  <div>{selectedAppointment.service}</div>
                </div>
                {selectedAppointment.description && (
                  <div className="grid gap-2">
                    <Label>Description</Label>
                    <div>{selectedAppointment.description}</div>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label>Statut</Label>
                  <div>
                    {getAppointmentStatusBadge(selectedAppointment.status)}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

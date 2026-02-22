// types/clientDetails.ts
import { z } from "zod";

// Enums pour les status
export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  MODIFIED = "MODIFIED"
}

export enum QuoteStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  VIEWED = "VIEWED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED"
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  totalTTC: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'reminder' | 'unpaid';
  type: "invoice";
  items: InvoiceItem[];
  dueDate: string;
  createdAt: string;
}

export interface Quote {
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

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  vin?: string;
  type: string;
}

export interface Appointment {
  id: string;
  service: string;
  vehicle: Vehicle;
  description?: string;
  requestedDate: string;
  status: AppointmentStatus;
  token: string;
}

export interface Client {
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

// Schémas de validation
export const clientSchema = z.object({
  type: z.enum(["individual", "company"]),
  name: z.string().optional(),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères").optional(),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
  email: z.string().email("L'email n'est pas valide"),
  phone: z.string().min(10, "Le numéro de téléphone n'est pas valide"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  siret: z.string().optional(),
  vatNumber: z.string().optional()
}).refine(
  (data) => {
    if (data.type === "company") {
      return data.name && data.siret;
    }
    return data.firstName && data.lastName;
  },
  {
    message: "Veuillez remplir tous les champs obligatoires",
  }
);

export const vehicleSchema = z.object({
  brand: z.string().min(2, "La marque est requise"),
  model: z.string().min(2, "Le modèle est requis"),
  year: z.number()
    .min(1900, "L'année doit être supérieure à 1900")
    .max(new Date().getFullYear() + 1, "L'année ne peut pas être dans le futur"),
  type: z.string().min(2, "Le type est requis"),
  plate: z.string()
    .min(4, "La plaque d'immatriculation est requise")
    .toUpperCase(),
  vin: z.string().optional()
});

export type ClientFormData = z.infer<typeof clientSchema>;
export type VehicleFormData = z.infer<typeof vehicleSchema>;

// Utilitaires
export const getPaymentStatusColor = (status: string) => {
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
  } as const;
  
  return colors[status as keyof typeof colors] || colors.default;
};

export const getAppointmentStatusBadge = (status: AppointmentStatus) => {
  const statusConfig = {
    [AppointmentStatus.PENDING]: {
      text: "En attente",
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    },
    [AppointmentStatus.CONFIRMED]: {
      text: "Confirmé",
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    [AppointmentStatus.COMPLETED]: {
      text: "Terminé",
      className: "bg-green-500/10 text-green-500 border-green-500/20",
    },
    [AppointmentStatus.CANCELLED]: {
      text: "Annulé",
      className: "bg-red-500/10 text-red-500 border-red-500/20",
    },
    [AppointmentStatus.MODIFIED]: {
      text: "Modifié",
      className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
  } as const;

  return statusConfig[status] || { text: "Inconnu", className: "" };
};




































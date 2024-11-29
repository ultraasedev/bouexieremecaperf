// types/appointment.ts

// Types de base
export type ServiceType = 'diagnostic' | 'mecanique' | 'pieces-premium' | 'reprog';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'MODIFIED' | 'COMPLETED';
export type PaymentMethod = 'cb' | 'cheque' | 'virement';
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'reminder' | 'unpaid';
export type ClientType = 'individual' | 'company';
export type AppointmentPriority = 'low' | 'medium' | 'high' | 'urgent';

// Interfaces pour les véhicules
export interface Vehicle {
  id?: string;
  brand: string;
  model: string;
  year: number;
  type?: string;
  plate: string;
  vin?: string;
  photos?: string[];
  maintenanceHistory?: {
    date: Date;
    type: string;
    description: string;
    cost: number;
  }[];
}

// Interface pour les documents
export interface Document {
  id: string;
  type: 'quote' | 'invoice';
  number: string;
  date: Date;
  dueDate?: Date;
  totalHT: number;
  totalTTC: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    totalHT: number;
  }[];
  reminders?: {
    date: Date;
    type: string;
    status: 'sent' | 'pending';
  }[];
}

// Interface pour les clients
export interface Client {
  id: string;
  type: ClientType;
  name?: string; // Pour les entreprises
  firstName?: string; // Pour les particuliers
  lastName?: string; // Pour les particuliers
  contactFirstName?: string; // Pour les entreprises
  contactLastName?: string; // Pour les entreprises
  siret?: string;
  vatNumber?: string;
  email: string;
  phone: string;
  address: string;
  vehicles: Vehicle[];
  appointments: Appointment[];
  documents: Document[];
  notes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les rendez-vous
export interface Appointment {
  id: string;
  clientId: string;
  requestedDate: Date;
  confirmedDate?: Date;
  completedDate?: Date;
  service: ServiceType;
  priority: AppointmentPriority;
  vehicle: Vehicle;
  description?: string;
  diagnosis?: string;
  workPerformed?: string;
  parts?: {
    name: string;
    reference: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount?: number;
  status: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  notes?: string[];
  followUpRequired?: boolean;
  createdAt: Date;
  updatedAt: Date;
  nextServiceDue?: Date;
}

// Interface pour la création d'un rendez-vous
export interface CreateAppointmentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  brand: string;
  model: string;
  year: string;
  trim?: string;
  plate?: string;
  serviceType: ServiceType;
  description?: string;
  date: string;
  time: string;
}

// Interface pour les emails de rendez-vous
export interface AppointmentEmailData {
  firstName: string;
  lastName: string;
  fullname: string;
  email: string;
  date: string;
  time: string;
  brand: string;
  model: string;
  year: string;
  trim?: string;
  serviceType: string;
  description?: string;
  appointmentId: string;
  estimatedDuration?: string;
  estimatedCost?: number;
}

// Interface pour les notifications
export interface AppointmentNotification {
  id: string;
  type: 'reminder' | 'confirmation' | 'modification' | 'cancellation';
  appointmentId: string;
  clientId: string;
  message: string;
  sentAt: Date;
  status: 'pending' | 'sent' | 'failed';
  channel: 'email' | 'sms';
}

// Interface pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}
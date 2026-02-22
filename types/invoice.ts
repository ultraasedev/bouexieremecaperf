import * as z from 'zod';
import { ClientInfo, QuoteItem, PaymentDetails } from './quote';

// Statut possible d'une facture (aligné avec Prisma enum InvoiceStatus)
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';

// Méthode de paiement (aligné avec Prisma enum PaymentMethod)
export type PaymentMethod = 'CASH' | 'CHECK' | 'TRANSFER' | 'CARD' | 'DIRECT_DEBIT';

// Mentions légales obligatoires
export interface LegalNotices {
  generalConditions: string;
  paymentPenalties: string;
  recoveryIndemnity: string;
  vatRegime: string;
}

// Détails du paiement pour une facture
export interface InvoicePaymentDetails extends PaymentDetails {
  paymentMethod?: PaymentMethod;
  paymentDueDate?: string;       // Date d'échéance
  earlyPaymentDiscount?: number; // Escompte pour paiement anticipé
}

// Paiement enregistré
export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

// Structure complète d'une facture
export interface Invoice {
  id: string;
  number: string;                // Numéro de facture (séquentiel FA2026-000001)
  date: string;                  // Date d'émission
  dueDate: string;               // Date d'échéance
  clientId: string;
  clientInfo: ClientInfo;        // Snapshot infos client
  items: QuoteItem[];            // Lignes de facture
  paymentDetails: InvoicePaymentDetails;

  // Montants
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  totalDiscount: number;

  // Statut et suivi
  status: InvoiceStatus;
  quoteId?: string;              // Référence au devis source
  appointmentId?: string;

  // Mentions légales obligatoires
  legalNotices: LegalNotices;

  // Paramètres financiers (loi française)
  penaltyRate: number;             // Taux pénalités de retard (10.40%)
  recoveryIndemnityAmount: number; // Indemnité forfaitaire (40€)

  // Notes
  notes?: string;
  internalNotes?: string;

  // Dates de suivi
  sentAt?: string;
  paidAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;

  // Paiements
  payments?: InvoicePayment[];

  createdAt: string;
  updatedAt: string;
}

// Constantes légales et réglementaires
export const INVOICE_CONSTANTS = {
  // Mentions légales obligatoires
  LEGAL_NOTICES: {
    RECOVERY_INDEMNITY_AMOUNT: 40,
    DEFAULT_PENALTY_RATE: 10.40,
    PAYMENT_DELAY_MAX: 60,

    AUTO_ENTREPRENEUR: 'Auto-entrepreneur - Dispensé d\'immatriculation au registre du commerce et des sociétés (RCS) et au répertoire des métiers (RM)',

    VAT_MENTION: 'TVA non applicable, art. 293 B du CGI',

    PENALTY_MENTION: (rate: number) =>
      `En cas de retard de paiement, une pénalité de ${rate}% du montant de la facture sera exigible. Une indemnité forfaitaire de recouvrement de 40€ sera également due.`,

    EARLY_PAYMENT_MENTION: (rate: number) =>
      `Escompte de ${rate}% pour paiement anticipé.`,
  },

  INVOICE_NUMBER_PREFIX: 'FA',
  QUOTE_NUMBER_PREFIX: 'DEV',

  PAYMENT_METHODS: {
    CASH: 'Espèces',
    CHECK: 'Chèque',
    TRANSFER: 'Virement bancaire',
    CARD: 'Carte bancaire',
    DIRECT_DEBIT: 'Prélèvement',
  } as const,

  STATUS_LABELS: {
    DRAFT: 'Brouillon',
    SENT: 'Envoyée',
    PAID: 'Payée',
    PARTIAL: 'Partiellement payée',
    OVERDUE: 'En retard',
    CANCELLED: 'Annulée',
  } as const,

  AMOUNT_LIMITS: {
    MAX_AMOUNT: 1000000,
    MIN_AMOUNT: 0,
    DECIMAL_PLACES: 2,
  },
};

// Schéma de validation Zod pour la création de facture (API)
export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client requis'),
  date: z.string().or(z.date()),
  dueDate: z.string().or(z.date()),
  items: z.array(
    z.object({
      description: z.string().min(1, 'Description requise'),
      quantity: z.number().positive('La quantité doit être positive'),
      unitPriceHT: z.number().nonnegative('Le prix doit être positif ou nul'),
      vatRate: z.number().min(0).max(100),
      discount: z.object({
        type: z.enum(['percentage', 'fixed']).optional(),
        value: z.number().min(0).optional(),
      }).optional(),
    })
  ).min(1, 'Au moins une ligne requise'),
  paymentDetails: z.object({
    condition: z.string(),
    paymentMethod: z.enum(['CASH', 'CHECK', 'TRANSFER', 'CARD', 'DIRECT_DEBIT']).optional(),
  }),
  totalHT: z.number().nonnegative(),
  totalTTC: z.number().nonnegative(),
  totalVAT: z.number().nonnegative(),
  totalDiscount: z.number().nonnegative().default(0),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  quoteId: z.string().optional(),
  appointmentId: z.string().optional(),
});

// Schéma de validation pour la mise à jour de facture (seulement DRAFT)
export const updateInvoiceSchema = z.object({
  date: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional(),
  items: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().positive(),
      unitPriceHT: z.number().nonnegative(),
      vatRate: z.number().min(0).max(100),
      discount: z.object({
        type: z.enum(['percentage', 'fixed']).optional(),
        value: z.number().min(0).optional(),
      }).optional(),
    })
  ).optional(),
  paymentDetails: z.any().optional(),
  totalHT: z.number().optional(),
  totalTTC: z.number().optional(),
  totalVAT: z.number().optional(),
  totalDiscount: z.number().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

// Schéma de validation pour l'annulation
export const cancelInvoiceSchema = z.object({
  reason: z.string().min(1, "La raison d'annulation est obligatoire").max(500),
});

// Schéma de validation pour l'enregistrement d'un paiement
export const createPaymentSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  method: z.enum(['CASH', 'CHECK', 'TRANSFER', 'CARD', 'DIRECT_DEBIT']),
  date: z.string().or(z.date()).optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});
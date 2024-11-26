import * as z from 'zod';
import { ClientInfo, QuoteItem, PaymentDetails } from './quote';

// Statut possible d'une facture
export type InvoiceStatus = 
  | 'draft'      // Brouillon
  | 'sent'       // Envoyée
  | 'paid'       // Payée
  | 'partial'    // Partiellement payée
  | 'overdue'    // En retard
  | 'cancelled'; // Annulée

// Méthode de paiement
export type PaymentMethod = 
  | 'cash'           // Espèces
  | 'check'          // Chèque
  | 'transfer'       // Virement
  | 'card'           // Carte bancaire
  | 'direct_debit';  // Prélèvement

// Détails du paiement pour une facture
export interface InvoicePaymentDetails extends PaymentDetails {
  paymentMethod?: PaymentMethod;
  paymentDueDate: Date;        // Date d'échéance
  earlyPaymentDiscount?: number; // Escompte pour paiement anticipé
}

// Structure complète d'une facture
export interface Invoice {
  id: string;
  number: string;                // Numéro de facture (séquentiel et inaltérable)
  date: Date;                    // Date d'émission
  clientInfo: ClientInfo;        // Informations client
  items: QuoteItem[];          // Lignes de facture
  paymentDetails: InvoicePaymentDetails;
  
  // Montants
  totalHT: number;               // Total HT
  totalVAT: number;              // Total TVA
  totalTTC: number;              // Total TTC
  totalDiscount: number;         // Total des remises
  
  // Informations de statut et de suivi
  status: InvoiceStatus;
  quoteRef?: string;            // Référence au devis si applicable
  consultedAt?: Date;           // Date de consultation par le client
  paidAt?: Date;                // Date de paiement
  
  // Mentions légales obligatoires
  legalNotices: {
    generalConditions: string;   // Conditions générales de vente
    paymentPenalties: string;    // Mentions sur les pénalités de retard
    recoveryIndemnity: string;   // Indemnité forfaitaire de recouvrement
    vatRegime: string;          // Régime de TVA applicable
  };
  
  // Paramètres financiers
  penaltyRate: number;          // Taux des pénalités de retard
  recoveryIndemnityAmount: number; // Montant de l'indemnité forfaitaire (40€)
  earlyPaymentDiscountRate?: number; // Taux d'escompte

  notes?: string;               // Notes additionnelles
  internalNotes?: string;       // Notes internes (non visibles sur la facture)
  
  // Suivi des modifications
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

// Constantes légales et réglementaires
export const INVOICE_CONSTANTS = {
  // Mentions légales obligatoires
  LEGAL_NOTICES: {
    RECOVERY_INDEMNITY_AMOUNT: 40, // 40€ d'indemnité forfaitaire
    DEFAULT_PENALTY_RATE: 10.40,    // Taux des pénalités de retard (3 fois le taux légal)
    PAYMENT_DELAY_MAX: 60,          // Délai maximum de paiement en jours
    
    // Templates des mentions légales
    AUTO_ENTREPRENEUR: `
      Auto-entrepreneur
      Dispensé d'immatriculation au registre du commerce et des sociétés (RCS) 
      et au répertoire des métiers (RM)
    `,
    
    VAT_MENTION: `
      TVA non applicable, art. 293 B du CGI
    `,
    
    PENALTY_MENTION: (rate: number) => `
      En cas de retard de paiement, une pénalité de ${rate}% du montant de la facture sera exigible.
      Une indemnité forfaitaire de recouvrement de 40€ sera également due.
    `,
    
    EARLY_PAYMENT_MENTION: (rate: number) => `
      Escompte de ${rate}% pour paiement anticipé.
    `
  },

  // Numérotation des factures
  INVOICE_NUMBER_PREFIX: 'FA',     // Préfixe pour les numéros de facture
  INVOICE_NUMBER_LENGTH: 8,        // Longueur totale du numéro (ex: FA000001)

  // Options de paiement
  PAYMENT_METHODS: {
    cash: 'Espèces',
    check: 'Chèque',
    transfer: 'Virement bancaire',
    card: 'Carte bancaire',
    direct_debit: 'Prélèvement'
  },

  // Statuts et leurs libellés
  STATUS_LABELS: {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    partial: 'Partiellement payée',
    overdue: 'En retard',
    cancelled: 'Annulée'
  } as const,

  // Validation des montants
  AMOUNT_LIMITS: {
    MAX_AMOUNT: 1000000,           // Montant maximum par ligne
    MIN_AMOUNT: 0,                 // Montant minimum
    DECIMAL_PLACES: 2              // Nombre de décimales autorisées
  }
};

// Schéma de validation Zod pour les factures
export const invoiceSchema = z.object({
    // Informations générales
    number: z.string().min(1, "Le numéro de facture est requis"),
    date: z.date({
      required_error: "La date de facture est requise",
      invalid_type_error: "Format de date invalide",
    }),
  
    // Informations client (réutilisation du schéma client des devis)
    clientInfo: z.object({
      type: z.enum(['individual', 'company'], {
        required_error: "Le type de client est requis",
      }),
      individual: z.object({
        firstName: z.string().min(2, "Le prénom est requis"),
        lastName: z.string().min(2, "Le nom est requis"),
      }).optional(),
      company: z.object({
        name: z.string().min(2, "Le nom de l'entreprise est requis"),
        siret: z.string().regex(/^\d{14}$/, "Le numéro SIRET doit contenir 14 chiffres"),
        vatNumber: z.string().optional(),
        legalForm: z.string().optional(),
      }).optional(),
      email: z.string().email("Email invalide"),
      phone: z.string().min(10, "Numéro de téléphone invalide"),
      address: z.string().min(5, "Adresse requise"),
    }),
  
    // Lignes de facture
    items: z.array(
      z.object({
        description: z.string().min(1, "Description requise"),
        quantity: z.number()
          .positive("La quantité doit être positive")
          .max(99999, "Quantité trop élevée"),
        unit: z.string().min(1, "Unité requise"),
        unitPriceHT: z.number()
          .nonnegative("Le prix doit être positif ou nul")
          .max(1000000, "Montant trop élevé")
          .transform(n => Number(n.toFixed(2))), // Force 2 décimales
        vatRate: z.number()
          .nonnegative("Le taux de TVA doit être positif ou nul")
          .max(100, "Taux de TVA invalide"),
        discount: z.object({
          type: z.enum(['percentage', 'amount']),
          value: z.number()
            .nonnegative("La remise doit être positive ou nulle")
            .transform(n => Number(n.toFixed(2))),
        }).optional(),
      })
    ).min(1, "Au moins une ligne est requise"),
  
    // Détails du paiement
    paymentDetails: z.object({
      paymentMethod: z.enum(['cash', 'check', 'transfer', 'card', 'direct_debit'], {
        required_error: "La méthode de paiement est requise",
      }),
      paymentDueDate: z.date({
        required_error: "La date d'échéance est requise",
      }),
      condition: z.enum([
        'deposit', 
        'cash', 
        'upon_receipt', 
        'fifteen_days',
        'thirty_days', 
        'fortyfive_days', 
        'sixty_days'
      ], {
        required_error: "Les conditions de paiement sont requises",
      }),
      depositPercentage: z.number()
        .min(0, "Le pourcentage d'acompte doit être positif")
        .max(100, "Le pourcentage d'acompte ne peut pas dépasser 100%")
        .optional(),
      earlyPaymentDiscount: z.number()
        .min(0, "L'escompte doit être positif")
        .max(100, "L'escompte ne peut pas dépasser 100%")
        .optional(),
    }),
  
    // Montants (calculés automatiquement mais validés)
    totalHT: z.number()
      .nonnegative("Le total HT doit être positif ou nul")
      .max(1000000, "Montant total trop élevé"),
    totalVAT: z.number()
      .nonnegative("La TVA doit être positive ou nulle"),
    totalTTC: z.number()
      .nonnegative("Le total TTC doit être positif ou nul"),
    totalDiscount: z.number()
      .nonnegative("Le total des remises doit être positif ou nul"),
  
    // Statut
    status: z.enum(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled']),
  
    // Références optionnelles
    quoteRef: z.string().optional(),
    notes: z.string().max(1000, "Les notes ne peuvent pas dépasser 1000 caractères").optional(),
    internalNotes: z.string().max(1000, "Les notes internes ne peuvent pas dépasser 1000 caractères").optional(),
  
    // Paramètres financiers obligatoires selon la loi française
    penaltyRate: z.number()
      .min(0, "Le taux de pénalité doit être positif")
      .default(INVOICE_CONSTANTS.LEGAL_NOTICES.DEFAULT_PENALTY_RATE),
    recoveryIndemnityAmount: z.number()
      .positive("L'indemnité de recouvrement doit être positive")
      .default(INVOICE_CONSTANTS.LEGAL_NOTICES.RECOVERY_INDEMNITY_AMOUNT),
  
    // Mentions légales obligatoires
    legalNotices: z.object({
      generalConditions: z.string(),
      paymentPenalties: z.string(),
      recoveryIndemnity: z.string(),
      vatRegime: z.string(),
    }),
  
    // Dates de suivi
    createdAt: z.date(),
    updatedAt: z.date(),
    consultedAt: z.date().optional(),
    paidAt: z.date().optional(),
    cancelledAt: z.date().optional(),
    cancellationReason: z.string().max(500, "La raison d'annulation ne peut pas dépasser 500 caractères").optional(),
  }).refine(
    (data) => {
      // Validation conditionnelle : si type est 'company', company doit être défini
      if (data.clientInfo.type === 'company') {
        return !!data.clientInfo.company;
      }
      // Si type est 'individual', individual doit être défini
      return !!data.clientInfo.individual;
    },
    {
      message: "Les informations du client sont incomplètes",
      path: ["clientInfo"],
    }
  ).refine(
    (data) => {
      // Vérification que la date d'échéance est après la date de facture
      return data.paymentDetails.paymentDueDate > data.date;
    },
    {
      message: "La date d'échéance doit être postérieure à la date de facture",
      path: ["paymentDetails", "paymentDueDate"],
    }
  ).refine(
    (data) => {
      // Vérification du délai maximum de paiement (60 jours)
      const maxDelay = 60 * 24 * 60 * 60 * 1000; // 60 jours en millisecondes
      return (
        data.paymentDetails.paymentDueDate.getTime() - data.date.getTime() <= maxDelay
      );
    },
    {
      message: "Le délai de paiement ne peut pas dépasser 60 jours",
      path: ["paymentDetails", "paymentDueDate"],
    }
  );
// types/quote.ts
import * as z from 'zod';

export type QuoteStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export const QUOTE_CONSTANTS = {
 UNITS: ['heure', 'forfait', 'unité', 'jour'] as const,
 VAT_RATES: [0, 2.1, 5.5, 10, 20] as const,
 PAYMENT_CONDITIONS: {
   deposit: 'Acompte',
   cash: 'Comptant',
   upon_receipt: 'À réception', 
   fifteen_days: '15 jours',
   thirty_days: '30 jours',
   fortyfive_days: '45 jours',
   sixty_days: '60 jours'
 } as const,
 VALIDITY_PERIODS: [15, 30, 60, 90] as const,
};

export type Unit = typeof QUOTE_CONSTANTS.UNITS[number];
export type VatRate = typeof QUOTE_CONSTANTS.VAT_RATES[number];
export type PaymentCondition = keyof typeof QUOTE_CONSTANTS.PAYMENT_CONDITIONS;
export type ValidityPeriod = typeof QUOTE_CONSTANTS.VALIDITY_PERIODS[number];

export interface QuoteItem {
 description: string;
 quantity: number;
 unit: Unit;
 unitPriceHT: number;
 vatRate: VatRate;
 discount?: {
   type: 'percentage' | 'amount';
   value: number;
 };
 totalHT: number;
}

export interface PaymentDetails {
 condition: PaymentCondition;
 depositPercentage?: number;
}

export interface ClientInfo {
 type: 'individual' | 'company';
 individual?: {
   firstName: string;
   lastName: string;
 };
 company?: {
   name: string;
   siret: string;
   vatNumber?: string;
 };
 email: string;
 phone: string;
 address: string;
}

export interface Quote {
 id?: string;
 number: string;
 date: Date;
 validityDate: Date;
 status: QuoteStatus;
 clientInfo: ClientInfo;
 items: QuoteItem[];
 paymentDetails: PaymentDetails;
 totalHT: number;
 totalTTC: number;
 totalVAT: number;
 totalRemise: number;
 notes?: string;
 createdAt?: Date;
 updatedAt?: Date;
 sentAt?: Date;
 viewedAt?: Date;
}

const clientInfoSchema = z.object({
 type: z.enum(['individual', 'company']),
 individual: z.object({
   firstName: z.string().min(2, "Le prénom est requis"),
   lastName: z.string().min(2, "Le nom est requis"),
 }).optional(),
 company: z.object({
   name: z.string().min(2, "Le nom de l'entreprise est requis"),
   siret: z.string().regex(/^\d{14}$/, "Le numéro SIRET doit contenir 14 chiffres"),
   vatNumber: z.string().optional(),
 }).optional(),
 email: z.string().email("Email invalide"),
 phone: z.string().min(10, "Numéro de téléphone invalide"),
 address: z.string().min(5, "Adresse requise"),
}).refine((data) => {
 if (data.type === 'individual' && !data.individual) return false;
 if (data.type === 'company' && !data.company) return false;
 return true;
}, { message: "Les informations du client sont incomplètes" });

const quoteItemSchema = z.object({
 description: z.string().min(1, "Description requise"),
 quantity: z.number().positive("La quantité doit être positive"),
 unit: z.enum(QUOTE_CONSTANTS.UNITS),
 unitPriceHT: z.number().nonnegative("Le prix doit être positif ou nul"),
 vatRate: z.number().refine(
   (val): val is VatRate => QUOTE_CONSTANTS.VAT_RATES.includes(val as VatRate),
   "Taux de TVA invalide"
 ),
 discount: z.object({
   type: z.enum(['percentage', 'amount']),
   value: z.number().nonnegative("La remise doit être positive ou nulle"),
 }).optional(),
 totalHT: z.number().nonnegative(),
});

const paymentDetailsSchema = z.object({
 condition: z.enum(['deposit', 'cash', 'upon_receipt', 'fifteen_days', 'thirty_days', 'fortyfive_days', 'sixty_days']),
 depositPercentage: z.number().min(0).max(100).optional(),
}).refine((data) => {
 if (data.condition === 'deposit' && typeof data.depositPercentage !== 'number') return false;
 return true;
}, { message: "Le pourcentage d'acompte est requis pour un paiement avec acompte" });

export const quoteSchema = z.object({
 clientInfo: clientInfoSchema,
 items: z.array(quoteItemSchema).min(1, "Au moins un article est requis"),
 paymentDetails: paymentDetailsSchema,
 notes: z.string().optional(),
 validityPeriod: z.number().refine(
   (val): val is ValidityPeriod => QUOTE_CONSTANTS.VALIDITY_PERIODS.includes(val as ValidityPeriod),
   "Période de validité invalide"
 ),
});

export interface QuoteFormData {
  clientInfo: ClientInfo;
  clientId?: string;
  items: QuoteItem[];
  paymentDetails: PaymentDetails;
  validityPeriod: ValidityPeriod;
  notes?: string;
  totals: {
    totalHT: number;
    totalTTC: number;
    totalTVA: number;
    totalRemise: number;
  };
}

export interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  data: Quote;
  onPrint?: (data: QuoteFormData) => void;
}

export interface SendQuoteModalProps {
  open: boolean;
  onClose: () => void;
  data: Quote;
}
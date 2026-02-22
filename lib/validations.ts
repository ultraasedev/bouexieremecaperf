// lib/validations.ts
import { z } from 'zod';

// === Client Schemas ===

const baseClientSchema = z.object({
  email: z.string().email('Email invalide'),
  phone: z.string().min(1, 'Téléphone requis'),
  address: z.string().min(1, 'Adresse requise'),
});

const individualClientSchema = baseClientSchema.extend({
  type: z.literal('individual'),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
});

const companyClientSchema = baseClientSchema.extend({
  type: z.literal('company'),
  name: z.string().min(1, "Nom d'entreprise requis"),
  siret: z.string().min(1, 'SIRET requis'),
  vatNumber: z.string().optional().nullable(),
});

export const createClientSchema = z.discriminatedUnion('type', [
  individualClientSchema,
  companyClientSchema,
]);

export const updateClientSchema = z.object({
  type: z.enum(['individual', 'company']).optional(),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  siret: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
});

// === Quote Schemas ===

const quoteItemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  quantity: z.number().positive('Quantité doit être positive'),
  unitPriceHT: z.number().min(0, 'Prix unitaire invalide'),
  vatRate: z.number().min(0).max(100),
  discount: z.object({
    type: z.enum(['percentage', 'fixed']).optional(),
    value: z.number().min(0).optional(),
  }).optional(),
});

export const createQuoteSchema = z.object({
  number: z.string().min(1),
  date: z.string(),
  validityPeriod: z.number().int().positive().optional(),
  clientInfo: z.object({
    type: z.enum(['individual', 'company']),
    individual: z.object({
      firstName: z.string(),
      lastName: z.string(),
    }).optional(),
    company: z.object({
      name: z.string(),
      siret: z.string(),
      vatNumber: z.string().optional().nullable(),
    }).optional(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
  }),
  items: z.array(quoteItemSchema).min(1, 'Au moins un article requis'),
  paymentDetails: z.object({
    condition: z.string(),
  }).optional(),
  notes: z.string().optional(),
});

export const updateQuoteSchema = z.object({
  number: z.string().optional(),
  date: z.string().or(z.date()).optional(),
  validityDate: z.string().or(z.date()).optional(),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CANCELLED']).optional(),
  items: z.array(quoteItemSchema).optional(),
  paymentDetails: z.any().optional(),
  notes: z.string().optional(),
  totalHT: z.number().optional(),
  totalTTC: z.number().optional(),
  totalVAT: z.number().optional(),
  totalRemise: z.number().optional(),
  sentAt: z.string().or(z.date()).nullable().optional(),
  viewedAt: z.string().or(z.date()).nullable().optional(),
}).passthrough();

// === Appointment Schemas ===

export const updateAppointmentSchema = z.object({
  requestedDate: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'MODIFIED', 'CANCELLED', 'COMPLETED']).optional(),
});

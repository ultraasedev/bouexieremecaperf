// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { addDays } from 'date-fns';
import type { Quote, ClientInfo, QuoteFormData } from '@/types/quote';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transformPrismaQuoteToQuote(prismaQuote: any): Quote {
  const clientInfo: ClientInfo = {
    type: prismaQuote.client.type || 'individual',
    email: prismaQuote.client.email,
    phone: prismaQuote.client.phone,
    address: prismaQuote.client.address,
    ...(prismaQuote.client.type === 'company' && {
      company: {
        name: prismaQuote.client.name,
        siret: prismaQuote.client.siret,
        vatNumber: prismaQuote.client.vatNumber
      }
    }),
    ...(prismaQuote.client.type === 'individual' && {
      individual: {
        firstName: prismaQuote.client.firstName || prismaQuote.client.name.split(' ')[0],
        lastName: prismaQuote.client.lastName || prismaQuote.client.name.split(' ')[1] || ''
      }
    })
  };

  return {
    id: prismaQuote.id,
    number: prismaQuote.number,
    date: new Date(prismaQuote.date),
    validityDate: new Date(prismaQuote.validityDate),
    status: prismaQuote.status,
    clientInfo,
    items: Array.isArray(prismaQuote.items) ? prismaQuote.items : [],
    paymentDetails: prismaQuote.paymentDetails,
    totalHT: prismaQuote.totalHT,
    totalTTC: prismaQuote.totalTTC,
    totalVAT: prismaQuote.totalVAT,
    totalRemise: prismaQuote.totalRemise,
    notes: prismaQuote.notes,
    createdAt: new Date(prismaQuote.createdAt),
    updatedAt: new Date(prismaQuote.updatedAt),
    sentAt: prismaQuote.sentAt ? new Date(prismaQuote.sentAt) : undefined,
    viewedAt: prismaQuote.viewedAt ? new Date(prismaQuote.viewedAt) : undefined
  };
}

export function transformFormDataToQuote(
  formData: QuoteFormData, 
  savedQuote?: Partial<Quote>
): Quote {
  return {
    ...formData,
    id: savedQuote?.id,
    number: savedQuote?.number || 'BROUILLON',
    date: savedQuote?.date || new Date(),
    validityDate: savedQuote?.validityDate || addDays(new Date(), formData.validityPeriod),
    status: savedQuote?.status || 'DRAFT',
    totalHT: formData.totals.totalHT,
    totalTTC: formData.totals.totalTTC,
    totalVAT: formData.totals.totalTVA || 0,
    totalRemise: formData.totals.totalRemise,
    createdAt: savedQuote?.createdAt || new Date(),
    updatedAt: savedQuote?.updatedAt || new Date(),
    sentAt: savedQuote?.sentAt,
    viewedAt: savedQuote?.viewedAt,
  };
}

// Vous pourriez aussi ajouter cette fonction utilitaire pour le calcul des totaux
export function calculateQuoteTotals(items: Quote['items']) {
  let totalHT = 0;
  let totalVAT = 0;
  let totalRemise = 0;

  for (const item of items) {
    const itemTotal = item.quantity * item.unitPriceHT;
    const discountAmount = item.discount 
      ? (item.discount.type === 'percentage' 
        ? itemTotal * (item.discount.value / 100) 
        : item.discount.value)
      : 0;

    const itemHT = itemTotal - discountAmount;
    const itemVAT = itemHT * (item.vatRate / 100);

    totalHT += itemHT;
    totalVAT += itemVAT;
    totalRemise += discountAmount;
  }

  return {
    totalHT,
    totalVAT,
    totalTTC: totalHT + totalVAT,
    totalRemise
  };
}
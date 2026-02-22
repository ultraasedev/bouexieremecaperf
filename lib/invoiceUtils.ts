// lib/invoiceUtils.ts
import { INVOICE_CONSTANTS, type LegalNotices } from '@/types/invoice';
import type { Invoice as PrismaInvoice, Client, Payment } from '@prisma/client';

/**
 * Génère les mentions légales par défaut pour une facture.
 */
export function getDefaultLegalNotices(): Record<string, string> {
  const { LEGAL_NOTICES } = INVOICE_CONSTANTS;
  return {
    generalConditions: LEGAL_NOTICES.AUTO_ENTREPRENEUR,
    paymentPenalties: LEGAL_NOTICES.PENALTY_MENTION(LEGAL_NOTICES.DEFAULT_PENALTY_RATE),
    recoveryIndemnity: `Indemnité forfaitaire de recouvrement : ${LEGAL_NOTICES.RECOVERY_INDEMNITY_AMOUNT}€`,
    vatRegime: LEGAL_NOTICES.VAT_MENTION,
  };
}

type PrismaInvoiceWithRelations = PrismaInvoice & {
  client?: Client;
  payments?: Payment[];
};

/**
 * Transforme une facture Prisma en objet API.
 */
export function transformPrismaInvoice(invoice: PrismaInvoiceWithRelations) {
  return {
    id: invoice.id,
    number: invoice.number,
    date: invoice.date.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    status: invoice.status,
    clientId: invoice.clientId,
    clientInfo: invoice.clientInfo,
    quoteId: invoice.quoteId,
    appointmentId: invoice.appointmentId,
    totalHT: invoice.totalHT,
    totalTTC: invoice.totalTTC,
    totalVAT: invoice.totalVAT,
    totalDiscount: invoice.totalDiscount,
    items: invoice.items,
    paymentDetails: invoice.paymentDetails,
    legalNotices: invoice.legalNotices,
    penaltyRate: invoice.penaltyRate,
    recoveryIndemnityAmount: invoice.recoveryIndemnityAmount,
    notes: invoice.notes,
    internalNotes: invoice.internalNotes,
    sentAt: invoice.sentAt?.toISOString() ?? null,
    paidAt: invoice.paidAt?.toISOString() ?? null,
    cancelledAt: invoice.cancelledAt?.toISOString() ?? null,
    cancellationReason: invoice.cancellationReason,
    payments: invoice.payments?.map((p) => ({
      id: p.id,
      invoiceId: p.invoiceId,
      amount: p.amount,
      method: p.method,
      date: p.date.toISOString(),
      reference: p.reference,
      notes: p.notes,
      createdAt: p.createdAt.toISOString(),
    })),
    client: invoice.client
      ? {
          id: invoice.client.id,
          type: invoice.client.type,
          name: invoice.client.name,
          firstName: invoice.client.firstName,
          lastName: invoice.client.lastName,
          email: invoice.client.email,
          phone: invoice.client.phone,
          address: invoice.client.address,
        }
      : undefined,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
  };
}

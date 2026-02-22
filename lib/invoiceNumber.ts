// lib/invoiceNumber.ts
import { prisma } from '@/lib/prisma';

/**
 * Génère le prochain numéro séquentiel pour un type de document.
 * Format : PREFIX + ANNEE + "-" + SEQUENCE (6 chiffres)
 * Exemple : FA2026-000001, DEV2026-000001
 *
 * Utilise un upsert atomique sur le compteur pour garantir
 * l'absence de trous dans la numérotation (obligation légale française).
 */
async function getNextSequenceNumber(
  counterName: string,
  prefix: string,
  year?: number
): Promise<string> {
  const currentYear = year ?? new Date().getFullYear();

  // Upsert atomique : crée le compteur s'il n'existe pas, incrémente sinon
  const counter = await prisma.counter.upsert({
    where: {
      name_year: {
        name: counterName,
        year: currentYear,
      },
    },
    update: {
      sequence: { increment: 1 },
    },
    create: {
      name: counterName,
      year: currentYear,
      sequence: 1,
    },
  });

  const sequence = counter.sequence.toString().padStart(6, '0');
  return `${prefix}${currentYear}-${sequence}`;
}

/**
 * Génère le prochain numéro de facture.
 * Format : FA2026-000001
 */
export async function getNextInvoiceNumber(year?: number): Promise<string> {
  return getNextSequenceNumber('invoice', 'FA', year);
}

/**
 * Génère le prochain numéro de devis.
 * Format : DEV2026-000001
 */
export async function getNextQuoteNumber(year?: number): Promise<string> {
  return getNextSequenceNumber('quote', 'DEV', year);
}

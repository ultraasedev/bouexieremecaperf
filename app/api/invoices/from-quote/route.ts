// app/api/invoices/from-quote/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';
import { getNextInvoiceNumber } from '@/lib/invoiceNumber';
import { getDefaultLegalNotices, transformPrismaInvoice } from '@/lib/invoiceUtils';
import { z } from 'zod';

const fromQuoteSchema = z.object({
  quoteId: z.string().min(1, 'ID du devis requis'),
  dueDate: z.string().or(z.date()),
  paymentMethod: z.enum(['CASH', 'CHECK', 'TRANSFER', 'CARD', 'DIRECT_DEBIT']).optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const rawData = await request.json();

    const validation = fromQuoteSchema.safeParse(rawData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { quoteId, dueDate, paymentMethod, notes } = validation.data;

    // Récupérer le devis
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { client: true },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    if (quote.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Seuls les devis acceptés peuvent être convertis en facture' },
        { status: 400 }
      );
    }

    // Vérifier qu'une facture n'existe pas déjà pour ce devis
    const existingInvoice = await prisma.invoice.findFirst({
      where: { quoteId, status: { not: 'CANCELLED' } },
    });
    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Une facture existe déjà pour ce devis', invoiceId: existingInvoice.id },
        { status: 409 }
      );
    }

    // Snapshot des infos client
    const client = quote.client;
    const clientInfo = {
      type: client.type,
      email: client.email,
      phone: client.phone,
      address: client.address,
      ...(client.type === 'individual'
        ? { individual: { firstName: client.firstName, lastName: client.lastName } }
        : { company: { name: client.name, siret: client.siret, vatNumber: client.vatNumber } }),
    };

    const number = await getNextInvoiceNumber();

    const paymentDetails = {
      ...(quote.paymentDetails as Record<string, unknown>),
      ...(paymentMethod ? { paymentMethod } : {}),
    };

    const invoice = await prisma.invoice.create({
      data: {
        number,
        date: new Date(),
        dueDate: new Date(dueDate),
        clientId: quote.clientId,
        clientInfo,
        quoteId,
        totalHT: quote.totalHT,
        totalTTC: quote.totalTTC,
        totalVAT: quote.totalVAT,
        totalDiscount: quote.totalRemise,
        items: quote.items as object[],
        paymentDetails,
        legalNotices: getDefaultLegalNotices(),
        notes: notes || quote.notes,
      },
      include: { client: true, payments: true },
    });

    return NextResponse.json(transformPrismaInvoice(invoice), { status: 201 });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la conversion devis → facture:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la conversion du devis en facture' },
      { status: 500 }
    );
  }
}

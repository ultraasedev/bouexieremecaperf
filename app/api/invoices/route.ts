// app/api/invoices/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';
import { getNextInvoiceNumber } from '@/lib/invoiceNumber';
import { getDefaultLegalNotices, transformPrismaInvoice } from '@/lib/invoiceUtils';
import { createInvoiceSchema } from '@/types/invoice';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    const invoices = await prisma.invoice.findMany({
      where,
      include: { client: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices.map(transformPrismaInvoice));
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la récupération des factures:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des factures' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const rawData = await request.json();

    const validation = createInvoiceSchema.safeParse(rawData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Vérifier que le client existe
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });
    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Snapshot des infos client au moment de la création
    const clientInfo = {
      type: client.type,
      email: client.email,
      phone: client.phone,
      address: client.address,
      ...(client.type === 'individual'
        ? { individual: { firstName: client.firstName, lastName: client.lastName } }
        : { company: { name: client.name, siret: client.siret, vatNumber: client.vatNumber } }),
    };

    // Numéro séquentiel
    const number = await getNextInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        number,
        date: new Date(data.date),
        dueDate: new Date(data.dueDate),
        clientId: data.clientId,
        clientInfo,
        quoteId: data.quoteId || null,
        appointmentId: data.appointmentId || null,
        totalHT: data.totalHT,
        totalTTC: data.totalTTC,
        totalVAT: data.totalVAT,
        totalDiscount: data.totalDiscount ?? 0,
        items: data.items,
        paymentDetails: data.paymentDetails,
        legalNotices: getDefaultLegalNotices(),
        notes: data.notes,
        internalNotes: data.internalNotes,
      },
      include: { client: true, payments: true },
    });

    return NextResponse.json(transformPrismaInvoice(invoice), { status: 201 });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la création de la facture:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la facture' },
      { status: 500 }
    );
  }
}

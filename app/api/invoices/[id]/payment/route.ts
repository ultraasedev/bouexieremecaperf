// app/api/invoices/[id]/payment/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';
import { transformPrismaInvoice } from '@/lib/invoiceUtils';
import { createPaymentSchema } from '@/types/invoice';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { payments: { orderBy: { date: 'desc' } } },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = invoice.totalTTC - totalPaid;

    return NextResponse.json({
      payments: invoice.payments.map((p) => ({
        id: p.id,
        invoiceId: p.invoiceId,
        amount: p.amount,
        method: p.method,
        date: p.date.toISOString(),
        reference: p.reference,
        notes: p.notes,
        createdAt: p.createdAt.toISOString(),
      })),
      totalPaid,
      remaining: Math.max(0, remaining),
      invoiceTotal: invoice.totalTTC,
    });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la récupération des paiements:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paiements' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    if (invoice.status === 'DRAFT') {
      return NextResponse.json(
        { error: 'Impossible d\'enregistrer un paiement sur une facture en brouillon. Envoyez-la d\'abord.' },
        { status: 400 }
      );
    }

    if (invoice.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Impossible d\'enregistrer un paiement sur une facture annulée' },
        { status: 400 }
      );
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cette facture est déjà entièrement payée' },
        { status: 400 }
      );
    }

    const rawData = await request.json();
    const validation = createPaymentSchema.safeParse(rawData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Calculer le montant déjà payé
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = invoice.totalTTC - totalPaid;

    if (data.amount > remaining + 0.01) {
      return NextResponse.json(
        { error: `Le montant dépasse le restant dû (${remaining.toFixed(2)}€)` },
        { status: 400 }
      );
    }

    // Créer le paiement
    await prisma.payment.create({
      data: {
        invoiceId: id,
        amount: data.amount,
        method: data.method,
        date: data.date ? new Date(data.date) : new Date(),
        reference: data.reference,
        notes: data.notes,
      },
    });

    // Mettre à jour le statut de la facture
    const newTotalPaid = totalPaid + data.amount;
    const isFullyPaid = newTotalPaid >= invoice.totalTTC - 0.01;

    await prisma.invoice.update({
      where: { id },
      data: {
        status: isFullyPaid ? 'PAID' : 'PARTIAL',
        paidAt: isFullyPaid ? new Date() : null,
      },
    });

    // Retourner la facture complète mise à jour
    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: true, payments: true },
    });

    return NextResponse.json(transformPrismaInvoice(updatedInvoice!), { status: 201 });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error("Erreur lors de l'enregistrement du paiement:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement du paiement" },
      { status: 500 }
    );
  }
}

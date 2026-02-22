// app/api/invoices/[id]/cancel/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';
import { transformPrismaInvoice } from '@/lib/invoiceUtils';
import { cancelInvoiceSchema } from '@/types/invoice';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    if (existing.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cette facture est déjà annulée' },
        { status: 400 }
      );
    }

    const rawData = await request.json();
    const validation = cancelInvoiceSchema.safeParse(rawData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const cancelledInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: validation.data.reason,
      },
      include: { client: true, payments: true },
    });

    return NextResponse.json(transformPrismaInvoice(cancelledInvoice));
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error("Erreur lors de l'annulation de la facture:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'annulation de la facture" },
      { status: 500 }
    );
  }
}

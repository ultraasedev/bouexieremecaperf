// app/api/invoices/[id]/send/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';
import { transformPrismaInvoice } from '@/lib/invoiceUtils';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    if (invoice.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Impossible d\'envoyer une facture annulée' },
        { status: 400 }
      );
    }

    // Marquer comme envoyée
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: invoice.status === 'DRAFT' ? 'SENT' : invoice.status,
        sentAt: new Date(),
      },
      include: { client: true, payments: true },
    });

    // TODO: Intégrer l'envoi d'email avec PDF en pièce jointe
    // Pour l'instant, on marque juste comme envoyée

    return NextResponse.json({
      success: true,
      invoice: transformPrismaInvoice(updatedInvoice),
    });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error("Erreur lors de l'envoi de la facture:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de la facture" },
      { status: 500 }
    );
  }
}

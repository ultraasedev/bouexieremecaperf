// app/api/invoices/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';
import { transformPrismaInvoice } from '@/lib/invoiceUtils';
import { updateInvoiceSchema } from '@/types/invoice';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: true, payments: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(transformPrismaInvoice(invoice));
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la récupération de la facture:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la facture' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    // Vérifier que la facture existe et est en brouillon
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    // Règle légale : une facture émise est immuable
    if (existing.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Seules les factures en brouillon peuvent être modifiées' },
        { status: 403 }
      );
    }

    const rawData = await request.json();
    const validation = updateInvoiceSchema.safeParse(rawData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: validation.data,
      include: { client: true, payments: true },
    });

    return NextResponse.json(transformPrismaInvoice(updatedInvoice));
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la mise à jour de la facture:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la facture' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Règle légale : seules les factures en brouillon peuvent être supprimées
    if (existing.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Seules les factures en brouillon peuvent être supprimées. Utilisez l\'annulation pour les factures émises.' },
        { status: 403 }
      );
    }

    await prisma.invoice.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la suppression de la facture:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la facture' },
      { status: 500 }
    );
  }
}

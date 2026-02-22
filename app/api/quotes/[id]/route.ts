// app/api/quotes/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transformPrismaQuoteToQuote } from '@/lib/utils';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';
import { updateQuoteSchema } from '@/lib/validations';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(transformPrismaQuoteToQuote(quote));
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la récupération du devis:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du devis' },
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
    const rawData = await request.json();

    const validation = updateQuoteSchema.safeParse(rawData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: validation.data,
      include: { client: true }
    });

    return NextResponse.json(transformPrismaQuoteToQuote(updatedQuote));
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la mise à jour du devis:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du devis' },
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

    await prisma.quote.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la suppression du devis:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du devis' },
      { status: 500 }
    );
  }
}
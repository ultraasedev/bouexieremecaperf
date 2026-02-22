// app/api/quotes/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transformPrismaQuoteToQuote } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
    const { id } = params;
    const data = await request.json();

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data,
      include: { client: true }
    });

    return NextResponse.json(transformPrismaQuoteToQuote(updatedQuote));
  } catch (error) {
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
    const { id } = params;

    await prisma.quote.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du devis:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du devis' },
      { status: 500 }
    );
  }
}
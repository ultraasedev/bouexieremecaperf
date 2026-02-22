// app/api/quotes/generate-pdf/route.ts
import { NextResponse } from 'next/server';
import { generatePDF } from '@/lib/generatePDF';
import { prisma } from '@/lib/prisma';
import { transformPrismaQuoteToQuote } from '@/lib/utils';
import { Quote } from '@/types/quote';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = await request.json();
    let quote: Quote;

    // Si un ID est fourni, récupérer le devis de la BD
    if (data.id) {
      const prismaQuote = await prisma.quote.findUnique({
        where: { id: data.id },
        include: { client: true }
      });

      if (!prismaQuote) {
        return NextResponse.json(
          { error: 'Devis non trouvé' },
          { status: 404 }
        );
      }

      quote = transformPrismaQuoteToQuote(prismaQuote);
    } else {
      // Sinon utiliser les données fournies
      quote = {
        ...data,
        number: `DEV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        date: new Date(),
        status: 'DRAFT'
      };
    }

    // Générer le PDF
    const pdfBuffer = await generatePDF(quote);

    // Si c'est un devis existant, sauvegarder le PDF
    const existingClient = await prisma.client.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.type === 'company' && data.siret ? [{ AND: [{ type: 'company' }, { siret: data.siret }] }] : [])
        ]
      }
    });
    

    // Retourner le PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="devis-${quote.number}.pdf"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération du PDF',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// Route pour récupérer un PDF existant
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get('id');

    if (!quoteId) {
      return NextResponse.json(
        { error: 'ID du devis manquant' },
        { status: 400 }
      );
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { client: true }
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    const transformedQuote = transformPrismaQuoteToQuote(quote);
    const pdfBuffer = await generatePDF(transformedQuote);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="devis-${quote.number}.pdf"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la récupération du PDF:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération du PDF',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
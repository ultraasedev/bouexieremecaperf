// app/api/quotes/[id]/pdf/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePDF } from '@/lib/generatePDF';
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
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}
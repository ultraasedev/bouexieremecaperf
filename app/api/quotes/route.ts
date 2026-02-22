// app/api/quotes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QuoteStatus } from '@prisma/client';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const quotes = await prisma.quote.findMany({
      include: {
        client: true,
        events: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        emailData: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformer les données pour correspondre au type Quote
    const transformedQuotes = quotes.map(quote => ({
      id: quote.id,
      number: quote.number,
      date: quote.date,
      validityDate: quote.validityDate,
      status: quote.status,
      totalHT: quote.totalHT,
      totalTTC: quote.totalTTC,
      totalVAT: quote.totalVAT,
      totalRemise: quote.totalRemise,
      clientInfo: {
        type: quote.client.type,
        individual: quote.client.type === 'individual' ? {
          firstName: quote.client.firstName || '',
          lastName: quote.client.lastName || ''
        } : undefined,
        company: quote.client.type === 'company' ? {
          name: quote.client.name || '',
          siret: quote.client.siret || '',
          vatNumber: quote.client.vatNumber
        } : undefined,
        email: quote.client.email,
        phone: quote.client.phone,
        address: quote.client.address
      },
      items: quote.items,
      paymentDetails: quote.paymentDetails,
      notes: quote.notes,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      sentAt: quote.sentAt,
      viewedAt: quote.viewedAt
    }));

    return NextResponse.json(transformedQuotes);
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la récupération des devis:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des devis' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    console.log('Données reçues:', body);

    // 1. Création ou récupération du client
    let client = await prisma.client.findFirst({
      where: {
        email: body.clientInfo.email
      }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          type: body.clientInfo.type,
          email: body.clientInfo.email,
          phone: body.clientInfo.phone,
          address: body.clientInfo.address,
          ...(body.clientInfo.type === 'individual' 
            ? {
                firstName: body.clientInfo.individual.firstName,
                lastName: body.clientInfo.individual.lastName,
              }
            : {
                name: body.clientInfo.company.name,
                siret: body.clientInfo.company.siret,
                vatNumber: body.clientInfo.company.vatNumber
              }
          )
        }
      });
    }

    // 2. Calcul des totaux
    const totals = calculateTotals(body.items);

    // 3. Création du devis
    const quote = await prisma.quote.create({
      data: {
        number: body.number,
        date: new Date(body.date),
        validityDate: new Date(new Date().setDate(new Date().getDate() + (body.validityPeriod || 30))),
        status: 'DRAFT' as QuoteStatus,
        
        totalHT: totals.totalHT,
        totalTTC: totals.totalTTC,
        totalVAT: totals.totalVAT,
        totalRemise: totals.totalRemise,
        
        client: {
          connect: {
            id: client.id
          }
        },

        items: body.items,
        paymentDetails: body.paymentDetails || { condition: 'cash' },
        notes: body.notes || '',

        events: {
          create: {
            type: 'CREATED',
            metadata: {
              userEmail: 'system'
            }
          }
        },

        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        client: true,
        events: true
      }
    });

    return NextResponse.json(quote);
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la création du devis:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la création du devis',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID du devis requis' },
        { status: 400 }
      );
    }

    // Vérifier si le devis existe et son statut
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        events: true,
        emailData: true
      }
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    if (quote.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Seuls les devis en brouillon peuvent être supprimés' },
        { status: 400 }
      );
    }

    // Supprimer d'abord les relations
    await prisma.$transaction([
      prisma.quoteEvent.deleteMany({
        where: { quoteId: id }
      }),
      prisma.emailData.deleteMany({
        where: { quoteId: id }
      }),
      prisma.quote.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Devis supprimé avec succès'
    });

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

// Fonction utilitaire pour calculer les totaux
function calculateTotals(items: any[]) {
  let totalHT = 0;
  let totalVAT = 0;
  let totalRemise = 0;

  if (!items || !Array.isArray(items)) {
    return { totalHT: 0, totalVAT: 0, totalTTC: 0, totalRemise: 0 };
  }

  for (const item of items) {
    if (!item.quantity || !item.unitPriceHT || !item.vatRate) continue;

    const itemTotalHT = item.quantity * item.unitPriceHT;
    const discountAmount = item.discount?.value || 0;
    const baseHT = itemTotalHT - discountAmount;
    const vat = baseHT * (item.vatRate / 100);

    totalHT += baseHT;
    totalVAT += vat;
    totalRemise += discountAmount;
  }

  return {
    totalHT,
    totalVAT,
    totalTTC: totalHT + totalVAT,
    totalRemise
  };
}
// app/api/invoices/[id]/pdf/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';
import { generateInvoicePDF } from '@/lib/generateInvoicePDF';

export async function GET(
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

    // Récupérer les paramètres entreprise
    const companySettings = await prisma.companySettings.findFirst();

    const pdfBuffer = await generateInvoicePDF({
      number: invoice.number,
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      status: invoice.status,
      clientInfo: invoice.clientInfo as {
        type: string;
        individual?: { firstName: string | null; lastName: string | null };
        company?: { name: string | null; siret: string | null; vatNumber?: string | null };
        email: string;
        phone: string;
        address: string;
      },
      items: invoice.items as Array<{
        description: string;
        quantity: number;
        unitPriceHT: number;
        vatRate: number;
        totalHT?: number;
        discount?: { type: string; value: number };
      }>,
      totalHT: invoice.totalHT,
      totalTTC: invoice.totalTTC,
      totalVAT: invoice.totalVAT,
      totalDiscount: invoice.totalDiscount,
      paymentDetails: invoice.paymentDetails as { condition?: string; paymentMethod?: string },
      legalNotices: invoice.legalNotices as {
        generalConditions: string;
        paymentPenalties: string;
        recoveryIndemnity: string;
        vatRegime: string;
      },
      penaltyRate: invoice.penaltyRate,
      recoveryIndemnityAmount: invoice.recoveryIndemnityAmount,
      quoteId: invoice.quoteId,
      notes: invoice.notes,
      companyInfo: companySettings
        ? {
            companyName: companySettings.companyName,
            legalForm: companySettings.legalForm,
            siret: companySettings.siret,
            address: companySettings.address,
            phone: companySettings.phone,
            email: companySettings.email,
            website: companySettings.website,
            bankName: companySettings.bankName,
            bankIBAN: companySettings.bankIBAN,
            bankBIC: companySettings.bankBIC,
            vatRegime: companySettings.vatRegime,
          }
        : undefined,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="facture-${invoice.number}.pdf"`,
      },
    });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}

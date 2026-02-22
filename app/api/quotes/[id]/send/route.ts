// app/api/quotes/[id]/send/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePDF } from '@/lib/generatePDF';
import { sendQuoteEmail } from '@/lib/email';
import { transformPrismaQuoteToQuote } from '@/lib/utils';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const jsonData = formData.get('data');
    const attachments = formData.getAll('attachments');
    const { id } = params;

    if (!jsonData) {
      return NextResponse.json(
        { error: 'Données du formulaire manquantes' },
        { status: 400 }
      );
    }

    const data = JSON.parse(jsonData as string);

    // Vérifier le format de l'ID
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: 'Format d\'ID invalide' },
        { status: 400 }
      );
    }

    // Récupérer le devis
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        client: true,
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

    // Générer le PDF
    const transformedQuote = transformPrismaQuoteToQuote(quote);
    const pdfBuffer = await generatePDF(transformedQuote);

    // Préparer les pièces jointes additionnelles
    const additionalAttachments = await Promise.all(
      (attachments as File[]).map(async (file) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer())
      }))
    );

    // Envoyer l'email
    const emailResult = await sendQuoteEmail({
      to: data.to,
      quoteNumber: quote.number,
      pdfBuffer,
      message: data.message,
      cc: data.cc || [],
      bcc: data.bcc || [],
      additionalAttachments
    });

    if (!emailResult.success) {
      throw new Error(emailResult.error);
    }

    // Mise à jour du devis et création des événements
    await prisma.$transaction([
      // Mettre à jour le statut du devis
      prisma.quote.update({
        where: { id },
        data: {
          status: 'SENT',
          sentAt: new Date()
        }
      }),

      // Créer l'entrée EmailData
      prisma.emailData.create({
        data: {
          quoteId: id,
          messageId: emailResult.data?.data?.id || `tmp-${Date.now()}`,
          recipients: Array.isArray(data.to) ? data.to : [data.to],
          subject: data.subject || `Devis n°${quote.number} - Bouexiere Meca Performance`,
          sentAt: new Date()
        }
      }),

      // Créer l'événement
      prisma.quoteEvent.create({
        data: {
          quoteId: id,
          type: 'EMAIL_SENT',
          metadata: {
            emailId: emailResult.data?.data?.id,
            recipients: data.to,
            cc: data.cc,
            bcc: data.bcc,
            attachments: additionalAttachments.map(att => att.filename)
          }
        }
      })
    ]);

    return NextResponse.json({ 
      success: true,
      messageId: emailResult.data?.data?.id,
      status: 'SENT'
    });

  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de l\'envoi du devis:', error);

    let errorMessage = 'Erreur lors de l\'envoi du devis';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('RESEND_API_KEY')) {
        errorMessage = 'Configuration email manquante';
        statusCode = 500;
      } else if (error.message.includes('recipient')) {
        errorMessage = 'Adresse email du destinataire invalide';
        statusCode = 400;
      } else if (error.message.includes('attachment')) {
        errorMessage = 'Erreur avec les pièces jointes';
        statusCode = 400;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: statusCode }
    );
  }
}

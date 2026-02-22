// lib/email.ts
import nodemailer from 'nodemailer';
import { getEmailTemplate } from './emailTemplate';
import { 
  getClientEmailTemplate,
  getGarageEmailTemplate,
  getModificationEmailTemplate,
  getCancellationEmailTemplate,
  getAppointmentConfirmationTemplate,
  getAppointmentReminderTemplate,
  type AppointmentEmailData
} from './email-templates/appointment';

if (!process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASSWORD) {
  throw new Error('Les identifiants Mailtrap sont requis dans les variables d\'environnement');
}

// Configuration du transporteur Mailtrap
const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD
  }
});

const FROM_EMAIL = 'Bouexiere Meca Performance <contact@bmp.fr>';
const BCC_EMAIL = 'archive@bmp.fr';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
  cc?: string[];
  bcc?: string[];
}

// Fonction générique d'envoi d'email
export async function sendEmail({
  to,
  subject,
  html,
  attachments = [],
  cc = [],
  bcc = []
}: SendEmailOptions) {
  try {
    const mailOptions = {
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to.join(', ') : to,
      cc: cc.length > 0 ? cc.join(', ') : undefined,
      bcc: [...bcc, BCC_EMAIL].join(', '),
      subject,
      html,
      attachments: attachments.map(att => ({
        filename: att.filename,
        content: att.content
      }))
    };

    const info = await transport.sendMail(mailOptions);

    return { 
      success: true, 
      data: {
        id: info.messageId,
        data: {
          id: info.messageId
        }
      }
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Fonction spécifique pour l'envoi de devis
export async function sendQuoteEmail({
  to,
  quoteNumber,
  pdfBuffer,
  message,
  cc = [],
  bcc = [],
  additionalAttachments = []
}: {
  to: string | string[];
  quoteNumber: string;
  pdfBuffer: Buffer;
  message?: string;
  cc?: string[];
  bcc?: string[];
  additionalAttachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}) {
  const attachments = [
    {
      filename: `devis-${quoteNumber}.pdf`,
      content: pdfBuffer
    },
    ...additionalAttachments
  ];

  return sendEmail({
    to,
    subject: `Devis n°${quoteNumber} - Bouexiere Meca Performance`,
    html: getEmailTemplate({
      quoteNumber,
      message
    }),
    attachments,
    cc,
    bcc
  });
}

// Nouvelle fonction pour l'envoi d'emails liés aux rendez-vous
export async function sendAppointmentEmail(
  type: 'NEW' | 'CONFIRMED' | 'MODIFIED' | 'CANCELLED' | 'REMINDER',
  data: AppointmentEmailData
) {
  let subject: string;
  let html: string;

  switch (type) {
    case 'NEW':
      subject = 'Nouvelle demande de rendez-vous';
      html = getClientEmailTemplate(data);
      // Envoi d'une copie au garage
      await sendEmail({
        to: process.env.GARAGE_EMAIL || 'contact@bouexiere-meca-perf.fr',
        subject: 'Nouvelle demande de rendez-vous client',
        html: getGarageEmailTemplate(data)
      });
      break;
    case 'CONFIRMED':
      subject = 'Votre rendez-vous est confirmé';
      html = getAppointmentConfirmationTemplate(data);
      break;
    case 'MODIFIED':
      subject = 'Modification de votre rendez-vous';
      html = getModificationEmailTemplate(data);
      break;
    case 'CANCELLED':
      subject = 'Annulation de votre rendez-vous';
      html = getCancellationEmailTemplate(data);
      break;
    case 'REMINDER':
      subject = 'Rappel de votre rendez-vous de demain';
      html = getAppointmentReminderTemplate(data);
      break;
    default:
      throw new Error('Type d\'email invalide');
  }

  return sendEmail({
    to: data.email,
    subject,
    html
  });
}

// Export des types
export type { SendEmailOptions, AppointmentEmailData };
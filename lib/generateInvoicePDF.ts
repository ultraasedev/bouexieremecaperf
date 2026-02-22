// lib/generateInvoicePDF.ts
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { INVOICE_CONSTANTS } from '@/types/invoice';
import type { LegalNotices } from '@/types/invoice';

interface InvoiceForPDF {
  number: string;
  date: string;
  dueDate: string;
  status: string;
  clientInfo: {
    type: string;
    individual?: { firstName: string | null; lastName: string | null };
    company?: { name: string | null; siret: string | null; vatNumber?: string | null };
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPriceHT: number;
    vatRate: number;
    totalHT?: number;
    discount?: { type: string; value: number };
  }>;
  totalHT: number;
  totalTTC: number;
  totalVAT: number;
  totalDiscount: number;
  paymentDetails: {
    condition?: string;
    paymentMethod?: string;
  };
  legalNotices: LegalNotices;
  penaltyRate: number;
  recoveryIndemnityAmount: number;
  quoteId?: string | null;
  notes?: string | null;
  companyInfo?: {
    companyName: string;
    legalForm: string;
    siret: string;
    address: string;
    phone: string;
    email: string;
    website?: string | null;
    bankName?: string | null;
    bankIBAN?: string | null;
    bankBIC?: string | null;
    vatRegime: string;
  };
}

export async function generateInvoicePDF(invoice: InvoiceForPDF): Promise<Buffer> {
  const doc = new jsPDF();
  doc.setFont('helvetica');

  const company = invoice.companyInfo;

  // === En-tête ===
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('FACTURE', 150, 20, { align: 'right' });

  doc.setFontSize(12);
  doc.text(`N° ${invoice.number}`, 150, 30, { align: 'right' });
  doc.text(`Date : ${new Date(invoice.date).toLocaleDateString('fr-FR')}`, 150, 38, { align: 'right' });
  doc.text(`Échéance : ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`, 150, 46, { align: 'right' });

  // === Informations société ===
  doc.setFontSize(14);
  doc.text(company?.companyName || 'Bouëxière Méca Performance', 20, 20);
  doc.setFontSize(9);

  let companyY = 28;
  if (company) {
    doc.text(company.address, 20, companyY);
    companyY += 5;
    doc.text(`Tél : ${company.phone}`, 20, companyY);
    companyY += 5;
    doc.text(`Email : ${company.email}`, 20, companyY);
    companyY += 5;
    if (company.website) {
      doc.text(`Web : ${company.website}`, 20, companyY);
      companyY += 5;
    }
    doc.text(`SIRET : ${company.siret}`, 20, companyY);
    companyY += 5;
    doc.text(company.legalForm, 20, companyY);
  } else {
    doc.text('SIRET : Non renseigné', 20, companyY);
  }

  // === Informations client ===
  doc.setFontSize(11);
  doc.text('CLIENT', 20, 65);
  doc.setFontSize(10);

  const clientName = invoice.clientInfo.type === 'company'
    ? invoice.clientInfo.company?.name || ''
    : `${invoice.clientInfo.individual?.firstName || ''} ${invoice.clientInfo.individual?.lastName || ''}`.trim();

  let clientY = 73;
  doc.text(clientName, 20, clientY);
  clientY += 5;
  doc.text(invoice.clientInfo.address, 20, clientY);
  clientY += 5;
  doc.text(`Tél : ${invoice.clientInfo.phone}`, 20, clientY);
  clientY += 5;
  doc.text(`Email : ${invoice.clientInfo.email}`, 20, clientY);

  if (invoice.clientInfo.type === 'company' && invoice.clientInfo.company?.siret) {
    clientY += 5;
    doc.text(`SIRET : ${invoice.clientInfo.company.siret}`, 20, clientY);
  }

  // Référence devis
  if (invoice.quoteId) {
    clientY += 7;
    doc.setFontSize(9);
    doc.text(`Réf. devis : ${invoice.quoteId}`, 20, clientY);
  }

  // === Tableau des articles ===
  const tableData = invoice.items.map(item => {
    const totalHT = item.totalHT ?? item.quantity * item.unitPriceHT;
    return [
      item.description,
      item.quantity.toString(),
      `${item.unitPriceHT.toFixed(2)} €`,
      `${item.vatRate}%`,
      item.discount
        ? (item.discount.type === 'percentage'
          ? `${item.discount.value}%`
          : `${item.discount.value.toFixed(2)} €`)
        : '-',
      `${totalHT.toFixed(2)} €`,
    ];
  });

  (doc as unknown as { autoTable: (opts: unknown) => void }).autoTable({
    startY: clientY + 10,
    head: [['Description', 'Qté', 'Prix U. HT', 'TVA', 'Remise', 'Total HT']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 30, 30] },
  });

  // === Totaux ===
  const finalY = (doc as unknown as { previousAutoTable: { finalY: number } }).previousAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.text('Total HT :', 120, finalY);
  doc.text(`${invoice.totalHT.toFixed(2)} €`, 185, finalY, { align: 'right' });

  if (invoice.totalDiscount > 0) {
    doc.text('Remise :', 120, finalY + 6);
    doc.text(`-${invoice.totalDiscount.toFixed(2)} €`, 185, finalY + 6, { align: 'right' });
  }

  const vatY = finalY + (invoice.totalDiscount > 0 ? 12 : 6);
  doc.text('TVA :', 120, vatY);
  doc.text(`${invoice.totalVAT.toFixed(2)} €`, 185, vatY, { align: 'right' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Total TTC :', 120, vatY + 10);
  doc.text(`${invoice.totalTTC.toFixed(2)} €`, 185, vatY + 10, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  // === Conditions de paiement ===
  let footerY = vatY + 25;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS DE RÈGLEMENT', 20, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  footerY += 6;

  const paymentCondition = invoice.paymentDetails.condition || 'À réception';
  doc.text(`Conditions : ${paymentCondition}`, 20, footerY);

  if (invoice.paymentDetails.paymentMethod) {
    const methodLabel = INVOICE_CONSTANTS.PAYMENT_METHODS[
      invoice.paymentDetails.paymentMethod as keyof typeof INVOICE_CONSTANTS.PAYMENT_METHODS
    ] || invoice.paymentDetails.paymentMethod;
    footerY += 5;
    doc.text(`Mode de paiement : ${methodLabel}`, 20, footerY);
  }

  // Coordonnées bancaires
  if (company?.bankIBAN) {
    footerY += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('COORDONNÉES BANCAIRES', 20, footerY);
    doc.setFont('helvetica', 'normal');
    footerY += 5;
    if (company.bankName) doc.text(`Banque : ${company.bankName}`, 20, footerY);
    footerY += 5;
    doc.text(`IBAN : ${company.bankIBAN}`, 20, footerY);
    if (company.bankBIC) {
      footerY += 5;
      doc.text(`BIC : ${company.bankBIC}`, 20, footerY);
    }
  }

  // === Mentions légales obligatoires ===
  footerY += 12;
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);

  const notices = invoice.legalNotices;
  doc.text(notices.vatRegime, 20, footerY);
  footerY += 4;
  doc.text(notices.paymentPenalties, 20, footerY, { maxWidth: 170 });
  footerY += 8;
  doc.text(notices.recoveryIndemnity, 20, footerY);
  footerY += 4;
  doc.text(notices.generalConditions, 20, footerY, { maxWidth: 170 });

  // Notes
  if (invoice.notes) {
    footerY += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text(`Notes : ${invoice.notes}`, 20, footerY, { maxWidth: 170 });
  }

  return Buffer.from(doc.output('arraybuffer'));
}

// lib/generatePDF.ts
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Quote } from '@/types/quote';
import { prisma } from '@/lib/prisma';

export async function generatePDF(quote: Quote): Promise<Buffer> {
  const doc = new jsPDF();
  doc.setFont('helvetica');

  // Récupérer les paramètres entreprise
  const company = await prisma.companySettings.findFirst();

  // En-tête
  doc.setFontSize(20);
  doc.text('DEVIS', 150, 20, { align: 'right' });

  doc.setFontSize(12);
  doc.text(`N° ${quote.number}`, 150, 30, { align: 'right' });
  doc.text(`Date : ${new Date(quote.date).toLocaleDateString('fr-FR')}`, 150, 40, { align: 'right' });

  // Informations société (dynamique depuis CompanySettings)
  doc.setFontSize(14);
  doc.text(company?.companyName || 'Bouëxière Méca Performance', 20, 20);
  doc.setFontSize(10);
  if (company) {
    doc.text(company.address, 20, 30);
    doc.text(`Tél : ${company.phone}`, 20, 35);
    doc.text(`Email : ${company.email}`, 20, 40);
    doc.text(`SIRET : ${company.siret}`, 20, 45);
  } else {
    doc.text('Paramètres entreprise non configurés', 20, 30);
  }

  // Informations client
  doc.setFontSize(12);
  doc.text('CLIENT', 20, 60);
  doc.setFontSize(10);

  const clientName = quote.clientInfo.type === 'company'
    ? quote.clientInfo.company?.name
    : `${quote.clientInfo.individual?.firstName} ${quote.clientInfo.individual?.lastName}`;

  doc.text(clientName || '', 20, 70);
  doc.text(quote.clientInfo.address, 20, 75);
  doc.text(`Tél : ${quote.clientInfo.phone}`, 20, 80);
  doc.text(`Email : ${quote.clientInfo.email}`, 20, 85);

  // Tableau des articles
  const tableData = quote.items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unitPriceHT.toFixed(2)} €`,
    `${item.vatRate}%`,
    item.discount
      ? (item.discount.type === 'percentage'
        ? `${item.discount.value}%`
        : `${item.discount.value.toFixed(2)} €`)
      : '-',
    `${item.totalHT.toFixed(2)} €`
  ]);

  (doc as unknown as { autoTable: (opts: unknown) => void }).autoTable({
    startY: 95,
    head: [['Description', 'Quantité', 'Prix U. HT', 'TVA', 'Remise', 'Total HT']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 0, 0] }
  });

  // Totaux
  const finalY = (doc as unknown as { previousAutoTable: { finalY: number } }).previousAutoTable.finalY + 10;

  doc.text('Total HT :', 120, finalY);
  doc.text(`${quote.totalHT.toFixed(2)} €`, 170, finalY, { align: 'right' });

  if (quote.totalRemise > 0) {
    doc.text('Remise :', 120, finalY + 5);
    doc.text(`${quote.totalRemise.toFixed(2)} €`, 170, finalY + 5, { align: 'right' });
  }

  doc.text('TVA :', 120, finalY + 10);
  doc.text(`${quote.totalVAT.toFixed(2)} €`, 170, finalY + 10, { align: 'right' });

  doc.setFontSize(12);
  doc.text('Total TTC :', 120, finalY + 20);
  doc.text(`${quote.totalTTC.toFixed(2)} €`, 170, finalY + 20, { align: 'right' });

  // Conditions de paiement
  doc.setFontSize(11);
  doc.text('CONDITIONS DE RÈGLEMENT', 20, finalY + 35);
  doc.setFontSize(10);
  doc.text(
    quote.paymentDetails.condition === 'deposit'
      ? `Acompte de ${quote.paymentDetails.depositPercentage}% à la commande`
      : quote.paymentDetails.condition,
    20,
    finalY + 42
  );

  // Mentions légales
  const vatRegime = company?.vatRegime || 'TVA non applicable, art. 293 B du CGI';
  const legalForm = company?.legalForm || 'Auto-entrepreneur';

  doc.setFontSize(8);
  doc.text(vatRegime, 20, finalY + 60);
  doc.text(`${legalForm} - Dispensé d'immatriculation au RCS et au RM`, 20, finalY + 65);
  doc.text('En cas d\'acceptation, merci de retourner ce devis signé avec la mention "Bon pour accord"', 20, finalY + 70);

  return Buffer.from(doc.output('arraybuffer'));
}

// app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lundi
    startOfWeek.setHours(0, 0, 0, 0);

    // Agrégations en parallèle
    const [
      totalClients,
      totalAppointments,
      pendingQuotes,
      invoicesPaid,
      monthlyInvoices,
      recentAppointments,
      recentQuotes,
      monthlyRevenue,
    ] = await Promise.all([
      // Total clients
      prisma.client.count(),

      // RDV cette semaine
      prisma.appointment.count({
        where: {
          requestedDate: { gte: startOfWeek },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      }),

      // Devis en attente
      prisma.quote.count({
        where: { status: { in: ['DRAFT', 'SENT'] } },
      }),

      // Factures payées (chiffre d'affaires total)
      prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { totalTTC: true },
      }),

      // Factures du mois en cours (CA ce mois)
      prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          paidAt: { gte: startOfMonth },
        },
        _sum: { totalTTC: true },
      }),

      // 5 derniers RDV
      prisma.appointment.findMany({
        where: { status: { in: ['PENDING', 'CONFIRMED'] } },
        include: { client: { select: { firstName: true, lastName: true, name: true, type: true } } },
        orderBy: { requestedDate: 'asc' },
        take: 5,
      }),

      // 5 derniers devis
      prisma.quote.findMany({
        include: { client: { select: { firstName: true, lastName: true, name: true, type: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Revenus mensuels (6 derniers mois)
      getMonthlyRevenue(),
    ]);

    const caTotal = invoicesPaid._sum.totalTTC || 0;
    const caMois = monthlyInvoices._sum.totalTTC || 0;

    return NextResponse.json({
      stats: {
        revenue: caTotal,
        revenueMonth: caMois,
        clients: totalClients,
        appointmentsWeek: totalAppointments,
        pendingQuotes,
      },
      recentAppointments: recentAppointments.map((apt) => {
        const clientName = apt.client.type === 'company'
          ? apt.client.name
          : `${apt.client.firstName || ''} ${apt.client.lastName || ''}`.trim();
        return {
          id: apt.id,
          clientName: clientName || 'Client',
          service: apt.service,
          date: apt.requestedDate.toISOString(),
          status: apt.status,
        };
      }),
      recentQuotes: recentQuotes.map((quote) => {
        const clientName = quote.client.type === 'company'
          ? quote.client.name
          : `${quote.client.firstName || ''} ${quote.client.lastName || ''}`.trim();
        return {
          id: quote.id,
          number: quote.number,
          clientName: clientName || 'Client',
          totalTTC: quote.totalTTC,
          status: quote.status,
          date: quote.date.toISOString(),
        };
      }),
      monthlyRevenue,
    });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur stats dashboard:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des statistiques' },
      { status: 500 }
    );
  }
}

async function getMonthlyRevenue(): Promise<Array<{ name: string; value: number }>> {
  const months: Array<{ name: string; value: number }> = [];
  const now = new Date();
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const result = await prisma.invoice.aggregate({
      where: {
        status: 'PAID',
        paidAt: { gte: date, lt: nextMonth },
      },
      _sum: { totalTTC: true },
    });

    months.push({
      name: monthNames[date.getMonth()],
      value: result._sum.totalTTC || 0,
    });
  }

  return months;
}

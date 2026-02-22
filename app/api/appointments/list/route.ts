// app/api/appointments/list/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const appointments = await prisma.appointment.findMany({
      include: {
        client: true,
      },
      orderBy: {
        requestedDate: 'desc',
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rendez-vous' },
      { status: 500 }
    );
  }
}
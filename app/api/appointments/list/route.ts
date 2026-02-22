// app/api/appointments/list/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
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
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rendez-vous' },
      { status: 500 }
    );
  }
}
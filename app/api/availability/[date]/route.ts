// app/api/availability/[date]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValid, format } from 'date-fns';

export async function GET(
  request: Request,
  { params }: { params: { date: string } }
) {
  try {
    const date = new Date(params.date);

    if (!isValid(date)) {
      return NextResponse.json({
        error: 'Format de date invalide'
      }, { status: 400 });
    }

    const availability = await prisma.availability.findUnique({
      where: {
        date: date
      }
    });

    if (!availability) {
      return NextResponse.json({
        availability: null
      });
    }

    // Formatage de la réponse avec timeSlots et bookedSlots
    return NextResponse.json({
      availability: {
        date: format(availability.date, 'yyyy-MM-dd'),
        timeSlots: availability.timeSlots,
        bookedSlots: availability.bookedSlots || []
      }
    });

  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({
      error: 'Erreur lors de la récupération des disponibilités'
    }, { status: 500 });
  }
}
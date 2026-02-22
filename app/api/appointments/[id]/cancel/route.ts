// app/api/appointments/[id]/cancel/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAppointmentEmail } from '@/lib/email';
import { AppointmentEmailData } from '@/types/appoitement';

// Helper pour formater la date
const formatDateForEmail = (date: Date): string => {
  return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
};

// Helper pour extraire l'heure de la date
const getTimeFromDate = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// Helper pour extraire les données du véhicule du JSON
const getVehicleData = (vehicleJson: any) => {
  try {
    const vehicle = typeof vehicleJson === 'string' ? JSON.parse(vehicleJson) : vehicleJson;
    return {
      brand: (vehicle.brand || '').toString(),
      model: (vehicle.model || '').toString(),
      year: (vehicle.year || '').toString(),
      trim: vehicle.trim?.toString()
    };
  } catch (error) {
    console.error('Erreur de parsing du véhicule:', error);
    return {
      brand: 'Non spécifié',
      model: 'Non spécifié',
      year: 'Non spécifié',
      trim: undefined
    };
  }
};

// Helper pour créer le fullname
const createFullName = (firstName: string | null, lastName: string | null): string => {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  return `${first} ${last}`.trim() || 'Client';
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier si le rendez-vous existe
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { client: true }
    });

    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Rendez-vous non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour le statut du rendez-vous
    const appointment = await prisma.appointment.update({
      where: { id: params.id },
      data: { 
        status: 'CANCELLED' 
      },
      include: {
        client: true
      }
    });

    // Préparer et envoyer l'email
    const vehicleData = getVehicleData(appointment.vehicle);
    const formattedTime = getTimeFromDate(appointment.requestedDate);

    const emailData: AppointmentEmailData = {
      firstName: appointment.client.firstName || '',
      lastName: appointment.client.lastName || '',
      fullname: createFullName(appointment.client.firstName, appointment.client.lastName),
      email: appointment.client.email,
      date: formatDateForEmail(appointment.requestedDate),
      time: formattedTime,
      brand: vehicleData.brand,
      model: vehicleData.model,
      year: vehicleData.year,
      trim: vehicleData.trim,
      serviceType: appointment.service,
      description: appointment.description || undefined,
      appointmentId: appointment.id
    };

    await sendAppointmentEmail('CANCELLED', emailData);

    return NextResponse.json({
      success: true,
      message: 'Rendez-vous annulé avec succès',
      data: appointment
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation du rendez-vous' },
      { status: 500 }
    );
  }
}
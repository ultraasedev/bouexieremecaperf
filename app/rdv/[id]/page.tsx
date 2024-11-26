// app/rdv/[id]/page.tsx
import { Metadata } from 'next';
import AppointmentManagement from '@/components/rdv/AppointmentManagement';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AppointmentData, AppointmentVehicle, AppointmentStatus } from '@/types/appoitement';
import { Prisma } from '@prisma/client';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: 'Gérer votre rendez-vous | Bouëxière Méca Perf',
    description: 'Modifier ou annuler votre rendez-vous',
  };
}

// Type helper pour le véhicule JSON de Prisma
type PrismaJsonVehicle = Prisma.JsonValue & {
  brand: string;
  model: string;
  year: number;
  trim?: string;
};

export default async function AppointmentPage({ params }: PageProps) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: params.id
      },
      include: {
        client: true,
      }
    });

    if (!appointment) {
      notFound();
    }

    // Vérification et conversion sécurisée du véhicule
    const vehicleData = appointment.vehicle as PrismaJsonVehicle;
    if (!vehicleData || typeof vehicleData !== 'object') {
      throw new Error('Invalid vehicle data');
    }

    const vehicle: AppointmentVehicle = {
      brand: String(vehicleData.brand || ''),
      model: String(vehicleData.model || ''),
      year: Number(vehicleData.year || 0),
      trim: vehicleData.trim ? String(vehicleData.trim) : undefined
    };

    // Conversion des données pour le composant
    const formattedAppointment: AppointmentData = {
      id: appointment.id,
      requestedDate: appointment.requestedDate,
      service: appointment.service,
      vehicle: vehicle,
      description: appointment.description || undefined,
      status: appointment.status as AppointmentStatus,
      client: {
        id: appointment.client.id,
        firstName: appointment.client.firstName,
        lastName: appointment.client.lastName,
        email: appointment.client.email,
        phone: appointment.client.phone,
        address: appointment.client.address || ''
      }
    };

    // Vérification des données requises
    if (!formattedAppointment.vehicle.brand || 
        !formattedAppointment.vehicle.model || 
        !formattedAppointment.vehicle.year) {
      console.error('Données de véhicule incomplètes:', vehicleData);
      notFound();
    }

    return <AppointmentManagement appointment={formattedAppointment} />;
  } catch (error) {
    console.error('Erreur lors de la récupération du rendez-vous:', error);
    notFound();
  }
}
// app/api/clients/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, AppointmentStatus, QuoteStatus } from '@prisma/client';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

/**
 * Interfaces pour la gestion des véhicules et des mises à jour
 */
interface VehicleUpdateData {
  id?: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  plate: string;
  vin?: string;
}

interface UpdateClientRequest {
  email?: string;
  phone?: string;
  address?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  siret?: string;
  vatNumber?: string;
  type?: 'individual' | 'company';
  vehicles?: VehicleUpdateData[];
}
interface TransformedClient {
  id: string;
  type: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  siret: string | null;
  vatNumber: string | null;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  vehicles: any[];
  appointments: any[];
  invoices: any[];
  quotes: any[];
  documents: any[];
}

/**
 * Fonctions utilitaires
 */
async function checkVehicleConstraints(vehicle: VehicleUpdateData, clientId: string, vehicleId?: string) {
  // Vérifier l'unicité de la plaque
  const existingPlate = await prisma.vehicle.findFirst({
    where: {
      plate: vehicle.plate,
      NOT: vehicleId ? { id: vehicleId } : undefined,
      clientId: { not: clientId }
    }
  });

  if (existingPlate) {
    throw new Error(`La plaque d'immatriculation ${vehicle.plate} est déjà utilisée`);
  }

  // Vérifier l'unicité du VIN si fourni
  if (vehicle.vin) {
    const existingVin = await prisma.vehicle.findFirst({
      where: {
        vin: vehicle.vin,
        NOT: vehicleId ? { id: vehicleId } : undefined,
        clientId: { not: clientId }
      }
    });

    if (existingVin) {
      throw new Error(`Le numéro VIN ${vehicle.vin} est déjà utilisé`);
    }
  }
}

/**
 * GET - Récupère les détails d'un client spécifique
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        vehicles: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            type: true,
            plate: true,
            vin: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        appointments: {
          select: {
            id: true,
            service: true,
            vehicle: true,
            description: true,
            requestedDate: true,
            status: true,
            createdAt: true,
            token: true
          },
          orderBy: {
            requestedDate: 'desc'
          }
        },
        invoices: {
          select: {
            id: true,
            number: true,
            totalHT: true,
            totalTTC: true,
            status: true,
            dueDate: true,
            items: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        quotes: {
          select: {
            id: true,
            number: true,
            date: true,
            status: true,
            totalHT: true,
            totalTTC: true,
            validityDate: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    const transformedClient = {
      ...client,
      appointments: client.appointments.map(appointment => ({
        ...appointment,
        vehicle: typeof appointment.vehicle === 'string' 
          ? JSON.parse(appointment.vehicle) 
          : appointment.vehicle
      })),
      documents: [
        ...client.invoices.map(invoice => ({
          id: invoice.id,
          type: 'invoice' as const,
          number: invoice.number,
          date: invoice.createdAt,
          totalTTC: invoice.totalTTC,
          status: invoice.status,
          createdAt: invoice.createdAt
        })),
        ...client.quotes.map(quote => ({
          id: quote.id,
          type: 'quote' as const,
          number: quote.number,
          date: quote.date,
          totalTTC: quote.totalTTC,
          status: quote.status,
          createdAt: quote.createdAt
        }))
      ].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      fullName: client.type === 'company'
        ? client.name
        : `${client.firstName} ${client.lastName}`.trim()
    };

    return NextResponse.json(transformedClient);
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du client' },
      { status: 500 }
    );
  }
}
/**
 * PATCH - Met à jour les informations d'un client
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const data = await request.json();
    
    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: {
        email: data.email,
        phone: data.phone,
        address: data.address,
        name: data.type === 'company' ? data.name : null,
        firstName: data.type === 'individual' ? data.firstName : null,
        lastName: data.type === 'individual' ? data.lastName : null,
        siret: data.type === 'company' ? data.siret : null,
        vatNumber: data.type === 'company' ? data.vatNumber : null,
        type: data.type 
      },
      include: {
        vehicles: true,
        appointments: {
          select: {
            id: true,
            service: true,
            vehicle: true,
            description: true,
            requestedDate: true,
            status: true,
            createdAt: true,
            token: true
          }
        },
        invoices: true,
        quotes: true
      }
    });

    // Transformer le client comme dans la route GET
    const transformedClient = {
      ...updatedClient,
      documents: [
        ...updatedClient.invoices.map(invoice => ({
          id: invoice.id,
          type: 'invoice' as const,
          number: invoice.number,
          date: invoice.createdAt,
          totalTTC: invoice.totalTTC,
          status: invoice.status,
          createdAt: invoice.createdAt
        })),
        ...updatedClient.quotes.map(quote => ({
          id: quote.id,
          type: 'quote' as const,
          number: quote.number,
          date: quote.date,
          totalTTC: quote.totalTTC,
          status: quote.status,
          createdAt: quote.createdAt
        }))
      ]
    };

    return NextResponse.json(transformedClient);
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Error:', error);
    return NextResponse.json({ error: 'Mise à jour échouée' }, { status: 500 });
  }
}
/**
 * POST - Création d'un nouveau client
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = await request.json() as UpdateClientRequest;

    // Validation des données communes requises
    if (!data.email || !data.phone || !data.address) {
      return NextResponse.json(
        { error: 'Email, téléphone et adresse sont requis' },
        { status: 400 }
      );
    }

    // Validation spécifique selon le type de client
    if (data.type === 'company') {
      if (!data.name || !data.siret) {
        return NextResponse.json(
          { error: 'Nom d\'entreprise et SIRET sont requis pour une entreprise' },
          { status: 400 }
        );
      }
    } else if (data.type === 'individual') {
      if (!data.firstName || !data.lastName) {
        return NextResponse.json(
          { error: 'Prénom et nom sont requis pour un particulier' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Type de client invalide' },
        { status: 400 }
      );
    }

    // Vérification de l'unicité email/SIRET
    const whereConditions = {
      OR: [
        { email: data.email }
      ]
    } as any;

    if (data.type === 'company' && data.siret) {
      whereConditions.OR.push({
        AND: [
          { type: 'company' },
          { siret: data.siret }
        ]
      });
    }

    const existingClient = await prisma.client.findFirst({
      where: whereConditions
    });

    if (existingClient) {
      const errorMessage = existingClient.email === data.email
        ? 'Un client avec cet email existe déjà'
        : 'Un client avec ce SIRET existe déjà';
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Véhicules à créer
    let vehicleData: string | any[] = [];
    if (data.vehicles && data.vehicles.length > 0) {
      try {
        // Vérifier les contraintes pour tous les véhicules
        await Promise.all(
          data.vehicles.map(vehicle => checkVehicleConstraints(vehicle, 'new'))
        );
        vehicleData = data.vehicles.map(vehicle => ({
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          type: vehicle.type,
          plate: vehicle.plate,
          vin: vehicle.vin
        }));
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Erreur lors de la validation des véhicules' },
          { status: 400 }
        );
      }
    }

    // Création du client avec ses véhicules
    const clientData = {
      type: data.type,
      email: data.email,
      phone: data.phone,
      address: data.address,
      ...(data.type === 'company' ? {
        name: data.name,
        siret: data.siret,
        vatNumber: data.vatNumber
      } : {
        firstName: data.firstName,
        lastName: data.lastName
      }),
      ...(vehicleData.length > 0 && {
        vehicles: {
          create: vehicleData
        }
      })
    };

    const newClient = await prisma.client.create({
      data: clientData,
      include: {
        vehicles: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        appointments: true,
        invoices: true,
        quotes: true
      }
    });

    // Transformation des données comme dans le GET
    const transformedClient = {
      ...newClient,
      appointments: newClient.appointments.map(appointment => ({
        ...appointment,
        vehicle: typeof appointment.vehicle === 'string'
          ? JSON.parse(appointment.vehicle)
          : appointment.vehicle
      })),
      documents: [
        ...newClient.invoices.map(invoice => ({
          id: invoice.id,
          type: 'invoice' as const,
          number: invoice.number,
          date: invoice.createdAt,
          totalTTC: invoice.totalTTC,
          status: invoice.status,
          createdAt: invoice.createdAt
        })),
        ...newClient.quotes.map(quote => ({
          id: quote.id,
          type: 'quote' as const,
          number: quote.number,
          date: quote.date,
          totalTTC: quote.totalTTC,
          status: quote.status,
          createdAt: quote.createdAt
        }))
      ].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      fullName: newClient.type === 'company'
        ? newClient.name
        : `${newClient.firstName} ${newClient.lastName}`.trim()
    };

    return NextResponse.json(transformedClient, { status: 201 });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Error creating client:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur lors de la création du client'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Suppression d'un client
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Vérification des rendez-vous en cours
    const clientWithAppointments = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED']
            }
          }
        }
      }
    });

    if (!clientWithAppointments) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Empêcher la suppression si des rendez-vous sont en cours
    if (clientWithAppointments.appointments.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un client ayant des rendez-vous en cours' },
        { status: 400 }
      );
    }

    // Suppression du client (les véhicules seront supprimés automatiquement grâce à la relation onDelete: Cascade)
    await prisma.client.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du client' },
      { status: 500 }
    );
  }
}
// app/api/clients/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ClientType } from '@/types/clients';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        type: true,
        name: true,
        firstName: true,
        lastName: true,
        siret: true,
        vatNumber: true,
        email: true,
        phone: true,
        address: true,
        vehicles: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            type: true,
            plate: true,
            vin: true
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
            createdAt: true
          }
        },
        invoices: {
          select: {
            id: true,
            amount: true,
            status: true,
            dueDate: true,
            items: true,
            createdAt: true
          }
        },
        quotes: {
          select: {
            id: true,
            number: true,
            status: true,
            totalHT: true,
            totalTTC: true,
            createdAt: true
          }
        },
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validation des données communes requises
    if (!data.email || !data.phone || !data.address) {
      return NextResponse.json(
        { error: 'Email, téléphone et adresse sont requis' },
        { status: 400 }
      );
    }

    // Validation selon le type de client
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

    // Création du client
    const clientData = {
      type: data.type as ClientType,
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
      })
    };

    const newClient = await prisma.client.create({
      data: clientData,
      include: {
        vehicles: true,
        appointments: true,
        invoices: true,
        quotes: true
      }
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erreur lors de la création du client'
      },
      { status: 500 }
    );
  }
}

// Pour éviter l'erreur 405
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
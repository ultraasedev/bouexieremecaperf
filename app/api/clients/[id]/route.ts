// app/api/clients/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, phone, address, vehicles } = body;

    // Vérifier si le client existe
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id },
      include: { vehicles: true }
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'email est déjà utilisé par un autre client
    if (email !== existingClient.email) {
      const emailExists = await prisma.client.findFirst({
        where: {
          email,
          NOT: { id: params.id }
        }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé par un autre client' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le client et ses véhicules dans une transaction
    const updatedClient = await prisma.$transaction(async (prisma) => {
      // Supprimer tous les anciens véhicules
      await prisma.vehicle.deleteMany({
        where: { clientId: params.id }
      });

      // Mettre à jour le client avec ses nouveaux véhicules
      const client = await prisma.client.update({
        where: { id: params.id },
        data: {
          name,
          email,
          phone,
          address,
          vehicles: {
            create: vehicles?.map((vehicle: any) => ({
              brand: vehicle.brand,
              model: vehicle.model,
              year: vehicle.year,
              type: vehicle.type,
              plate: vehicle.plate,
              vin: vehicle.vin
            })) || []
          }
        },
        include: {
          vehicles: true,
          appointments: true,
          invoices: true
        }
      });

      return client;
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du client' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.client.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du client' },
      { status: 500 }
    );
  }
}
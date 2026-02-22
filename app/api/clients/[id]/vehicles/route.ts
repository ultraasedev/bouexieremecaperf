// app/api/clients/[Id]/vehicles/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleAuthError } from "@/lib/apiAuth";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const data = await request.json();
    const vehicleData = {
      ...data,
      vin: data.vin || null,
      clientId: params.id
    };

    const newVehicle = await prisma.vehicle.create({
      data: vehicleData
    });

    // Récupérer le client avec toutes ses données
    const updatedClient = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        vehicles: true,
        appointments: true,
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
          }
        }
      }
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error("Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const data = await request.json();
    const { id: vehicleId, ...vehicleData } = data;

    const updatedVehicle = await prisma.vehicle.update({
      where: { 
        id: vehicleId
      },
      data: {
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        type: vehicleData.type,
        plate: vehicleData.plate,
        vin: vehicleData.vin || undefined // Important : utilisez undefined ici
      },
    });

    const transformedClient = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        vehicles: true,
        appointments: true,
        invoices: true,
        quotes: true,
      },
    });

    return NextResponse.json(transformedClient);
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error("Error:", error);
    return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 });
  }
}
/**
 * Gère la suppression d'un véhicule spécifique pour un client **/
export async function DELETE(
  request: Request,
  { params }: { params: { clientId: string; vehicleId: string } }
) {
  try {
    await requireAdmin();

    // Vérifier que le véhicule existe et appartient bien au client
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: params.vehicleId,
        clientId: params.clientId
      }
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    // Supprimer le véhicule
    await prisma.vehicle.delete({
      where: { id: params.vehicleId }
    });

    // Récupérer le client mis à jour avec toutes ses données
    const updatedClient = await prisma.client.findUnique({
      where: { id: params.clientId },
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
            token: true
          }
        },
        invoices: true,
        quotes: true
      }
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error("Erreur lors de la suppression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du véhicule" },
      { status: 500 }
    );
  }
}
// app/api/clients/[Id]/vehicles/[vehicleId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleAuthError } from "@/lib/apiAuth";

export async function DELETE(
  request: Request,
  { params }: { params: { Id: string; vehicleId: string } }
) {
  try {
    await requireAdmin();

    console.log("Tentative de suppression du véhicule", {
      vehicleId: params.vehicleId,
      clientId: params.Id
    });

    // 1. Vérifier que le véhicule existe et appartient au client
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        AND: [
          { id: params.vehicleId },
          { clientId: params.Id }
        ]
      }
    });

    if (!vehicle) {
      console.log("Véhicule non trouvé");
      return NextResponse.json(
        { error: "Véhicule non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    console.log("Véhicule trouvé, suppression en cours");

    // 2. Supprimer le véhicule
    await prisma.vehicle.delete({
      where: {
        id: params.vehicleId
      }
    });

    console.log("Véhicule supprimé, récupération du client mis à jour");

    // 3. Récupérer le client mis à jour
    const updatedClient = await prisma.client.findUnique({
      where: {
        id: params.Id
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
            token: true
          }
        },
        invoices: true,
        quotes: true
      }
    });

    if (!updatedClient) {
      throw new Error("Client non trouvé après suppression");
    }

    console.log("Client mis à jour récupéré avec succès");

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
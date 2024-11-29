// app/api/clients/[clientId]/vehicles/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const data = await request.json();
    const newVehicle = await prisma.vehicle.create({
      data: {
        ...data,
        clientId: params.clientId,
      },
    });

    const updatedClient = await prisma.client.findUnique({
      where: { id: params.clientId },
      include: {
        vehicles: true,
        appointments: true,
        invoices: true,
        quotes: true,
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du véhicule" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const data = await request.json();
    const { id, ...vehicleData } = data;

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: vehicleData,
    });

    const updatedClient = await prisma.client.findUnique({
      where: { id: params.clientId },
      include: {
        vehicles: true,
        appointments: true,
        invoices: true,
        quotes: true,
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du véhicule" },
      { status: 500 }
    );
  }
}
export async function DELETE(
    request: Request,
    { params }: { params: { clientId: string } }
  ) {
    try {
      const url = new URL(request.url);
      const vehicleId = url.pathname.split('/').pop();
  
      await prisma.vehicle.delete({
        where: { 
          id: vehicleId,
          clientId: params.clientId 
        },
      });
  
      // Retourner le client mis à jour
      const updatedClient = await prisma.client.findUnique({
        where: { id: params.clientId },
        include: {
          vehicles: true,
          appointments: true,
          invoices: true,
          quotes: true,
        },
      });
  
      return NextResponse.json(updatedClient);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression du véhicule" },
        { status: 500 }
      );
    }
  }
// app/api/availability/route.ts
import { NextResponse } from "next/server";
import {
  format,
  parseISO,
  isValid,
  isBefore,
  startOfDay,
  addMonths,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation plus stricte des créneaux horaires
const TimeSlotSchema = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Le format de l'heure doit être HH:MM",
  })
  .refine((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return (
      // Matin: 9h-12h
      ((hours >= 9 && hours < 12) ||
        // Après-midi: 14h-21h
        (hours >= 14 && hours <= 21)) &&
      (minutes === 0 || minutes === 30)
    );
  }, "Les créneaux doivent être entre 9h-12h ou 14h-21h, par tranches de 30 minutes");

// Schéma de validation principal
const AvailabilitySchema = z.object({
  date: z
    .string()
    .refine((val) => {
      try {
        const date = new Date(val);
        return isValid(date);
      } catch {
        return false;
      }
    }, "Format de date invalide")
    .refine((val) => {
      const date = new Date(val);
      const today = startOfDay(new Date());
      const maxDate = addMonths(today, 2);
      return !isBefore(date, today) && !isBefore(maxDate, date);
    }, "La date doit être comprise entre aujourd'hui et dans 2 mois"),

  timeSlots: z
    .array(TimeSlotSchema)
    .min(1, "Au moins un créneau horaire doit être sélectionné")
    .max(20, "Trop de créneaux sélectionnés"),
});

// Types
interface AvailabilityResponse {
  [date: string]: {
    timeSlots: string[];
    bookedSlots: string[];
  };
}

// Helpers
const formatDateResponse = (date: Date): string => format(date, "yyyy-MM-dd");

const validateDateParam = (dateStr: string | null): Date | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isValid(date) ? date : null;
};

// Routes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = validateDateParam(searchParams.get("start"));
    const end = validateDateParam(searchParams.get("end"));

    if (!start || !end) {
      return NextResponse.json(
        { error: "Dates invalides ou manquantes" },
        { status: 400 }
      );
    }

    if (isBefore(end, start)) {
      return NextResponse.json(
        { error: "La date de fin doit être après la date de début" },
        { status: 400 }
      );
    }

    const availabilities = await prisma.availability.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    const response: AvailabilityResponse = {};
    for (const availability of availabilities) {
      response[formatDateResponse(availability.date)] = {
        timeSlots: availability.timeSlots as string[],
        bookedSlots: (availability.bookedSlots as string[]) || [],
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des disponibilités" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validation des données
    const validationResult = await AvailabilitySchema.safeParseAsync(data);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { date, timeSlots } = validationResult.data;

    // Récupérons d'abord les bookedSlots existants si disponible
    const existingAvailability = await prisma.availability.findUnique({
      where: {
        date: new Date(date),
      },
    });

    // Tri des créneaux pour assurer l'ordre
    const sortedTimeSlots = [...timeSlots].sort();

    const availability = await prisma.availability.upsert({
      where: {
        date: new Date(date),
      },
      update: {
        timeSlots: sortedTimeSlots,
      },
      create: {
        date: new Date(date),
        timeSlots: sortedTimeSlots,
        bookedSlots: [],
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        date: formatDateResponse(availability.date),
        timeSlots: availability.timeSlots,
        bookedSlots: availability.bookedSlots,
      },
    });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde des disponibilités" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = validateDateParam(searchParams.get("date"));

    if (!date) {
      return NextResponse.json(
        { error: "Date invalide ou manquante" },
        { status: 400 }
      );
    }

    await prisma.availability.delete({
      where: {
        date: date,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Disponibilités supprimées avec succès",
    });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression des disponibilités" },
      { status: 500 }
    );
  }
}

// app/api/company/settings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateCompanySettingsSchema = z.object({
  companyName: z.string().min(1, 'Nom requis'),
  legalForm: z.string().optional(),
  siret: z.string().min(1, 'SIRET requis'),
  address: z.string().min(1, 'Adresse requise'),
  phone: z.string().min(1, 'Téléphone requis'),
  email: z.string().email('Email invalide'),
  website: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankIBAN: z.string().optional().nullable(),
  bankBIC: z.string().optional().nullable(),
  vatRegime: z.string().optional(),
});

export async function GET() {
  try {
    await requireAdmin();

    const settings = await prisma.companySettings.findFirst();

    if (!settings) {
      return NextResponse.json(null);
    }

    return NextResponse.json(settings);
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const rawData = await request.json();

    const validation = updateCompanySettingsSchema.safeParse(rawData);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Upsert : crée si n'existe pas, met à jour sinon
    const existing = await prisma.companySettings.findFirst();

    let settings;
    if (existing) {
      settings = await prisma.companySettings.update({
        where: { id: existing.id },
        data,
      });
    } else {
      settings = await prisma.companySettings.create({
        data: {
          companyName: data.companyName,
          legalForm: data.legalForm || 'Auto-entrepreneur',
          siret: data.siret,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          logo: data.logo,
          bankName: data.bankName,
          bankIBAN: data.bankIBAN,
          bankBIC: data.bankBIC,
          vatRegime: data.vatRegime || 'TVA non applicable, art. 293 B du CGI',
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    );
  }
}

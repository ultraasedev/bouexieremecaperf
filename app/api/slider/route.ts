// app/api/slider/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const images = await prisma.sliderImage.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(images);
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();

    const image = await prisma.sliderImage.create({
      data: {
        title: body.title || null,
        description: body.description || null,
        imageUrl: body.imageUrl,
        order: body.order || 0,
        active: body.active !== false,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// app/api/site-content/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    const where = section ? { section } : {};
    const content = await prisma.siteContent.findMany({ where });

    return NextResponse.json(content);
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();

    // body.items = [{ section, key, value }, ...]
    const items = body.items || [body];

    const results = await Promise.all(
      items.map((item: { section: string; key: string; value: string }) =>
        prisma.siteContent.upsert({
          where: { section_key: { section: item.section, key: item.key } },
          update: { value: item.value },
          create: { section: item.section, key: item.key, value: item.value },
        })
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

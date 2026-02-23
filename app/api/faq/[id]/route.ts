// app/api/faq/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await request.json();

    const faq = await prisma.faq.update({
      where: { id: params.id },
      data: {
        question: body.question,
        answer: body.answer,
        order: body.order,
        published: body.published,
      },
    });

    return NextResponse.json(faq);
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await prisma.faq.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

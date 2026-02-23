// app/api/blog/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await request.json();

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        title: body.title,
        content: body.content,
        slug: body.slug,
        image: body.image || null,
        published: body.published,
      },
    });

    return NextResponse.json(post);
  } catch (error: any) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    await prisma.blogPost.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

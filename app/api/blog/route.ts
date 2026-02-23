// app/api/blog/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, handleAuthError } from '@/lib/apiAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(posts);
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

    if (!body.title || !body.content || !body.slug) {
      return NextResponse.json({ error: 'Titre, contenu et slug requis' }, { status: 400 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        content: body.content,
        slug: body.slug,
        image: body.image || null,
        published: body.published || false,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Ce slug existe déjà' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

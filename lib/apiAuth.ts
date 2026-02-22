// lib/apiAuth.ts
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';
import type { UserPayload } from '@/types/auth';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
};

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

/**
 * Vérifie le JWT et retourne le payload utilisateur.
 * Lance une AuthError si le token est absent ou invalide.
 */
export async function requireAuth(): Promise<UserPayload> {
  const token = cookies().get('auth_token')?.value;

  if (!token) {
    throw new AuthError('Non authentifié');
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    return {
      id: payload.id as string,
      email: payload.email as string | null,
      name: payload.name as string | null,
      role: payload.role as string,
    };
  } catch {
    throw new AuthError('Token invalide ou expiré');
  }
}

/**
 * Vérifie le JWT et que l'utilisateur est admin.
 * Lance une AuthError si non authentifié ou non admin.
 */
export async function requireAdmin(): Promise<UserPayload> {
  const user = await requireAuth();

  if (user.role !== 'admin') {
    throw new AuthError('Accès non autorisé', 403);
  }

  return user;
}

/**
 * Gère les erreurs d'auth et retourne une NextResponse appropriée.
 * Retourne null si l'erreur n'est pas une AuthError.
 */
export function handleAuthError(error: unknown): NextResponse | null {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  return null;
}

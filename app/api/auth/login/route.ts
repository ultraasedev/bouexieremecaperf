// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { UserPayload, JWTPayload } from '@/types/auth';

// Configuration constantes
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'votre-secret-tres-securise'
);

const COOKIE_OPTIONS = {
  name: 'auth_token',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 // 24 heures
};

// Helpers
const createJWT = async (payload: JWTPayload) => {
  return await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
};

const createAuthResponse = (user: UserPayload, token: string) => {
  const response = NextResponse.json({
    success: true,
    user: user
  });

  response.cookies.set({
    ...COOKIE_OPTIONS,
    value: token
  });

  return response;
};

// Routes handlers
export async function POST(request: Request) {
  try {
    // Validation de base des données d'entrée
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email et mot de passe requis' 
        },
        { status: 400 }
      );
    }

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        hashedPassword: true,
        role: true,
      },
    });

    // Vérification de l'existence de l'utilisateur
    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Identifiants invalides' 
        },
        { status: 401 }
      );
    }

    // Vérification du mot de passe
    const isPasswordValid = await compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Identifiants invalides' 
        },
        { status: 401 }
      );
    }

    // Création du payload utilisateur
    const userData: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // Création du JWT payload
    const tokenPayload: JWTPayload = {
      ...userData,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    };

    // Génération du token
    const token = await createJWT(tokenPayload);

    // Retour de la réponse
    return createAuthResponse(userData, token);

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Une erreur est survenue lors de la connexion' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Récupération du token
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_OPTIONS.name)?.value;

    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Non authentifié' 
        },
        { status: 401 }
      );
    }

    // Vérification du token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Construction du payload utilisateur
    const userData: UserPayload = {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string
    };

    // Vérification supplémentaire de l'existence de l'utilisateur
    const userExists = await prisma.user.findUnique({
      where: { id: userData.id },
      select: { id: true }
    });

    if (!userExists) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Utilisateur non trouvé' 
        },
        { status: 401 }
      );
    }

    // Création d'un nouveau token pour prolonger la session
    const newTokenPayload: JWTPayload = {
      ...userData,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    };

    const newToken = await createJWT(newTokenPayload);

    // Retour de la réponse avec le nouveau token
    return createAuthResponse(userData, newToken);

  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Token invalide' 
      },
      { status: 401 }
    );
  }
}

// Route de déconnexion
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Déconnexion réussie'
  });

  response.cookies.delete(COOKIE_OPTIONS.name);

  return response;
}
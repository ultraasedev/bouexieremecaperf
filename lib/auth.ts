// lib/auth.ts
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
  
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-tres-securise';

export async function loginUser(email: string, password: string) {
  // Trouver l'utilisateur
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

  if (!user || !user.hashedPassword) {
    throw new Error('Identifiants invalides');
  }

  // Vérifier le mot de passe
  const isValid = await compare(password, user.hashedPassword);
  if (!isValid) {
    throw new Error('Identifiants invalides');
  }

  // Créer le token
  const token = sign(
    { 
      id: user.id, 
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { token, user: { ...user, hashedPassword: undefined } };
}

export async function verifyAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}
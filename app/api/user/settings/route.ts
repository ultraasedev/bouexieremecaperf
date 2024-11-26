// app/api/user/settings/route.ts
import { NextResponse } from 'next/server';
import { hash, compare } from 'bcryptjs';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'votre-secret-tres-securise'
);

// Récupérer l'utilisateur à partir du token
async function getUserFromToken() {
  const token = cookies().get('auth_token')?.value;
  if (!token) throw new Error('Non authentifié');

  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload;
}

// Route GET pour récupérer les infos de l'utilisateur
export async function GET() {
  try {
    const payload = await getUserFromToken();
    const user = await mongoose.models.User.findById(payload.id)
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des informations' },
      { status: 500 }
    );
  }
}

// Route PATCH pour mettre à jour les infos
export async function PATCH(request: Request) {
  try {
    const payload = await getUserFromToken();
    const data = await request.json();
    const { name, email, phone, address, currentPassword, newPassword } = data;

    const user = await mongoose.models.User.findById(payload.id);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const updates: any = {};

    // Mise à jour des champs basiques
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;

    // Vérification email unique
    if (email && email !== user.email) {
      const existingUser = await mongoose.models.User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé' },
          { status: 400 }
        );
      }
      updates.email = email;
    }

    // Gestion du changement de mot de passe
    if (currentPassword && newPassword) {
      const isValidPassword = await compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Mot de passe actuel incorrect' },
          { status: 400 }
        );
      }
      updates.password = await hash(newPassword, 12);
    }

    // Mise à jour de l'utilisateur
    const updatedUser = await mongoose.models.User.findByIdAndUpdate(
      payload.id,
      updates,
      { new: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

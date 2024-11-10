// pages/api/auth/[...nextauth].ts
'use client';
import NextAuth, { AuthOptions, SessionStrategy } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs'; 

const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Veuillez fournir un email et un mot de passe");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          throw new Error("Aucun utilisateur trouvé ou mot de passe incorrect");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          throw new Error("Mot de passe incorrect");
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as SessionStrategy, // Assurez-vous d'utiliser "jwt" ou "database" ici
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
};

// Utilisez la fonction `NextAuth` avec export const
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
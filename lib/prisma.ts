// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'stdout',
      level: 'error',
    },
    {
      emit: 'stdout',
      level: 'info',
    },
    {
      emit: 'stdout',
      level: 'warn',
    },
  ],
});

if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query' as never, (e: Prisma.QueryEvent) => {
    console.log('Query:', e.query);
    console.log('Params:', e.params);
    console.log('Duration:', e.duration, 'ms');
  });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
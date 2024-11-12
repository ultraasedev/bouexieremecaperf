// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin1234', 12);
  
  const user = await prisma.user.create({
    data: {
      email: 'adt@test.com',
      hashedPassword,
      name: 'Admin',
      role: 'admin',
      phone: '06 61 86 55 43',
    },
  });

  console.log('Utilisateur créé:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
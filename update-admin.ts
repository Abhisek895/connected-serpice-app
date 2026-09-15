import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'sarkarabhisek50@gmail.com';
  const plainPassword = 'Abhisek@123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Update or create the user as a superadmin
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'super_admin',
      plan: 'PREMIUM',
    },
    create: {
      email,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin',
      plan: 'PREMIUM',
    },
  });

  console.log(`✅ User ${user.email} has been updated.`);
  console.log(`- Role: ${user.role}`);
  console.log(`- Password has been set to the requested one.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'sarkarabhisek50@gmail.com' }
  });
  console.log(user ? `User found: ${user.email} | Role: ${user.role}` : 'User not found');
  await prisma.$disconnect();
}
check();

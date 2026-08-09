const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.update({
      where: { email: 'sarkarabhisek50@gmail.com' },
      data: { role: 'super_admin' },
    });
    console.log('Successfully updated role for:', user.email);
  } catch (error) {
    console.error('Failed to update role:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();

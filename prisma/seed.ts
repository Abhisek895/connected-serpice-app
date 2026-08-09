const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const templates = [
    {
      name: "surprise",
      isPremium: true,
      price: 2100, // ₹21
      durationDays: 7,
      isActive: true,
    },
    {
      name: "birthday-wish",
      isPremium: true,
      price: 2100, // ₹21
      durationDays: 7,
      isActive: true,
    },
    {
      name: "nasamajh-lakri",
      isPremium: false,
      price: 0,
      durationDays: 3650, // essentially unlimited
      isActive: true,
    },
    {
      name: "date-planner",
      isPremium: false,
      price: 0,
      durationDays: 3650,
      isActive: true,
    },
    {
      name: "jalpaiguri-planner",
      isPremium: false,
      price: 0,
      durationDays: 3650,
      isActive: true,
    },
  ];

  for (const t of templates) {
    await prisma.theme.upsert({
      where: { name: t.name },
      update: {
        price: t.price,
        durationDays: t.durationDays,
        isPremium: t.isPremium,
        isActive: t.isActive,
      },
      create: t,
    });
  }

  console.log("Database has been seeded with theme pricing! 🚀");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

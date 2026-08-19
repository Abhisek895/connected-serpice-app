import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const templates = [
    {
      name: "she-cant-say-no",
      isPremium: true,
      price: 2500, // ₹25
      durationDays: 7,
      isActive: true,
    },
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
      isPremium: true,
      price: 3400, // ₹34
      durationDays: 7,
      isActive: true,
    },
    {
      name: "date-planner",
      isPremium: true,
      price: 1500, // ₹15
      durationDays: 7,
      isActive: true,
    },
    {
      name: "jalpaiguri-planner",
      isPremium: true,
      price: 1500, // ₹15
      durationDays: 7,
      isActive: true,
    },
  ];

  const coupons = [
    {
      code: "FREE100%",
      discountType: "PERCENTAGE",
      discountValue: 100,
      maxUses: 1000,
      maxUsesPerUser: 1,
      isActive: true,
    },
    {
      code: "FREE1",
      discountType: "PERCENTAGE",
      discountValue: 100,
      maxUses: 1000,
      maxUsesPerUser: 1,
      isActive: true,
    },
    {
      code: "LOVE2026",
      discountType: "PERCENTAGE",
      discountValue: 20,
      maxUses: 500,
      maxUsesPerUser: 3,
      isActive: true,
    },
    {
      code: "SPECIAL50",
      discountType: "PERCENTAGE",
      discountValue: 50,
      maxUses: 500,
      maxUsesPerUser: 1,
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

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  // Seed the GUEST system user — all no-login guest purchases link to this account
  await prisma.user.upsert({
    where: { email: "guest@ourstory.internal" },
    update: {},
    create: {
      email: "guest@ourstory.internal",
      name: "OurStory Guest",
      role: "GUEST",
      plan: "GUEST",
    },
  });

  console.log("Database has been seeded with FREE100% and FREE1 trial coupons! 🚀");
  console.log("GUEST system user seeded! 👤");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

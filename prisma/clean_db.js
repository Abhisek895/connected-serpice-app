const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log("Cleaning database... 🧹");

  // 1. Delete all responses
  await prisma.response.deleteMany({});
  console.log("✓ Responses cleared");

  // 2. Delete all events
  await prisma.event.deleteMany({});
  console.log("✓ Events cleared");

  // 3. Delete all payments
  await prisma.payment.deleteMany({});
  console.log("✓ Payments cleared");

  // 4. Delete all sessions & accounts
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  console.log("✓ Sessions & verification tokens cleared");

  // 5. Delete all users EXCEPT sarkarabhisek50@gmail.com
  await prisma.user.deleteMany({
    where: {
      email: {
        not: "sarkarabhisek50@gmail.com"
      }
    }
  });
  console.log("✓ Test users cleared");

  // 6. Ensure superadmin sarkarabhisek50@gmail.com exists
  const superAdminEmail = "sarkarabhisek50@gmail.com";
  const hashedPassword = await bcrypt.hash("Abhisek@123", 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      name: "Abhisek",
      role: "super_admin",
      plan: "PREMIUM",
      password: hashedPassword,
    },
    create: {
      name: "Abhisek",
      email: superAdminEmail,
      password: hashedPassword,
      role: "super_admin",
      plan: "PREMIUM",
    },
  });
  console.log(`✓ Superadmin verified: ${superAdmin.email} (Role: ${superAdmin.role})`);

  // 7. Reset test coupons, keep official ones
  await prisma.coupon.deleteMany({
    where: {
      code: {
        notIn: ["FREE1", "LOVE2026", "SPECIAL50"]
      }
    }
  });

  // Reset coupon usage counts to 0
  await prisma.coupon.updateMany({
    data: { usedCount: 0 }
  });
  console.log("✓ Coupons reset to official default list");

  console.log("\n🎉 DATABASE IS NOW 100% CLEAN WITH 0 TEST DATA!");
  console.log("Only 1 user remains: sarkarabhisek50@gmail.com (Superadmin)");
}

cleanDatabase()
  .catch((e) => {
    console.error("Clean DB Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

async function main() {
  const responses = await prisma.response.findMany({
    where: { idempotencyKey: null }
  });

  console.log(`Found ${responses.length} responses without idempotencyKey`);

  for (const res of responses) {
    const rawKey = `${res.id}-${res.eventId}-${res.action}-${Date.now()}-${Math.random()}`;
    const idempotencyKey = crypto.createHash("sha256").update(rawKey).digest("hex");
    
    await prisma.response.update({
      where: { id: res.id },
      data: { idempotencyKey }
    });
  }

  console.log("Backfill complete");
}

main().catch(console.error).finally(() => prisma.$disconnect());

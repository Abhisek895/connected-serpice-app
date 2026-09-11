import { prisma } from "@/lib/prisma";

export const GUEST_USER_EMAIL = "guest@ourstory.internal";

/**
 * Returns the GUEST system user, automatically provisioning it on the fly if missing.
 * Guarantees zero "Guest system not configured. Please run: npm run db:seed" runtime errors in production.
 */
export async function getOrCreateGuestUser() {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: GUEST_USER_EMAIL },
    });
    if (existing) return existing;

    return await prisma.user.upsert({
      where: { email: GUEST_USER_EMAIL },
      update: {},
      create: {
        email: GUEST_USER_EMAIL,
        name: "OurStory Guest",
        role: "GUEST",
        plan: "GUEST",
      },
    });
  } catch (error) {
    console.warn("[getOrCreateGuestUser] Upsert race or error, falling back to findUnique:", error);
    const fallback = await prisma.user.findUnique({
      where: { email: GUEST_USER_EMAIL },
    });
    if (fallback) return fallback;
    throw error;
  }
}

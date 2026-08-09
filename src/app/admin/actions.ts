"use server"

import { prisma } from "@/lib/prisma";

export async function getAdminPayments() {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return { success: true, payments };
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return { success: false, error: "Database error" };
  }
}

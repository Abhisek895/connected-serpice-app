"use server"

import { prisma } from "@/lib/prisma"

export async function recordResponseAction(slug: string, action: string, metadata?: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!event) return { success: false, error: "Event not found" };

    const finalAction = metadata ? `${action}|${metadata}` : action;

    await prisma.response.create({
      data: {
        eventId: event.id,
        action: finalAction,
        device: "Desktop/Mobile",
        browser: "Web Browser",
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to record response:", error);
    return { success: false };
  }
}

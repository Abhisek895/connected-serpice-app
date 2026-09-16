"use server"

import { prisma } from "@/lib/prisma"
import { recordResponse } from "@/lib/analytics/recordResponse"

export async function recordResponseAction(slug: string, action: string, metadata?: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!event) return { success: false, error: "Event not found" };

    // Use the new shared server logic instead of raw prisma.create
    // For legacy callers passing metadata as a string, we map it.
    let parsedMetadata = undefined;
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (e) {
        parsedMetadata = { raw: metadata };
      }
    }

    const response = await recordResponse({
      eventId: event.id,
      action: action,
      metadata: parsedMetadata,
      device: "Desktop/Mobile",
      browser: "Web Browser",
    });

    return { success: response.success };
  } catch (error) {
    console.error("Failed to record response:", error);
    return { success: false };
  }
}

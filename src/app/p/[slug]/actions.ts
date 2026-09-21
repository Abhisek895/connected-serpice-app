"use server"

import { prisma } from "@/lib/prisma"
import { recordResponse } from "@/lib/analytics/recordResponse"
import { sendReceiverActionEmail } from "@/lib/email"

export async function recordResponseAction(slug: string, action: string, metadata?: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { slug },
      select: {
        id: true,
        userId: true,
        themeId: true,
        theme: { select: { name: true, title: true } },
        user: { select: { email: true } },
      },
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

    const isNewAction = response.isNew;

    // ── Fire creator notification email (skip VIEWED to avoid spam) ──────────
    const skipActions = ["VIEWED", "STARTED_PLANNING", "PLANNING_COMPLETE"];
    const shouldEmail = !skipActions.includes(action) && response.success && isNewAction;

    if (shouldEmail) {
      // Find creator email: registered user email first, then payment buyerEmail
      let creatorEmail: string | null = event.user?.email ?? null;

      if (!creatorEmail) {
        const payment = await prisma.payment.findFirst({
          where: { fulfillment: { eventId: event.id } },
          select: { buyerEmail: true },
        });
        creatorEmail = payment?.buyerEmail ?? null;
      }

      if (creatorEmail) {
        const demoId = event.theme?.name ?? "surprise";
        const templateTitle = event.theme?.title ?? "Your OurStory";
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://www.ourstories.shop";
        const shareUrl = `${appUrl}/p/${slug}`;

        // Await the email send to ensure Vercel doesn't kill the serverless function before it finishes
        await sendReceiverActionEmail({
          to: creatorEmail,
          demoId,
          templateTitle,
          action,
          metadata: parsedMetadata ?? {},
          shareUrl,
        }).catch((err) => {
          console.warn("[recordResponseAction] Email notification failed:", err);
        });
      }
    }

    return { success: response.success };
  } catch (error) {
    console.error("Failed to record response:", error);
    return { success: false };
  }
}

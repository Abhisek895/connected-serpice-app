import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReceiverActionEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, metadata } = body;

    // Find the event by slug or id
    const event = await prisma.event.findFirst({
      where: {
        OR: [{ slug: id }, { id }],
      },
      select: {
        id: true,
        slug: true,
        user: { select: { email: true } },
        theme: { select: { name: true, title: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    // Build idempotency key per event and client IP so preferences update gracefully
    const rawKey = `${event.id}:${ipAddress}`;
    const idempotencyKey = crypto.createHash("sha256").update(rawKey).digest("hex");

    // ── Check for spam/deduplication ─────────────────────────────────────────
    const existingRecord = await prisma.response.findUnique({
      where: { idempotencyKey },
    });
    const isNewAction = !existingRecord || existingRecord.action !== (action || "ACCEPTED");

    // Upsert response
    const responseRecord = await prisma.response.upsert({
      where: { idempotencyKey },
      update: {
        action: action || "ACCEPTED",
        metadata: metadata || {},
        createdAt: new Date(),
      },
      create: {
        eventId: event.id,
        action: action || "ACCEPTED",
        metadata: metadata || {},
        isHuman: true,
        idempotencyKey,
      },
    });

    // ── Fire creator notification email ──────────────────────────────────────
    const skipActions = ["VIEWED", "STARTED_PLANNING"];
    if (!skipActions.includes(action || "ACCEPTED") && isNewAction) {
      let creatorEmail: string | null = event.user?.email ?? null;

      if (!creatorEmail) {
        const payment = await prisma.payment.findFirst({
          where: { fulfillment: { eventId: event.id } },
          select: { buyerEmail: true },
        });
        creatorEmail = payment?.buyerEmail ?? null;
      }

      if (creatorEmail) {
        const demoId = event.theme?.name ?? "durga-puja";
        const templateTitle = event.theme?.title ?? "Durga Puja Invitation";
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://www.ourstories.shop";
        const shareUrl = `${appUrl}/p/${event.slug ?? id}`;

        await sendReceiverActionEmail({
          to: creatorEmail,
          demoId,
          templateTitle,
          action: action || "ACCEPTED",
          metadata: typeof metadata === "object" ? metadata : {},
          shareUrl,
        }).catch((err) => {
          console.warn("[invitations/respond] Email notification failed:", err);
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: responseRecord,
    });
  } catch (error: any) {
    console.error("Error recording invitation response:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to record response" },
      { status: 500 }
    );
  }
}

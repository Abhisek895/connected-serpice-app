import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

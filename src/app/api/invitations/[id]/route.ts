import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ slug: id }, { id }],
      },
      include: {
        theme: true,
        responses: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    let customData: Record<string, any> = {};
    try {
      customData = event.customData ? JSON.parse(event.customData) : {};
    } catch {}

    // Find the latest substantive response (ACCEPTED or THINKING)
    const substantiveResponse = event.responses.find(
      (r) => r.action === "ACCEPTED" || r.action === "THINKING"
    );

    return NextResponse.json({
      success: true,
      invitation: {
        id: event.id,
        slug: event.slug,
        status: event.status,
        createdAt: event.createdAt,
        customData,
        latestResponse: substantiveResponse
          ? {
              action: substantiveResponse.action,
              metadata: substantiveResponse.metadata,
              createdAt: substantiveResponse.createdAt,
            }
          : null,
        allResponses: event.responses.map((r) => ({
          id: r.id,
          action: r.action,
          metadata: r.metadata,
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching invitation details:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch invitation details" },
      { status: 500 }
    );
  }
}

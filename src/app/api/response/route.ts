import { NextResponse } from "next/server";
import { recordResponse } from "@/lib/analytics/recordResponse";
import { z } from "zod";

// Input validation schema
const responseSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  action: z.string().min(1, "Action is required"),
  device: z.string().optional(),
  browser: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  metadata: z.any().optional(),
  trackingToken: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = responseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error }, { status: 400 });
    }

    // Get IP address from headers to use as fallback identity for idempotency
    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      "unknown-ip";

    const response = await recordResponse({
      ...result.data,
      ipAddress,
    });

    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: response.data }, { status: 200 });
  } catch (error) {
    console.error("API Route Error (POST /api/response):", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processQueueBatch } from "@/lib/cold-email/worker";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || !["super_admin", "admin"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const batchSize = Number(body.batchSize || 10);

    const result = await processQueueBatch(batchSize);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Cold email worker execution error:", err);
    return NextResponse.json({ error: err.message || "Worker error" }, { status: 500 });
  }
}

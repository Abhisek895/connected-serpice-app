import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getColdLogs } from "@/app/admin/cold-email/actions";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session || !["super_admin", "admin"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId") || "all";
    const smtpAccountId = searchParams.get("smtpAccountId") || "all";
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 50);

    const logs = await getColdLogs({ campaignId, smtpAccountId, status, search, page, limit });
    return NextResponse.json({ success: true, ...logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch logs" }, { status: 500 });
  }
}

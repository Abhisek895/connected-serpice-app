import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { displayName } = await req.json();

    if (!displayName || typeof displayName !== "string" || displayName.trim().length < 2) {
      return NextResponse.json({ error: "Display name must be at least 2 characters." }, { status: 400 });
    }

    if (displayName.trim().length > 80) {
      return NextResponse.json({ error: "Display name must be 80 characters or less." }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { name: displayName.trim() },
    });

    return NextResponse.json({ success: true, message: "Profile updated successfully." });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0/O, 1/I)
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a referral code
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true },
    });

    if (user?.referralCode) {
      return NextResponse.json({
        code: user.referralCode,
        url: `${process.env.NEXTAUTH_URL}/?ref=${user.referralCode}`,
      });
    }

    // Generate a unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.user.findUnique({ where: { referralCode: code } });
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    // Save the code
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { referralCode: code },
      select: { referralCode: true },
    });

    return NextResponse.json({
      code: updated.referralCode,
      url: `${process.env.NEXTAUTH_URL}/?ref=${updated.referralCode}`,
    });
  } catch (err) {
    console.error("[referral/generate]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

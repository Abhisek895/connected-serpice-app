import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otp, newPassword } = await req.json();

    if (!otp || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const identifier = `pwd_reset_${session.user.email}`;

    // Find the OTP token
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier,
          token: otp
        }
      }
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Check if expired
    if (new Date() > tokenRecord.expires) {
      // Cleanup expired token
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier, token: otp } }
      });
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword }
    });

    // Delete used OTP
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier, token: otp } }
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });

  } catch (error: any) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

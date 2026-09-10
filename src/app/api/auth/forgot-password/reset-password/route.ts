import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, verification code, and new password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const identifier = `pwd_reset_${cleanEmail}`;

    // Verify OTP record
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier,
        token: cleanOtp,
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check your email and try again." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > tokenRecord.expires) {
      await prisma.verificationToken.deleteMany({
        where: { identifier },
      });
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Confirm user exists
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete used token to prevent any replay
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset! You can now sign in with your new password.",
    });
  } catch (err: any) {
    console.error("Error in reset-password route:", err);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again later." },
      { status: 500 }
    );
  }
}

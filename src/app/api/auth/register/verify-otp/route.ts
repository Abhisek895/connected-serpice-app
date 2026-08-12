import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, otp, refCode } = body;

    if (!email || !password || !otp) {
      return NextResponse.json(
        { error: "Email, password, and OTP are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const identifier = `reg_otp_${cleanEmail}`;

    // Verify OTP in VerificationToken table
    const record = await prisma.verificationToken.findFirst({
      where: {
        identifier,
        token: otp.trim(),
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid OTP code. Please check your email and try again." },
        { status: 400 }
      );
    }

    if (new Date() > record.expires) {
      // Delete expired token
      await prisma.verificationToken.deleteMany({ where: { identifier } });
      return NextResponse.json(
        { error: "OTP has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Check if user exists (edge case concurrent creation)
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Look up referrer if refCode is provided
    let referredById: string | undefined = undefined;
    if (refCode && typeof refCode === "string") {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: refCode.trim() },
        select: { id: true },
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    // Hash password & create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: name?.trim() || cleanEmail.split("@")[0],
        plan: "FREE",
        ...(referredById ? { referredById } : {}),
      },
    });

    // Delete used verification token
    await prisma.verificationToken.deleteMany({ where: { identifier } });

    return NextResponse.json(
      {
        success: true,
        message: "Account verified & created successfully!",
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error verifying registration OTP:", err);
    return NextResponse.json(
      { error: "Failed to verify account. Please try again." },
      { status: 500 }
    );
  }
}

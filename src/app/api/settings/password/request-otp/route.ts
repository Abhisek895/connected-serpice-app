import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }

    // Verify current password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || !user.email || !user.password) {
      return NextResponse.json({ error: "User or valid email not found" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const identifier = `pwd_reset_${user.email}`;

    // Clear any existing OTPs for this user's password reset
    await prisma.verificationToken.deleteMany({
      where: { identifier }
    });

    // Save the new OTP
    // Expires in 10 minutes
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: otp,
        expires
      }
    });

    // Send email using real SMTP
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Updated to match user's .env
      },
    });

    const fromName = process.env.SMTP_FROM_NAME || "OurStory Security";
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: user.email,
      subject: "Your OTP for Password Reset",
      text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-w: 400px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 12px; text-align: center;">
          <h2 style="color: #333;">Password Reset</h2>
          <p style="color: #555;">Use the following OTP to reset your password. It is valid for 10 minutes.</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px; padding: 10px; background: #f4f4f5; color: #e11d48; border-radius: 8px;">
            ${otp}
          </div>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: "OTP sent successfully"
    });

  } catch (error: any) {
    console.error("OTP request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

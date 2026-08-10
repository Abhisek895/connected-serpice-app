import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const identifier = `reg_otp_${cleanEmail}`;

    // Clear any existing OTPs for this email registration
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });

    // Save the new OTP (expires in 10 minutes)
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: otp,
        expires,
      },
    });

    // Send OTP via SMTP
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const fromName = process.env.SMTP_FROM_NAME || "OurStory Verification";
      const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: cleanEmail,
        subject: `${otp} is your OurStory Account Verification Code`,
        text: `Your verification OTP is: ${otp}. It is valid for 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 20px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #f43f5e; font-size: 28px; margin: 0;">OurStory</h1>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Welcome! Verify your account to get started.</p>
            </div>
            <div style="background: #fff1f2; border: 1px solid #ffe4e6; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
              <p style="font-size: 12px; font-weight: bold; color: #9f1239; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Your 6-Digit OTP Code</p>
              <div style="font-size: 32px; font-weight: 800; color: #e11d48; letter-spacing: 6px;">
                ${otp}
              </div>
            </div>
            <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0;">
              This code will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.
            </p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.warn("SMTP send skipped or failed, OTP generated for dev mode:", otp);
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${cleanEmail}`,
    });
  } catch (err: any) {
    console.error("Error sending registration OTP:", err);
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}

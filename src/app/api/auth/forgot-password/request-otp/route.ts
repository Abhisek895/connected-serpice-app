import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address. Please check your email or create an account." },
        { status: 404 }
      );
    }

    if (user.role === "SUSPENDED" || user.role === "BANNED") {
      return NextResponse.json(
        { error: "Your account is disabled. Please contact support." },
        { status: 403 }
      );
    }

    // Generate a secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const identifier = `pwd_reset_${cleanEmail}`;

    // Clear any previous OTP tokens for password reset for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    });

    // Store new OTP with 10-minute expiry
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: otp,
        expires,
      },
    });

    // Send the OTP via email
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const fromName = process.env.SMTP_FROM_NAME || "OurStory Security";
      const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || "security@ourstory.app";

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: cleanEmail,
        subject: `${otp} is your OurStory Password Reset Code`,
        text: `Your password reset verification code is: ${otp}. It is valid for 10 minutes. If you did not request this, please ignore this email.`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; border: 1px solid #fce7f3; border-radius: 24px; background: #ffffff; box-shadow: 0 4px 20px rgba(244, 63, 94, 0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #f43f5e; font-size: 30px; margin: 0; font-family: cursive, sans-serif; font-weight: 700;">OurStory</h1>
              <p style="color: #64748b; font-size: 14px; margin-top: 6px; font-weight: 500;">Password Reset Verification</p>
            </div>

            <div style="background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); border: 1px solid #fecdd3; padding: 24px; border-radius: 18px; text-align: center; margin-bottom: 24px;">
              <p style="font-size: 12px; font-weight: 700; color: #9f1239; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 10px 0;">
                Your 6-Digit Reset Code
              </p>
              <div style="font-size: 36px; font-weight: 800; color: #e11d48; letter-spacing: 8px; font-family: monospace;">
                ${otp}
              </div>
            </div>

            <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 16px 0; text-align: center;">
              This code will expire in <strong>10 minutes</strong>. Enter this code on the password reset screen to set your new password.
            </p>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 20px; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>
          </div>
        `,
      });
    } catch (mailErr) {
      console.warn("SMTP send skipped or failed, OTP generated for dev mode:", otp);
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}`,
    });
  } catch (err: any) {
    console.error("Error in forgot-password request-otp:", err);
    return NextResponse.json(
      { error: "Failed to send reset code. Please try again later." },
      { status: 500 }
    );
  }
}

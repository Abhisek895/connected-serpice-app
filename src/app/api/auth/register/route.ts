import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, refCode } = body;

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
      where: { email: cleanEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Look up referrer if refCode is provided
    let referredById: string | undefined = undefined;
    if (refCode && typeof refCode === "string") {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: refCode.trim() },
        select: { id: true }
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Database / Prisma
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: name?.trim() || cleanEmail.split("@")[0],
        plan: "FREE",
        ...(referredById ? { referredById } : {})
      }
    });

    return NextResponse.json(
      { 
        message: "Account created successfully", 
        user: { id: newUser.id, email: newUser.email, name: newUser.name } 
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in account registration:", err);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}

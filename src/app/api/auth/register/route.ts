import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
      where: { email: cleanEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in MySQL / Prisma
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: name?.trim() || cleanEmail.split("@")[0],
        plan: "FREE"
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

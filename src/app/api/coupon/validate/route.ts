import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, demoId } = await req.json();

    if (!code) {
      return NextResponse.json({ valid: false, message: "No code provided" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, message: "Invalid coupon code" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, message: "This coupon is no longer active" }, { status: 400 });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ valid: false, message: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, message: "Coupon usage limit reached" }, { status: 400 });
    }

    // We fetch the theme to get the original price if demoId is provided
    let finalPrice = null;
    let originalPrice = null;

    if (demoId) {
      const theme = await prisma.theme.findUnique({
        where: { name: demoId },
      });
      
      if (theme) {
        originalPrice = theme.price;
        if (coupon.discountType === "PERCENT") {
          const discount = Math.floor((originalPrice * coupon.discountValue) / 100);
          finalPrice = Math.max(0, originalPrice - discount);
        } else {
          finalPrice = Math.max(0, originalPrice - coupon.discountValue);
        }
      }
    }

    return NextResponse.json({
      valid: true,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      originalPrice,
      finalPrice,
      message: "Coupon applied successfully!"
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ valid: false, message: "Internal server error" }, { status: 500 });
  }
}

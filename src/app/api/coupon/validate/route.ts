import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { code, demoId } = await req.json();
    const { userId } = await getCurrentUser();

    if (!code) {
      return NextResponse.json({ valid: false, message: "No code provided" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: cleanCode,
      },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, message: `Invalid coupon code: "${cleanCode}"` }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, message: "This coupon is no longer active" }, { status: 400 });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ valid: false, message: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, message: "Coupon overall usage limit reached" }, { status: 400 });
    }

    // Enforce per-account usage limit (maxUsesPerUser)
    if (coupon.maxUsesPerUser && userId) {
      const isTrialCoupon = ["FREE100%", "FREE100", "FREE1"].includes(cleanCode);
      const userUsesCount = await prisma.payment.count({
        where: {
          userId,
          status: "SUCCESS",
          OR: [
            { couponId: coupon.id },
            ...(isTrialCoupon ? [{ plan: "1_DAY_FREE_PASS" }] : [])
          ]
        }
      });

      if (userUsesCount >= coupon.maxUsesPerUser) {
        return NextResponse.json({
          valid: false,
          message: `You have reached the limit of ${coupon.maxUsesPerUser} use(s) per account for coupon ${coupon.code}.`
        }, { status: 400 });
      }
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
        if (coupon.discountType === "PERCENT" || coupon.discountType === "PERCENTAGE") {
          const discount = Math.floor((originalPrice * coupon.discountValue) / 100);
          finalPrice = Math.max(0, originalPrice - discount);
        } else {
          // FIXED discount: handle paise or INR unit conversion
          const fixedDiscountPaise = coupon.discountValue < 500 ? coupon.discountValue * 100 : coupon.discountValue;
          finalPrice = Math.max(0, originalPrice - fixedDiscountPaise);
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

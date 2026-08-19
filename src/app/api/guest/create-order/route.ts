import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRazorpay, hasValidRazorpayKeys } from "@/lib/razorpay";

/**
 * POST /api/guest/create-order
 *
 * No authentication required — for ad-landing guest flows.
 * All payments are linked to the GUEST system user.
 * UTM params (source, campaign) are encoded in the `plan` field.
 */
export async function POST(req: Request) {
  try {
    const {
      demoId,
      couponCode,
      utmSource,   // e.g. "instagram"
      utmCampaign, // e.g. "reel"
    } = await req.json();

    if (!demoId) {
      return NextResponse.json({ success: false, message: "Missing demoId" }, { status: 400 });
    }

    // Find the GUEST system user
    const guestUser = await prisma.user.findUnique({
      where: { email: "guest@ourstory.internal" },
    });

    if (!guestUser) {
      return NextResponse.json(
        { success: false, message: "Guest system not configured. Please run: npm run db:seed" },
        { status: 500 }
      );
    }

    // Find the template/theme
    let theme = await prisma.theme.findUnique({ where: { name: demoId } });
    if (!theme) {
      return NextResponse.json({ success: false, message: "Template not found" }, { status: 404 });
    }

    let finalAmount = theme.price;
    let couponId: string | null = null;
    const cleanCode = couponCode ? couponCode.trim().toUpperCase() : "";

    // Apply coupon if provided
    if (cleanCode && finalAmount > 0) {
      const coupon = await prisma.coupon.findFirst({ where: { code: cleanCode } });
      if (
        coupon &&
        coupon.isActive &&
        (!coupon.expiresAt || new Date() <= coupon.expiresAt) &&
        (!coupon.maxUses || coupon.usedCount < coupon.maxUses)
      ) {
        couponId = coupon.id;
        if (coupon.discountType === "PERCENT" || coupon.discountType === "PERCENTAGE") {
          finalAmount = Math.max(0, finalAmount - Math.floor((finalAmount * coupon.discountValue) / 100));
        } else {
          const fixedDiscountPaise = coupon.discountValue < 500 ? coupon.discountValue * 100 : coupon.discountValue;
          finalAmount = Math.max(0, finalAmount - fixedDiscountPaise);
        }
      }
    }

    // Build source label for payment plan tracking
    const sourceLabel = [
      "GUEST",
      utmSource ? utmSource.toUpperCase().replace(/[^A-Z0-9]/g, "_") : "",
      utmCampaign ? utmCampaign.toUpperCase().replace(/[^A-Z0-9]/g, "_") : "",
    ]
      .filter(Boolean)
      .join("_"); // e.g. "GUEST_INSTAGRAM_REEL"

    // Handle free / coupon-zeroed orders
    if (finalAmount === 0) {
      const orderId = `guest_free_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      await prisma.payment.create({
        data: {
          userId: guestUser.id,
          razorpayOrderId: orderId,
          amount: theme.price,
          finalAmount: 0,
          currency: "INR",
          status: "SUCCESS",
          plan: sourceLabel || "GUEST_FREE",
          demoId: theme.name,
          couponId,
        },
      });

      if (couponId) {
        await prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
      }

      return NextResponse.json({ success: true, amount: 0, orderId: "FREE" });
    }

    // Create Razorpay order
    const validKeys = hasValidRazorpayKeys();
    let orderId = `guest_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let isMock = false;

    if (validKeys) {
      try {
        const razorpay = getRazorpay();
        const order = await razorpay.orders.create({
          amount: finalAmount,
          currency: "INR",
          receipt: `guest_${demoId}_${Date.now()}`,
        });
        if (order?.id) {
          orderId = order.id;
        } else {
          isMock = true;
        }
      } catch (err: any) {
        console.warn("[Razorpay Guest Fallback to Mock]", err.message);
        isMock = true;
      }
    } else {
      isMock = true;
    }

    // Pre-create payment record under GUEST user
    await prisma.payment.create({
      data: {
        userId: guestUser.id,
        razorpayOrderId: orderId,
        amount: theme.price,
        finalAmount,
        currency: "INR",
        status: "PENDING",
        plan: sourceLabel || "GUEST_PURCHASE",
        demoId: theme.name,
        couponId,
      },
    });

    return NextResponse.json({
      success: true,
      orderId,
      amount: finalAmount,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_mockkey",
      isMock,
    });
  } catch (error: any) {
    console.error("Guest create-order error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal error" }, { status: 500 });
  }
}

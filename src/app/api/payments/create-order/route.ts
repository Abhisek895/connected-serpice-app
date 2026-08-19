import { NextRequest, NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma"; // Assuming standard prisma location
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Update if auth logic is elsewhere

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { themeId, couponCode, demoId } = await req.json();

    if (!themeId) {
      return NextResponse.json({ error: "Theme ID is required" }, { status: 400 });
    }

    // 1. Fetch the Theme
    const theme = await prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!theme || !theme.isActive) {
      return NextResponse.json({ error: "Invalid or inactive theme" }, { status: 404 });
    }

    let finalAmount = theme.price;
    let validCouponId = null;

    // 2. Process Coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (
        coupon &&
        coupon.isActive &&
        (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) &&
        (!coupon.maxUses || coupon.usedCount < coupon.maxUses)
      ) {
        validCouponId = coupon.id;
        if (coupon.discountType === "FIXED") {
          finalAmount = Math.max(0, finalAmount - coupon.discountValue);
        } else if (coupon.discountType === "PERCENTAGE") {
          finalAmount = Math.max(0, finalAmount - (finalAmount * coupon.discountValue) / 100);
        }
      } else {
        return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 400 });
      }
    }

    // Razorpay expects amount in subunits (paise for INR)
    // If the DB price is already in paise, skip this. Assuming DB stores Rs.
    const amountInPaise = finalAmount * 100;

    // 3. Create Razorpay Order or Mock Order
    let orderId = `mock_order_${Date.now()}`;
    let isMock = false;

    // Check if we have valid Razorpay keys (not the placeholder spaces)
    const hasValidKeys = process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_SECRET.includes(" ");

    if (hasValidKeys) {
      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          themeId: theme.id,
          userId: session.user.id,
          demoId: demoId || "",
        },
      };

      const razorpay = getRazorpay();
      const order = await razorpay.orders.create(options);
      if (!order) {
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
      }
      orderId = order.id;
    } else {
      isMock = true;
      console.log("No valid Razorpay keys found. Falling back to MOCK payment mode.");
    }

    // 4. Save Payment Record in DB
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        razorpayOrderId: orderId,
        amount: finalAmount, // Store actual unit amount
        finalAmount: finalAmount,
        currency: "INR",
        status: "PENDING",
        plan: theme.name,
        couponId: validCouponId,
        demoId: demoId,
      },
    });

    return NextResponse.json({
      orderId,
      amount: amountInPaise,
      currency: "INR",
      isMock
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

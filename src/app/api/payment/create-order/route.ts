import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { userId } = await getCurrentUser();
    
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { demoId, couponCode } = await req.json();

    if (!demoId) {
      return NextResponse.json({ success: false, message: "Missing demoId" }, { status: 400 });
    }

    const theme = await prisma.theme.findUnique({
      where: { name: demoId },
    });

    if (!theme) {
      return NextResponse.json({ success: false, message: "Template not found" }, { status: 404 });
    }

    let finalAmount = theme.price;
    let couponId = null;

    // Apply coupon if provided
    if (couponCode && finalAmount > 0) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && (!coupon.expiresAt || new Date() <= coupon.expiresAt) && (!coupon.maxUses || coupon.usedCount < coupon.maxUses)) {
        couponId = coupon.id;
        if (coupon.discountType === "PERCENT") {
          const discount = Math.floor((finalAmount * coupon.discountValue) / 100);
          finalAmount = Math.max(0, finalAmount - discount);
        } else {
          finalAmount = Math.max(0, finalAmount - coupon.discountValue);
        }
      }
    }

    if (finalAmount === 0) {
      // Free template or fully discounted, no Razorpay needed
      return NextResponse.json({ success: true, amount: 0, orderId: "FREE" });
    }

    // Check if keys are properly configured
    const hasValidKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_SECRET.includes(" ");

    let orderId = `mock_order_${Date.now()}`;
    let isMock = false;

    if (hasValidKeys) {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID as string,
        key_secret: process.env.RAZORPAY_KEY_SECRET as string,
      });

      const orderOptions = {
        amount: finalAmount, // in paise
        currency: "INR",
        receipt: `rcpt_${userId}_${Date.now()}`,
      };

      const order = await razorpay.orders.create(orderOptions);
      orderId = order.id;
    } else {
      isMock = true;
      console.log("No valid Razorpay keys found. Falling back to MOCK payment mode.");
    }

    // Pre-create the payment record
    await prisma.payment.create({
      data: {
        userId,
        razorpayOrderId: orderId,
        amount: theme.price, // original amount
        finalAmount: finalAmount,
        currency: "INR",
        status: "PENDING",
        plan: "TEMPLATE_PURCHASE",
        demoId,
        couponId,
      }
    });

    return NextResponse.json({
      success: true,
      orderId,
      amount: finalAmount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || "mock_key",
      isMock
    });

  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal error" }, { status: 500 });
  }
}

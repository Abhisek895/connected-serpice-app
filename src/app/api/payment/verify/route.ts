import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { creditReferrer } from "@/lib/referral";

export async function POST(req: Request) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, demoId, couponCode } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ success: false, message: "Missing payment details" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const isMock = razorpayOrderId.startsWith("mock_order_") && razorpaySignature === "mock_signature_for_development";

    if (!isMock) {
      if (!secret) {
        return NextResponse.json({ success: false, message: "Payment gateway not configured" }, { status: 500 });
      }

      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto.createHmac("sha256", secret).update(body.toString()).digest("hex");

      if (expectedSignature !== razorpaySignature) {
        // Signature mismatch
        await prisma.payment.update({
          where: { razorpayOrderId },
          data: { status: "FAILED" }
        });
        return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
      }
    }

    // Mark payment as successful
    const payment = await prisma.payment.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        status: "SUCCESS"
      },
      include: { coupon: true }
    });

    // Increment coupon usage if a coupon was applied
    if (payment.couponId) {
      await prisma.coupon.update({
        where: { id: payment.couponId },
        data: { usedCount: { increment: 1 } }
      });
    }

    // ─── INSTANT REFERRAL CREDIT ENGINE ──────────────────────────────────────
    // Credit the referrer's wallet immediately when a referred user pays.
    // Idempotent: checks if a credit already exists for this payment or buyer.
    try {
      await creditReferrer(payment as any);
    } catch (err) {
      console.error("[referral-credit] Failed to credit referrer:", err);
    }
    // ─────────────────────────────────────────────────────────────────────────

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal error" }, { status: 500 });
  }
}

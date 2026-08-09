import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 });
    }

    // 1. Verify Signature securely (Skip if mock)
    const isMock = razorpay_order_id.startsWith("mock_order_") && razorpay_signature === "mock_signature_for_development";
    let isValid = false;
    
    if (isMock) {
      isValid = true;
    } else {
      isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Fetch the payment record
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    if (payment.status === "SUCCESS") {
      return NextResponse.json({ message: "Payment already verified" });
    }

    // 3. Update Payment Status in DB
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    // 4. Fulfillment Logic
    // If there's a coupon, increment its usage
    if (payment.couponId) {
      await prisma.coupon.update({
        where: { id: payment.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Optional: Attach theme to user or demo via demoId
    if (payment.demoId) {
      // example: mark demo as paid/premium
      // await prisma.demo.update({ where: { id: payment.demoId }, data: { isPremium: true } });
    }

    return NextResponse.json({ message: "Payment verified successfully", success: true });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

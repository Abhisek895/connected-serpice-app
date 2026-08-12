import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

const REFERRAL_REWARD_PAISE = 50000; // ₹500 per successful referral

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

    // 4. Fulfillment Logic — Coupon usage
    if (payment.couponId) {
      await prisma.coupon.update({
        where: { id: payment.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // 5. ─── REFERRAL REWARD ENGINE ──────────────────────────────────────────
    // Check if referral system is enabled & get configured reward amount
    const enabledSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_enabled" } });
    const isReferralEnabled = enabledSetting?.value !== "false";

    if (isReferralEnabled) {
      const rewardSetting = await prisma.systemSetting.findUnique({ where: { key: "referral_reward_amount" } });
      const rewardINR = rewardSetting?.value ? parseInt(rewardSetting.value, 10) : 500;
      const rewardPaise = rewardINR * 100;

      // Only trigger on payer's FIRST successful payment
      const payerSuccessfulPayments = await prisma.payment.count({
        where: { userId: payment.userId, status: "SUCCESS" },
      });

      if (payerSuccessfulPayments === 1) {
        const payer = await prisma.user.findUnique({
          where: { id: payment.userId },
          select: { referredById: true, email: true },
        });

        // Credit referrer if payer was referred (and it's not a self-referral)
        if (payer?.referredById && payer.referredById !== payment.userId) {
          await prisma.$transaction([
            prisma.user.update({
              where: { id: payer.referredById },
              data: { walletBalance: { increment: rewardPaise } },
            }),
            prisma.walletTransaction.create({
              data: {
                userId: payer.referredById,
                type: "REFERRAL_EARNED",
                amount: rewardPaise,
                description: `Referral reward — your friend ${payer.email?.split("@")[0] || "someone"} made their first purchase! 🎉 (₹${rewardINR})`,
                referenceId: payment.id,
                status: "COMPLETED",
              },
            }),
          ]);
          console.log(`[REFERRAL REWARD] Credited ₹${rewardINR} to referrer ${payer.referredById} for referring ${payer.email}`);
        }
      }
    }
    // ───────────────────────────────────────────────────────────────────────────

    return NextResponse.json({ message: "Payment verified successfully", success: true });
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

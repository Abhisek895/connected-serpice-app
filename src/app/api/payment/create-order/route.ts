import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getRazorpay, hasValidRazorpayKeys } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const { userId } = await getCurrentUser();

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { demoId, themeId, couponCode, useWallet } = await req.json();
    const targetDemoId = demoId || themeId;

    if (!targetDemoId) {
      return NextResponse.json({ success: false, message: "Missing demoId" }, { status: 400 });
    }

    let theme = await prisma.theme.findUnique({
      where: { name: targetDemoId },
    });

    if (!theme) {
      theme = await prisma.theme.findUnique({
        where: { id: targetDemoId },
      });
    }

    if (!theme) {
      return NextResponse.json({ success: false, message: "Template not found" }, { status: 404 });
    }

    let finalAmount = theme.price;
    let couponId = null;
    const cleanCode = couponCode ? couponCode.trim().toUpperCase() : "";

    // Apply coupon if provided
    if (cleanCode && finalAmount > 0) {
      const coupon = await prisma.coupon.findFirst({ where: { code: cleanCode } });
      if (coupon && coupon.isActive && (!coupon.expiresAt || new Date() <= coupon.expiresAt) && (!coupon.maxUses || coupon.usedCount < coupon.maxUses)) {
        couponId = coupon.id;
        if (coupon.discountType === "PERCENT" || coupon.discountType === "PERCENTAGE") {
          const discount = Math.floor((finalAmount * coupon.discountValue) / 100);
          finalAmount = Math.max(0, finalAmount - discount);
        } else {
          const fixedDiscountPaise = coupon.discountValue < 500 ? coupon.discountValue * 100 : coupon.discountValue;
          finalAmount = Math.max(0, finalAmount - fixedDiscountPaise);
        }
      }
    }

    // Ensure user exists in DB
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return NextResponse.json({ success: false, message: "User account not found. Please sign in again." }, { status: 401 });
    }

    const isPremiumUser = existingUser.plan === "PREMIUM" || existingUser.role === "super_admin";
    if (isPremiumUser) {
      finalAmount = 0;
    }

    // ─── WALLET BALANCE DEDUCTION ENGINE ──────────────────────────────────────
    let walletDeductedPaise = 0;
    if (useWallet && !isPremiumUser && finalAmount > 0 && existingUser.walletBalance > 0) {
      walletDeductedPaise = Math.min(existingUser.walletBalance, finalAmount);
      finalAmount = Math.max(0, finalAmount - walletDeductedPaise);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { walletBalance: { decrement: walletDeductedPaise } },
        }),
        prisma.walletTransaction.create({
          data: {
            userId,
            type: "TEMPLATE_PURCHASE",
            amount: -walletDeductedPaise,
            description: `Used wallet balance for ${theme.name || targetDemoId}`,
            status: "COMPLETED",
          },
        }),
      ]);
    }

    if (couponId) {
      const existingCoupon = await prisma.coupon.findUnique({ where: { id: couponId } });
      if (!existingCoupon) {
        couponId = null;
      }
    }

    if (finalAmount === 0) {
      const planName = walletDeductedPaise > 0
        ? "WALLET_TEMPLATE_PURCHASE"
        : ["FREE100%", "FREE100", "FREE1"].includes(cleanCode)
        ? "1_DAY_FREE_PASS"
        : "DISCOUNTED_TEMPLATE_PURCHASE";

      const orderId = `free_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      await prisma.payment.create({
        data: {
          userId,
          razorpayOrderId: orderId,
          amount: theme.price,
          finalAmount: 0,
          currency: "INR",
          status: "SUCCESS",
          plan: planName,
          demoId: theme.name,
          couponId,
        }
      });

      if (couponId) {
        await prisma.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } }
        });
      }

      return NextResponse.json({
        success: true,
        amount: 0,
        orderId: "FREE",
        walletDeducted: walletDeductedPaise,
      });
    }

    // Check if keys are properly configured (not placeholders)
    const validKeys = hasValidRazorpayKeys();

    let orderId = `mock_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let isMock = false;

    if (validKeys) {
      try {
        const orderOptions = {
          amount: finalAmount, // in paise
          currency: "INR",
          receipt: `rcpt_${userId}_${Date.now()}`,
        };

        const razorpay = getRazorpay();
        const order = await razorpay.orders.create(orderOptions);
        if (order && order.id) {
          orderId = order.id;
        } else {
          isMock = true;
        }
      } catch (rzpErr: any) {
        console.warn("[Razorpay API Fallback to Mock]", rzpErr.message || rzpErr);
        isMock = true;
      }
    } else {
      isMock = true;
      console.log("[DEV MODE] No valid Razorpay keys found. Falling back to MOCK payment mode.");
    }

    // Pre-create payment record
    await prisma.payment.create({
      data: {
        userId,
        razorpayOrderId: orderId,
        amount: theme.price,
        finalAmount: finalAmount,
        currency: "INR",
        status: "PENDING",
        plan: "TEMPLATE_PURCHASE",
        demoId: theme.name,
        couponId,
      }
    });

    return NextResponse.json({
      success: true,
      orderId,
      amount: finalAmount,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_mockkey",
      isMock
    });

  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal error" }, { status: 500 });
  }
}

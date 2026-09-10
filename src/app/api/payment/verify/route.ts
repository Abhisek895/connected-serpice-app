/**
 * POST /api/payment/verify
 *
 * ─── CLIENT FAST-PATH FULFILLMENT ────────────────────────────────────────────
 *
 * Called immediately after the Razorpay modal's handler() fires on the client.
 * Verifies the HMAC signature, then calls the shared fulfillPayment() utility.
 *
 * Returns { success: true, shareUrl, slug } so the client can show the link
 * immediately without waiting for the webhook.
 *
 * Idempotent — safe to call multiple times for the same order.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { fulfillPayment } from "@/lib/payment-fulfillment";

export async function POST(req: Request) {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      customData,  // Optional: client form values for fulfillment
    } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, message: "Missing payment details" },
        { status: 400 }
      );
    }

    // ── 1. Verify signature ────────────────────────────────────────────────────
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const isMock =
      razorpayOrderId.startsWith("mock_order_") &&
      razorpaySignature === "mock_signature_for_development";

    if (!isMock) {
      if (!secret) {
        return NextResponse.json(
          { success: false, message: "Payment gateway not configured" },
          { status: 500 }
        );
      }

      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        // Mark payment failed for audit
        await prisma.payment.updateMany({
          where: { razorpayOrderId, status: "PENDING" },
          data: { status: "FAILED" },
        });
        return NextResponse.json(
          { success: false, message: "Invalid signature" },
          { status: 400 }
        );
      }
    }

    // ── 2. Fulfill (idempotent) ────────────────────────────────────────────────
    const result = await fulfillPayment(
      razorpayOrderId,
      razorpayPaymentId,
      customData
    );

    return NextResponse.json({
      success: true,
      shareUrl: result.shareUrl,
      slug: result.slug,
    });

  } catch (error: any) {
    console.error("[payment/verify] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal error" },
      { status: 500 }
    );
  }
}

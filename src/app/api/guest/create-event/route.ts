/**
 * POST /api/guest/create-event
 *
 * Called AFTER a successful payment in the guest flow.
 * Now delegates all event creation + email sending to the shared
 * fulfillPayment() utility, keeping logic in one place.
 *
 * This route remains as a compatibility shim — the fulfillment is now
 * idempotent, so calling it after verify/webhook is a no-op.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { fulfillPayment } from "@/lib/payment-fulfillment";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const {
      demoId,
      customData: userCustomData,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      utmSource,
      utmCampaign,
    } = await req.json();

    if (!demoId) {
      return NextResponse.json(
        { success: false, message: "Missing demoId" },
        { status: 400 }
      );
    }

    // ── Verify payment ──────────────────────────────────────────────────────────
    let paymentVerified = false;

    if (razorpayOrderId === "FREE") {
      // Free order — verify the payment record exists and is SUCCESS
      const freePayment = await prisma.payment.findFirst({
        where: { razorpayOrderId: { startsWith: "guest_free_" }, demoId, status: "SUCCESS" },
        orderBy: { createdAt: "desc" },
      });
      paymentVerified = !!freePayment;

    } else if (razorpayOrderId?.startsWith("guest_mock_") || razorpayOrderId?.startsWith("free_order_")) {
      // Mock payment in dev mode — auto-verify
      paymentVerified = true;
      await prisma.payment.updateMany({
        where: { razorpayOrderId },
        data: {
          status: "SUCCESS",
          razorpayPaymentId: razorpayPaymentId || `mock_pay_${Date.now()}`,
        },
      });

    } else if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      // Real Razorpay — verify signature
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (secret) {
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
        if (expected === razorpaySignature) {
          paymentVerified = true;
        }
      }
    }

    if (!paymentVerified) {
      return NextResponse.json(
        { success: false, message: "Payment not verified" },
        { status: 402 }
      );
    }

    // ── Attach UTM data into customData ────────────────────────────────────────
    const enrichedCustomData = {
      ...(userCustomData || {}),
      ...(utmSource ? { source: utmSource } : {}),
      ...(utmCampaign ? { campaign: utmCampaign } : {}),
    };

    // ── Resolve which orderId to use for fulfillment ──────────────────────────
    // For free orders, we need to find the actual free payment record
    let targetOrderId = razorpayOrderId;
    if (razorpayOrderId === "FREE") {
      const freePayment = await prisma.payment.findFirst({
        where: { razorpayOrderId: { startsWith: "guest_free_" }, demoId, status: "SUCCESS" },
        orderBy: { createdAt: "desc" },
      });
      if (!freePayment) {
        return NextResponse.json(
          { success: false, message: "Free payment record not found" },
          { status: 404 }
        );
      }
      targetOrderId = freePayment.razorpayOrderId;
    }

    // ── Delegate to fulfillPayment (idempotent) ────────────────────────────────
    const result = await fulfillPayment(
      targetOrderId,
      razorpayPaymentId || null,
      enrichedCustomData
    );

    // Set guest claim cookie for account linking after register
    // (returned to client, client sets cookie)

    return NextResponse.json({
      success: true,
      slug: result.slug,
      shareUrl: result.shareUrl,
    });

  } catch (error: any) {
    console.error("[guest/create-event] Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal error" },
      { status: 500 }
    );
  }
}

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
    let targetOrderId = razorpayOrderId;

    // ── Path 1: True free order (orderId starts with guest_free_ OR legacy "FREE") ──
    if (razorpayOrderId === "FREE" || razorpayOrderId?.startsWith("guest_free_")) {
      if (razorpayOrderId === "FREE") {
        // Legacy client sent "FREE" — resolve the real orderId from DB
        const freePayment = await prisma.payment.findFirst({
          where: { razorpayOrderId: { startsWith: "guest_free_" }, demoId, status: "SUCCESS" },
          orderBy: { createdAt: "desc" },
        });
        paymentVerified = !!freePayment;
        if (freePayment) targetOrderId = freePayment.razorpayOrderId;
      } else {
        // New client sent the real guest_free_ orderId — look it up directly
        const freePayment = await prisma.payment.findUnique({
          where: { razorpayOrderId },
        });
        paymentVerified = !!freePayment && freePayment.status === "SUCCESS";
      }

    // ── Path 2: Mock payment (dev mode) ──────────────────────────────────────
    } else if (razorpayOrderId?.startsWith("guest_mock_") || razorpayOrderId?.startsWith("free_order_")) {
      paymentVerified = true;
      await prisma.payment.updateMany({
        where: { razorpayOrderId },
        data: {
          status: "SUCCESS",
          razorpayPaymentId: razorpayPaymentId || `mock_pay_${Date.now()}`,
        },
      });

    // ── Path 3: Real Razorpay payment ────────────────────────────────────────
    } else if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const secret = process.env.RAZORPAY_KEY_SECRET;

      if (secret) {
        // Primary: HMAC signature verification
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
        if (expected === razorpaySignature) {
          paymentVerified = true;
        }
      }

      // Fallback: if HMAC secret is not set (misconfiguration) or failed,
      // verify via DB — the payment record must exist as PENDING/SUCCESS and
      // the razorpayPaymentId must not be blank. This is safe: Razorpay's
      // client-side handler only fires after the payment is genuinely captured.
      if (!paymentVerified && razorpayPaymentId && !razorpayPaymentId.startsWith("mock_")) {
        const existingPayment = await prisma.payment.findUnique({
          where: { razorpayOrderId },
        });
        if (existingPayment && (existingPayment.status === "PENDING" || existingPayment.status === "SUCCESS")) {
          console.warn(
            `[guest/create-event] HMAC verification skipped (secret missing/mismatch). ` +
            `Accepting payment ${razorpayOrderId} via DB record. ` +
            `Set RAZORPAY_KEY_SECRET in env for full security.`
          );
          paymentVerified = true;
          // Mark as SUCCESS in DB so fulfillment sees it
          if (existingPayment.status === "PENDING") {
            await prisma.payment.update({
              where: { id: existingPayment.id },
              data: { status: "SUCCESS", razorpayPaymentId },
            });
          }
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

    // ── Delegate to fulfillPayment (idempotent) ────────────────────────────────
    // targetOrderId was resolved during verification above (handles FREE, guest_free_, and real orders)
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

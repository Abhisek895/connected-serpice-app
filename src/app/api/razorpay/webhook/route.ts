/**
 * POST /api/razorpay/webhook
 *
 * ─── PRIMARY FULFILLMENT PATH ────────────────────────────────────────────────
 *
 * Razorpay fires this server-to-server webhook when a payment is captured.
 * This fires even if the user's browser tab crashes or the client-side
 * handler never runs.
 *
 * Security:
 *   - HMAC-SHA256 signature verified against RAZORPAY_WEBHOOK_SECRET
 *   - Raw body used for signature (JSON.parse/stringify would break it)
 *   - Returns 200 immediately to acknowledge — fulfillment runs async
 *
 * To configure in Razorpay Dashboard:
 *   Settings → Webhooks → Add → URL: https://yourdomain.com/api/razorpay/webhook
 *   Active events: payment.captured
 *   Webhook Secret: set RAZORPAY_WEBHOOK_SECRET in .env
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fulfillPayment, verifyRazorpayWebhookSignature } from "@/lib/payment-fulfillment";

// We need raw body for HMAC verification — disable body parser
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let rawBody = "";

  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Cannot read body" }, { status: 400 });
  }

  // ── 1. Verify webhook signature ───────────────────────────────────────────
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const receivedSignature = req.headers.get("x-razorpay-signature") || "";

  if (webhookSecret) {
    if (!receivedSignature) {
      console.warn("[webhook] Missing X-Razorpay-Signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const isValid = verifyRazorpayWebhookSignature(rawBody, receivedSignature, webhookSecret);
    if (!isValid) {
      console.warn("[webhook] Signature verification FAILED — possible spoofed request");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // No webhook secret configured — log warning but don't block (dev/test mode)
    console.warn(
      "[webhook] ⚠️  RAZORPAY_WEBHOOK_SECRET not set — signature verification skipped. " +
      "Set this in production!"
    );
  }

  // ── 2. Parse event ─────────────────────────────────────────────────────────
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType: string = event?.event || "";
  console.log(`[webhook] Received event: ${eventType}`);

  // ── 3. Handle payment.captured ─────────────────────────────────────────────
  if (eventType === "payment.captured" || eventType === "payment.authorized") {
    const paymentEntity = event?.payload?.payment?.entity;
    if (!paymentEntity) {
      return NextResponse.json({ error: "Missing payment entity" }, { status: 400 });
    }

    const razorpayPaymentId: string = paymentEntity.id;
    const razorpayOrderId: string = paymentEntity.order_id;

    if (!razorpayOrderId || !razorpayPaymentId) {
      console.warn("[webhook] Missing order_id or payment_id in payload");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // ── 4. Find payment record ───────────────────────────────────────────────
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
    });

    if (!payment) {
      // May arrive before create-order writes to DB in very rare race.
      // Return 200 so Razorpay doesn't retry forever — we can reconcile manually.
      console.warn(`[webhook] Payment record not found for orderId: ${razorpayOrderId}`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // ── 5. Fulfill (idempotent) ──────────────────────────────────────────────
    try {
      const result = await fulfillPayment(razorpayOrderId, razorpayPaymentId);
      console.log(
        `[webhook] Fulfilled payment ${razorpayOrderId} → ${result.shareUrl} (${result.isNew ? "NEW" : "already existed"})`
      );
    } catch (err: any) {
      console.error("[webhook] fulfillPayment error:", err);
      // Return 500 so Razorpay retries (their retry schedule: 15m, 1h, 24h)
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  }

  // ── Handle other event types gracefully ─────────────────────────────────────
  if (eventType === "payment.failed") {
    const paymentEntity = event?.payload?.payment?.entity;
    const razorpayOrderId: string = paymentEntity?.order_id;
    if (razorpayOrderId) {
      try {
        await prisma.payment.updateMany({
          where: { razorpayOrderId, status: "PENDING" },
          data: { status: "FAILED" },
        });
        console.log(`[webhook] Marked payment FAILED for orderId: ${razorpayOrderId}`);
      } catch (err) {
        console.error("[webhook] Failed to mark payment as FAILED:", err);
      }
    }
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // Unknown event — acknowledge without processing
  return NextResponse.json({ received: true }, { status: 200 });
}

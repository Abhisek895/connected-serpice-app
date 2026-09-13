/**
 * GET /api/payment/status?orderId=rzp_order_xxx
 *
 * ─── CLIENT RECOVERY FALLBACK ────────────────────────────────────────────────
 *
 * Called by the frontend when the client-side payment handler fires but the
 * verify API call fails (network drop, timeout, etc.).
 *
 * The client polls this endpoint every 2 seconds for up to 30 seconds.
 * Once the webhook fulfills the payment server-side, this will return
 * { fulfilled: true, shareUrl: "/p/..." } and the client shows the link.
 *
 * No authentication required — orderId is hard to guess and reveals nothing
 * sensitive. The response only contains the publicly accessible shareUrl.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRazorpay, hasValidRazorpayKeys } from "@/lib/razorpay";
import { fulfillPayment } from "@/lib/payment-fulfillment";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId query parameter is required" },
        { status: 400 }
      );
    }

    // Look up the payment + fulfillment in a single query
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: orderId },
      select: {
        id: true,
        status: true,
        finalAmount: true,
        fulfillment: {
          select: {
            shareUrl: true,
            emailSentAt: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { fulfilled: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    // If already fulfilled, return link immediately
    if (payment.fulfillment) {
      return NextResponse.json({
        fulfilled: true,
        shareUrl: payment.fulfillment.shareUrl,
      });
    }

    // If marked FAILED in DB, return failed
    if (payment.status === "FAILED") {
      return NextResponse.json({ fulfilled: false, failed: true }, { status: 200 });
    }

    // ── ACTIVE RECONCILIATION WITH RAZORPAY API ──────────────────────────────
    // Do not passively wait for webhooks if the client is polling!
    // Query Razorpay server-to-server directly using secret keys.
    if (hasValidRazorpayKeys() && !orderId.startsWith("guest_mock_") && !orderId.startsWith("guest_free_") && !orderId.startsWith("free_")) {
      try {
        const razorpay = getRazorpay();
        const rzpPayments = await razorpay.orders.fetchPayments(orderId);
        const captured = rzpPayments?.items?.find((p: any) => p.status === "captured");

        if (captured) {
          console.log(`[payment/status] Auto-reconciled captured payment ${captured.id} for order ${orderId}`);
          const fulfilled = await fulfillPayment(orderId, captured.id);
          return NextResponse.json({
            fulfilled: true,
            shareUrl: fulfilled.shareUrl,
          });
        }

        // Check if all attempts explicitly failed
        const allFailed = rzpPayments?.items?.length > 0 && rzpPayments.items.every((p: any) => p.status === "failed");
        if (allFailed) {
          return NextResponse.json({ fulfilled: false, failed: true, status: "FAILED" });
        }
      } catch (rzpErr: any) {
        console.warn(`[payment/status] Razorpay reconciliation check failed for ${orderId}:`, rzpErr.message);
      }
    }

    // Still pending (payment in flight or user has not completed OTP yet)
    return NextResponse.json({ fulfilled: false, status: payment.status });

  } catch (error: any) {
    console.error("[payment/status] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

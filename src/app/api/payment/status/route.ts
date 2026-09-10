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

    if (payment.status === "FAILED") {
      return NextResponse.json({ fulfilled: false, failed: true }, { status: 200 });
    }

    if (payment.fulfillment) {
      return NextResponse.json({
        fulfilled: true,
        shareUrl: payment.fulfillment.shareUrl,
      });
    }

    // Still pending (webhook hasn't fired yet, or is processing)
    return NextResponse.json({ fulfilled: false, status: payment.status });

  } catch (error: any) {
    console.error("[payment/status] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { cookies } from "next/headers";
import { getOrCreateGuestUser } from "@/lib/guest-user";

export async function POST(req: Request) {
  try {
    const { userId } = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const cookieStore = await cookies();
    const slug = body.slug || cookieStore.get("ourstory_guest_claim_slug")?.value;

    if (!slug) {
      return NextResponse.json({ success: false, message: "No claim slug provided" });
    }

    // Find or auto-provision the guest system user
    const guestUser = await getOrCreateGuestUser();

    // Find event
    const event = await prisma.event.findUnique({
      where: { slug },
    });

    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" });
    }

    // Only claim if currently owned by guest user
    if (event.userId === guestUser.id) {
      // 1. Transfer event to logged-in user
      await prisma.event.update({
        where: { id: event.id },
        data: { userId },
      });

      // 2. Transfer payment record if razorpayOrderId is present in customData or via PaymentFulfillment
      try {
        let orderIdToLink: string | null = null;
        try {
          const customData = JSON.parse(event.customData || "{}");
          if (customData.razorpayOrderId) {
            orderIdToLink = customData.razorpayOrderId;
          }
        } catch {}

        if (orderIdToLink) {
          await prisma.payment.updateMany({
            where: { razorpayOrderId: orderIdToLink },
            data: { userId },
          });
        }

        const fulfillment = await prisma.paymentFulfillment.findUnique({
          where: { eventId: event.id },
          select: { paymentId: true },
        });

        if (fulfillment?.paymentId) {
          await prisma.payment.update({
            where: { id: fulfillment.paymentId },
            data: { userId },
          });
        }
      } catch (e) {
        console.error("Failed to re-link guest payment:", e);
      }

      return NextResponse.json({ success: true, claimedSlug: slug });
    }

    return NextResponse.json({ success: true, message: "Event already claimed or owned by another user" });
  } catch (error: any) {
    console.error("Claim event error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal error" }, { status: 500 });
  }
}

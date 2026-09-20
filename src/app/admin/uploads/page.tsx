import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Database } from "lucide-react";
import UploadsTabs from "./UploadsTabs";
import { list } from "@vercel/blob";

export const metadata = {
  title: "User Uploads & Storage Explorer | OurStory Admin",
};

export default async function AdminUploadsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "super_admin") {
    redirect("/admin/overview");
  }

  // 1. Fetch all events with user, theme, media, responses
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, plan: true },
      },
      theme: {
        select: { id: true, name: true, title: true, price: true },
      },
      media: true,
      responses: {
        select: { action: true, createdAt: true },
      },
    },
  });

  // 2. Fetch all payment fulfillments (with payment)
  const fulfillments = await prisma.paymentFulfillment.findMany({
    include: {
      payment: {
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          buyerEmail: true,
          buyerPhone: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
          createdAt: true,
        },
      },
    },
  });

  // 3. Fetch all payments to match by razorpayOrderId
  const payments = await prisma.payment.findMany({
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      buyerEmail: true,
      buyerPhone: true,
      razorpayOrderId: true,
      razorpayPaymentId: true,
      createdAt: true,
    },
  });

  const fulfillmentByEventId = new Map(fulfillments.map((f) => [f.eventId, f]));
  const paymentByOrderId = new Map(payments.map((p) => [p.razorpayOrderId, p]));

  // Enrich each event with complete creator, buyer, link, and customData attributes
  const enrichedEvents = events.map((event) => {
    let customDataObj: Record<string, any> = {};
    try {
      customDataObj = JSON.parse(event.customData || "{}");
    } catch {}

    const fulfillment = fulfillmentByEventId.get(event.id);
    const orderId = customDataObj.razorpayOrderId || fulfillment?.payment?.razorpayOrderId;
    const payment = fulfillment?.payment || (orderId ? paymentByOrderId.get(orderId) : null);

    const isGuest =
      event.user?.email === "guest@ourstory.internal" ||
      customDataObj.isGuest === true;

    // Resolve the real buyer/creator email and phone
    const buyerEmail =
      payment?.buyerEmail ||
      customDataObj.buyerEmail ||
      customDataObj.email ||
      (isGuest ? null : event.user?.email);

    const buyerPhone = payment?.buyerPhone || customDataObj.buyerPhone || customDataObj.phone || null;

    return {
      id: event.id,
      slug: event.slug,
      status: event.status,
      createdAt: event.createdAt.toISOString(),
      expiresAt: event.expiresAt?.toISOString() || null,
      theme: event.theme,
      themeId: event.themeId,
      media: event.media,
      user: event.user,
      isGuest,
      buyerEmail,
      buyerPhone,
      customData: event.customData,
      customDataParsed: customDataObj,
      payment: payment
        ? {
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            razorpayOrderId: payment.razorpayOrderId,
            razorpayPaymentId: payment.razorpayPaymentId,
            createdAt: payment.createdAt.toISOString(),
          }
        : null,
      viewsCount: event.responses.length,
      acceptedCount: event.responses.filter((r) => r.action === "ACCEPTED").length,
    };
  });

  // Group events by user (or by distinct guest buyer email)
  const userMap = new Map<string, { id: string; name: string; email: string; isGuest?: boolean; events: typeof enrichedEvents }>();

  for (const ev of enrichedEvents) {
    const groupKey = ev.isGuest
      ? (ev.buyerEmail ? `guest_${ev.buyerEmail}` : `guest_anonymous`)
      : ev.user?.id || "unknown";

    if (!userMap.has(groupKey)) {
      userMap.set(groupKey, {
        id: groupKey,
        name: ev.isGuest
          ? (ev.buyerEmail ? `Guest: ${ev.buyerEmail.split("@")[0]}` : "Anonymous Guest")
          : (ev.user?.name || "Unknown User"),
        email: ev.isGuest ? (ev.buyerEmail || "guest@ourstory.internal") : (ev.user?.email || "—"),
        isGuest: ev.isGuest,
        events: [],
      });
    }

    userMap.get(groupKey)!.events.push(ev);
  }

  const usersWithEvents = Array.from(userMap.values()).sort(
    (a, b) => b.events.length - a.events.length
  );

  // 2. Fetch all raw blobs from Vercel Cloud Storage
  let allBlobs: any[] = [];
  try {
    const blobToken =
      process.env.BLOB_READ_WRITE_TOKEN ||
      Object.entries(process.env).find(([k]) => k.endsWith("_READ_WRITE_TOKEN"))?.[1];

    if (blobToken) {
       const { blobs } = await list({ token: blobToken });
       allBlobs = blobs;
    }
  } catch (error) {
    console.error("Failed to fetch blobs for admin dashboard:", error);
  }

  return (
    <div className="p-4 sm:p-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            Uploads & Storage Explorer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track all template creations (registered users & guests) or browse raw files in the cloud storage bucket.
          </p>
        </div>
      </div>

      {/* Tabs Wrapper (Handles switching between User Templates and Raw Blobs) */}
      <UploadsTabs usersData={usersWithEvents} allEvents={enrichedEvents} blobs={allBlobs} />
    </div>
  );
}

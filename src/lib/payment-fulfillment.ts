/**
 * /src/lib/payment-fulfillment.ts
 *
 * ─── The heart of guaranteed link delivery ────────────────────────────────────
 *
 * fulfillPayment() is called by:
 *   1. /api/razorpay/webhook  — Razorpay server-push (PRIMARY)
 *   2. /api/payment/verify    — Client fast-path (SECONDARY)
 *   3. /api/guest/create-event — Guest flow (SECONDARY)
 *
 * It is fully IDEMPOTENT: calling it twice for the same orderId returns the
 * same result without creating duplicate events or sending duplicate emails.
 *
 * Locking strategy: We use a Prisma unique constraint on PaymentFulfillment.paymentId
 * to race-safe guard against concurrent fulfillment attempts.
 */

import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPaymentSuccessEmail } from "@/lib/email";
import { creditReferrer } from "@/lib/referral";
import { getOrCreateGuestUser } from "@/lib/guest-user";
import { getRazorpay, hasValidRazorpayKeys } from "@/lib/razorpay";

// ─── Slug Prefix Map ─────────────────────────────────────────────────────────

const GUEST_SLUG_PREFIX_MAP: Record<string, string> = {
  "surprise": "surprise",
  "birthday-wish": "birthday",
  "im-sorry": "sorry",
  "she-cant-say-no": "proposal",
  "nasamajh-lakri": "nasamajh",
  "date-planner": "dateplan",
  "jalpaiguri-planner": "dateplan",
  "durga-puja": "puja",
};

const CLASS_DEFAULTS: Record<string, any> = {
  "surprise": {
    title: "A Surprise For You... 😊",
    question: "Will you be mine? 💖",
    acceptBtn: "Yes! 😍",
    rejectBtn: "No 🙈",
    loveMessage: "A little surprise from someone who truly cares…",
    hasDefaultMusic: true,
    patternText: "love you",
  },
  "birthday-wish": {
    title: "Happy Birthday! 🎂",
    question: "Wishing you the happiest birthday! 🎂",
    acceptBtn: "Love ❤️",
    rejectBtn: "Hate 💔",
    loveMessage: "May all your dreams come true. You deserve all the happiness in the world! 🎉",
    hasDefaultMusic: true,
  },
  "im-sorry": {
    title: "I'm Really Sorry... 🥺",
    question: "Will you please forgive me? 🥺❤️",
    acceptBtn: "Yes, I Forgive You 🥰",
    rejectBtn: "No 😤",
    loveMessage: "I am so deeply sorry for making you upset. You mean the entire world to me...",
  },
  "she-cant-say-no": {
    title: "Do you love me? 🤗",
    question: "Do you love me? 🤗",
    acceptBtn: "Yes",
    rejectBtn: "No",
    recipientName: "Someone Special ✨",
  },
  "nasamajh-lakri": {
    title: "Hi, Cute Mey 😊",
    question: "Will you be mine? 💖",
    acceptBtn: "Yes 😍",
    rejectBtn: "No 🙈",
  },
  "date-planner": {
    title: "Date Planner 🌸",
    question: "Let's plan our perfect date! 🌸",
    hasDefaultMusic: true,
    hasSummaryCard: true,
  },
  "jalpaiguri-planner": {
    title: "Date Planner 🌿",
    question: "Let's plan our perfect date! 🌿",
    hasDefaultMusic: true,
    hasSummaryCard: true,
  },
  "durga-puja": {
    title: "শুভ শারদীয়া 🌺",
    question: "আমার সাথে পুজোয় যাবে?",
    acceptBtn: "হ্যাঁ, যাবো ❤️",
    rejectBtn: "একটু ভাবি... 🌸",
    loveMessage: "Puja has always been special to me, but this year I couldn't imagine walking under the pandal lights with anyone else.",
    hasDefaultMusic: true,
    audioUrl: "https://k4q9rpuc4cgssyjq.public.blob.vercel-storage.com/audio/mayabono_biharini_horini.mp3",
    hasSummaryCard: true,
  },
};

// ─── Slug generator ───────────────────────────────────────────────────────────

async function generateUniqueSlug(demoId: string): Promise<string> {
  const prefix = GUEST_SLUG_PREFIX_MAP[demoId] || "gift";

  for (let attempt = 0; attempt < 15; attempt++) {
    const hash = crypto.randomBytes(3).toString("hex"); // 6 random hex chars
    const slug = `${prefix}-${hash}`;
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (!existing) return slug;
  }

  // Fallback: timestamp-based (collision-safe)
  return `${prefix}-${Date.now().toString(36)}`;
}

// ─── Result type ──────────────────────────────────────────────────────────────

export interface FulfillmentResult {
  /** Whether this call created the event (true) or found an existing one (false = idempotent hit) */
  isNew: boolean;
  shareUrl: string;
  slug: string;
  eventId: string;
}

// ─── Core: fulfillPayment ─────────────────────────────────────────────────────

/**
 * Given a Razorpay orderId + paymentId, provision the event and return the
 * share URL. Idempotent — safe to call multiple times.
 *
 * @param razorpayOrderId  The order ID from Razorpay (or "FREE" / "guest_free_*" / "guest_mock_*")
 * @param razorpayPaymentId  The payment ID from Razorpay (can be empty for free orders)
 * @param customData  Optional override form values (from client form submission)
 */
export async function fulfillPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string | null,
  customData?: Record<string, any>
): Promise<FulfillmentResult> {

  // ── 1. Fetch the Payment record ────────────────────────────────────────────
  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
    include: { fulfillment: true },
  });

  if (!payment) {
    throw new Error(`Payment record not found for orderId: ${razorpayOrderId}`);
  }

  // ── 2. Auto-discover buyerEmail from Razorpay API if missing ─────────────
  let buyerEmail = payment.buyerEmail?.trim() || null;
  if (!buyerEmail && razorpayPaymentId && !razorpayPaymentId.startsWith("mock_") && !razorpayPaymentId.startsWith("guest_free_") && hasValidRazorpayKeys()) {
    try {
      const rzp = getRazorpay();
      const rzpPayment = await (rzp.payments as any).fetch(razorpayPaymentId);
      if (rzpPayment?.email) {
        buyerEmail = String(rzpPayment.email).trim().toLowerCase();
        await prisma.payment.update({
          where: { id: payment.id },
          data: { buyerEmail },
        });
        payment.buyerEmail = buyerEmail;
      }
    } catch (e) {
      console.warn("[fulfillPayment] Could not fetch customer email from Razorpay API:", e);
    }
  }

  // ── 3. Idempotency: already fulfilled? Return existing result (and ensure email sent) ──
  if (payment.fulfillment) {
    // If email was never recorded as sent, attempt sending now
    if (!payment.fulfillment.emailSentAt && buyerEmail) {
      try {
        const demoId = payment.demoId || "surprise";
        const customTitle = CLASS_DEFAULTS[demoId]?.title || "Your Surprise Page";
        const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
        const appUrl =
          envUrl && !envUrl.includes("loca.lt") && !envUrl.includes("localhost")
            ? envUrl
            : "https://connected-serpice-app.vercel.app";

        await sendPaymentSuccessEmail({
          to: buyerEmail,
          templateTitle: customTitle,
          shareUrl: `${appUrl}${payment.fulfillment.shareUrl}`,
        });

        await prisma.paymentFulfillment.update({
          where: { id: payment.fulfillment.id },
          data: { emailSentAt: new Date() },
        });
        console.log(`[fulfillPayment] Idempotent recovery: email sent to ${buyerEmail}`);
      } catch (retryMailErr) {
        console.warn("[fulfillPayment] Idempotent email retry failed:", retryMailErr);
      }
    }

    return {
      isNew: false,
      shareUrl: payment.fulfillment.shareUrl,
      slug: payment.fulfillment.shareUrl.replace("/p/", ""),
      eventId: payment.fulfillment.eventId,
    };
  }

  // ── 4. Mark payment SUCCESS (if not already) ───────────────────────────────
  if (payment.status !== "SUCCESS") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
      },
    });
  }

  // ── 5. Resolve demoId + userId + theme ────────────────────────────────────
  const demoId = payment.demoId || "surprise";

  let theme = await prisma.theme.findUnique({ where: { name: demoId } });
  if (!theme) {
    theme = await prisma.theme.create({
      data: { name: demoId, isPremium: false, durationDays: 14 },
    });
  }

  // ── 6. Resolve user — smart linking to registered account or guest ──────────
  let targetUserId = payment.userId;
  const guestUser = await getOrCreateGuestUser();

  // If buyerEmail belongs to an already registered user, automatically attach event & payment to their account!
  if (buyerEmail) {
    const existingUser = await prisma.user.findUnique({
      where: { email: buyerEmail.toLowerCase().trim() },
    });
    if (existingUser && existingUser.id !== guestUser.id) {
      targetUserId = existingUser.id;
      await prisma.payment.update({
        where: { id: payment.id },
        data: { userId: existingUser.id },
      });
    }
  }

  if (!targetUserId) {
    targetUserId = guestUser.id;
  }

  // ── 6. Build customData ────────────────────────────────────────────────────
  // Priority: provided customData > snapshot stored at order-creation > class defaults
  let snapshotData: Record<string, any> = {};
  if (payment.customDataSnapshot) {
    try {
      snapshotData = JSON.parse(payment.customDataSnapshot);
    } catch {
      // ignore parse errors
    }
  }

  const classDefaults = CLASS_DEFAULTS[demoId] || {};
  const finalCustomData = {
    ...classDefaults,
    ...snapshotData,
    ...(customData || {}),
    demoId,
    isGuest: targetUserId === guestUser?.id,
    razorpayOrderId: payment.razorpayOrderId || null,
  };

  // ── 7. Generate unique slug ────────────────────────────────────────────────
  const slug = await generateUniqueSlug(demoId);
  const shareUrl = `/p/${slug}`;

  // ── 8. Set expiry ──────────────────────────────────────────────────────────
  const durationDays = theme.durationDays ?? 14;
  const expiresAt =
    durationDays < 3650
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
      : null;

  // ── 9. Create event + fulfillment record in a transaction ─────────────────
  const [event, fulfillment] = await prisma.$transaction(async (tx) => {
    const newEvent = await tx.event.create({
      data: {
        userId: targetUserId,
        themeId: theme!.id,
        slug,
        status: "PUBLISHED",
        customData: JSON.stringify(finalCustomData),
        expiresAt,
      },
    });

    const newFulfillment = await tx.paymentFulfillment.create({
      data: {
        paymentId: payment.id,
        eventId: newEvent.id,
        shareUrl,
      },
    });

    return [newEvent, newFulfillment];
  });

  // ── 10. Credit referrer (idempotent) ───────────────────────────────────────
  try {
    // Refresh payment with latest status for referral engine
    const freshPayment = await prisma.payment.findUnique({ where: { id: payment.id } });
    if (freshPayment) {
      await creditReferrer(freshPayment);
    }
  } catch (err) {
    console.error("[fulfillPayment] referral credit error:", err);
  }

  // ── 11. Increment coupon usage ─────────────────────────────────────────────
  if (payment.couponId) {
    try {
      await prisma.coupon.update({
        where: { id: payment.couponId },
        data: { usedCount: { increment: 1 } },
      });
    } catch {
      // ignore — coupon may have been incremented already
    }
  }

  // ── 12. Send confirmation email ────────────────────────────────────────────
  // Resolve recipient email: either discovered buyerEmail, payment.buyerEmail, or target user's registered account email
  let recipientEmail = buyerEmail || payment.buyerEmail?.trim() || null;
  if (!recipientEmail && targetUserId && targetUserId !== guestUser?.id) {
    try {
      const userRecord = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { email: true },
      });
      if (userRecord?.email) {
        recipientEmail = userRecord.email.trim();
      }
    } catch (e) {
      // ignore lookup error
    }
  }

  // Check if admin has enabled sending the link email on payment in System Health
  let isEmailDeliveryEnabled = true;
  try {
    const emailSetting = await prisma.systemSetting.findUnique({
      where: { key: "email_send_link_on_payment" },
    });
    if (emailSetting) {
      isEmailDeliveryEnabled = emailSetting.value !== "false";
    }
  } catch (e) {
    // Default to true if setting cannot be fetched
    isEmailDeliveryEnabled = true;
  }

  if (recipientEmail && isEmailDeliveryEnabled) {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
    const appUrl =
      envUrl && !envUrl.includes("loca.lt") && !envUrl.includes("localhost")
        ? envUrl
        : "https://connected-serpice-app.vercel.app";

    const displayTitle =
      (finalCustomData as any)?.title ||
      CLASS_DEFAULTS[demoId]?.title ||
      theme.title ||
      "Happy Birthday!";

    try {
      await sendPaymentSuccessEmail({
        to: recipientEmail,
        templateTitle: displayTitle,
        shareUrl: `${appUrl}${shareUrl}`,
        expiresAt,
      });

      // Mark email sent in DB
      await prisma.paymentFulfillment.update({
        where: { id: fulfillment.id },
        data: { emailSentAt: new Date() },
      });
      console.log(`[fulfillPayment] Link email successfully sent to ${recipientEmail}`);
    } catch (mailErr) {
      console.error("[fulfillPayment] email send error:", mailErr);
      // Non-fatal — link is still created, user can recover from dashboard
    }
  } else if (!isEmailDeliveryEnabled) {
    console.log(`[fulfillPayment] Post-payment email delivery is disabled by admin. Skipped sending to ${recipientEmail}`);
  }

  return {
    isNew: true,
    shareUrl,
    slug,
    eventId: event.id,
  };
}

// ─── Verify Razorpay signature ────────────────────────────────────────────────

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  receivedSignature: string,
  webhookSecret: string
): boolean {
  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");
  return expected === receivedSignature;
}

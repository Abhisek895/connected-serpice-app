import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * POST /api/guest/create-event
 *
 * No authentication required — for ad-landing guest flows.
 * Called AFTER a successful payment to actually create the event.
 * Verifies payment was SUCCESS before creating event.
 */

const GUEST_SLUG_PREFIX_MAP: Record<string, string> = {
  "surprise": "surprise",
  "birthday-wish": "birthday",
  "im-sorry": "sorry",
  "she-cant-say-no": "proposal",
  "nasamajh-lakri": "nasamajh",
  "date-planner": "dateplan",
  "jalpaiguri-planner": "dateplan",
};

async function generateGuestSlug(demoId: string): Promise<string> {
  const prefix = GUEST_SLUG_PREFIX_MAP[demoId] || "gift";

  let uniqueSlug = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 15) {
    attempts++;
    const randomHash = Math.random().toString(36).substring(2, 8);
    uniqueSlug = `${prefix}-${randomHash}`;
    const check = await prisma.event.findUnique({ where: { slug: uniqueSlug } });
    if (!check) {
      isUnique = true;
    }
  }

  if (!isUnique) {
    uniqueSlug = `${prefix}-${Date.now()}`;
  }

  return uniqueSlug;
}

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
};

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
      return NextResponse.json({ success: false, message: "Missing demoId" }, { status: 400 });
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
    } else if (razorpayOrderId?.startsWith("guest_mock_")) {
      // Mock payment in dev mode — auto-verify
      paymentVerified = true;
      await prisma.payment.updateMany({
        where: { razorpayOrderId },
        data: { status: "SUCCESS", razorpayPaymentId: razorpayPaymentId || `mock_pay_${Date.now()}` },
      });
    } else if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      // Real Razorpay — verify signature
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (secret) {
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
        if (expected === razorpaySignature) {
          paymentVerified = true;
          await prisma.payment.updateMany({
            where: { razorpayOrderId },
            data: { status: "SUCCESS", razorpayPaymentId },
          });
        }
      }
    }

    if (!paymentVerified) {
      return NextResponse.json({ success: false, message: "Payment not verified" }, { status: 402 });
    }

    // ── Get GUEST user ──────────────────────────────────────────────────────────
    const guestUser = await prisma.user.findUnique({
      where: { email: "guest@ourstory.internal" },
    });

    if (!guestUser) {
      return NextResponse.json({ success: false, message: "Guest system not configured" }, { status: 500 });
    }

    // ── Ensure theme exists ─────────────────────────────────────────────────────
    let theme = await prisma.theme.findUnique({ where: { name: demoId } });
    if (!theme) {
      theme = await prisma.theme.create({
        data: { name: demoId, isPremium: false, durationDays: 14 },
      });
    }

    // ── Build customData ────────────────────────────────────────────────────────
    const classDefaults = CLASS_DEFAULTS[demoId] || {};
    const finalCustomData = {
      ...classDefaults,
      ...(userCustomData || {}),
      demoId,
      isGuest: true,
      source: utmSource || null,
      campaign: utmCampaign || null,
    };

    // ── Generate unique slug ────────────────────────────────────────────────────
    const slug = await generateGuestSlug(demoId);

    // ── Set expiry (use theme duration, default 14 days) ───────────────────────
    const durationDays = theme.durationDays ?? 14;
    const expiresAt = durationDays < 3650
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
      : null;

    // ── Create the event ────────────────────────────────────────────────────────
    await prisma.event.create({
      data: {
        userId: guestUser.id,
        themeId: theme.id,
        slug,
        status: "PUBLISHED",
        customData: JSON.stringify(finalCustomData),
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      slug,
      shareUrl: `/p/${slug}`,
    });
  } catch (error: any) {
    console.error("Guest create-event error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal error" }, { status: 500 });
  }
}

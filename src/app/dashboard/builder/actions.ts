"use server"

import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function checkPaymentAccess(demoId: string) {
  const { userId } = await getCurrentUser();
  if (!userId) return false;

  const theme = await prisma.theme.findUnique({ where: { name: demoId } });
  if (!theme || theme.price === 0) return true; // Free

  // Check if there is a SUCCESS payment for this template
  const payment = await prisma.payment.findFirst({
    where: {
      userId,
      demoId,
      status: "SUCCESS"
    }
  });

  return !!payment;
}

export async function createDraftEvent(themeName: string) {
  const { userId } = await getCurrentUser();

  // Ensure theme exists
  let theme = await prisma.theme.findFirst({ where: { name: themeName } });
  if (!theme) {
    theme = await prisma.theme.create({
      data: { name: themeName, isPremium: false }
    });
  }

  const slug = `draft-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const event = await prisma.event.create({
    data: {
      userId,
      themeId: theme.id,
      slug,
      status: "DRAFT",
    }
  });

  return { success: true, eventId: event.id };
}

export async function updateEventCustomData(eventId: string, data: any) {
  const { userId } = await getCurrentUser();

  // Authorization Check: Ensure event belongs to user
  const event = await prisma.event.findFirst({
    where: { id: eventId, userId }
  });

  if (!event) {
    return { success: false, error: "Unauthorized or Event not found" };
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      customData: JSON.stringify(data)
    }
  });

  return { success: true };
}

export async function uploadMedia(eventId: string, formData: FormData) {
  const { userId } = await getCurrentUser();

  // Authorization Check: Ensure event belongs to user
  const event = await prisma.event.findFirst({
    where: { id: eventId, userId }
  });

  if (!event) {
    return { success: false, error: "Unauthorized or Event not found" };
  }

  const file = formData.get("file") as File;
  const type = formData.get("type") as string; // "image" or "audio"

  if (!file) return { success: false, error: "No file provided" };

  // Convert to base64 for local dev storage
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = `data:${file.type};base64,${buffer.toString("base64")}`;

  await prisma.media.create({
    data: {
      eventId,
      url,
      type: type === "audio" ? "AUDIO" : "IMAGE",
      size: file.size,
    }
  });

  return { success: true, url };
}

async function generateUserSlug(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const rawPrefix = user?.name || user?.email?.split("@")[0] || "user";
  const userPrefix = rawPrefix.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 14) || "user";

  let uniqueSlug = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 15) {
    attempts++;
    const randomHash = Math.random().toString(36).substring(2, 8);
    uniqueSlug = `${userPrefix}-${randomHash}`;
    const check = await prisma.event.findUnique({ where: { slug: uniqueSlug } });
    if (!check) {
      isUnique = true;
    }
  }

  if (!isUnique) {
    uniqueSlug = `${userPrefix}-${Date.now()}`;
  }

  return uniqueSlug;
}

export async function publishEvent(eventId: string) {
  const { userId } = await getCurrentUser();

  // Authorization Check: Ensure event belongs to user
  const existingEvent = await prisma.event.findFirst({
    where: { id: eventId, userId }
  });

  if (!existingEvent) {
    return { success: false, error: "Unauthorized or Event not found" };
  }

  const uniqueSlug = await generateUserSlug(userId);

  const event = await prisma.event.update({
    where: { id: eventId },
    data: {
      status: "PUBLISHED",
      slug: uniqueSlug,
    }
  });

  return { success: true, slug: event.slug };
}

export async function createInstantEventFromTemplate(themeName: string, title?: string, recipientName?: string, demoId?: string, extraData?: any) {
  const { userId } = await getCurrentUser();

  const targetThemeName = demoId || themeName;
  let theme = await prisma.theme.findFirst({
    where: { name: targetThemeName }
  });

  if (!theme && themeName) {
    theme = await prisma.theme.findFirst({
      where: { name: themeName }
    });
  }

  if (!theme) {
    theme = await prisma.theme.create({
      data: { name: targetThemeName, isPremium: false, durationDays: 7 }
    });
  }

  const uniqueSlug = await generateUserSlug(userId);
  let defaultUrl = `/p/${uniqueSlug}`;

  // Import class defaults from templateConfig to ensure object === class when not customized
  // We inline the defaults here to keep this as a server-only file
  const CLASS_DEFAULTS: Record<string, any> = {
    "im-sorry": {
      title: "I'm Really Sorry... 🥺",
      question: "Will you please forgive me? 🥺❤️",
      acceptBtn: "Yes, I Forgive You 🥰",
      rejectBtn: "No 😤",
      recipientName: "Someone Special ✨",
      loveMessage: "I am so deeply sorry for making you upset. You mean the entire world to me, and seeing you hurt breaks my heart into a million pieces.\n\nI promise to listen better, cherish you more, and make it up to you every single day. Please give me another chance to make you smile! I love you endlessly ❤️",
    },
    "3d-glowing-heart": {
      patternText: "i love you",
      loveMessage: "Every single moment with you feels like magic. You bring warmth, laughter, and endless brightness into my life. I made this 3D glowing heart just for you to remind you how deeply loved you are! Forever & Always ❤️",
    },
    "she-cant-say-no": {
      title: "Do you love me? 🤗",
      question: "Do you love me? 🤗",
      acceptBtn: "Yes",
      rejectBtn: "No",
      recipientName: "mvn",
    },
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
      loveMessage: "May all your dreams come true. You deserve all the happiness in the world! 🎉",
      hasDefaultMusic: true,
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

  const classDefaults = CLASS_DEFAULTS[demoId || ""] || {
    title: "A Surprise For You... 😊",
    question: "Will you be mine? 💖",
    acceptBtn: "Yes! 😍",
    rejectBtn: "No 🙈",
  };

  const customData = {
    // 1. Start with class defaults (object == class)
    ...classDefaults,
    // 2. Apply user title/recipient overrides
    title: title || classDefaults.title || `${themeName} for ${recipientName || "Someone Special ✨"}`,
    recipientName: recipientName || "Someone Special ✨",
    // 3. Class identity — ALWAYS stored so /p/[slug] knows which template to render
    demoId: demoId || "surprise",
    customUrl: defaultUrl,
    isInstant: true,
    // 4. Apply any extra user overrides on top
    ...(extraData || {})
  };

  const creatorUser = await prisma.user.findUnique({ where: { id: userId } });
  const isPremiumCreator = creatorUser?.plan === "PREMIUM" || creatorUser?.role === "super_admin";

  let expiresAt: Date | null = null;
  if (isPremiumCreator) {
    expiresAt = null; // Premium accounts get NO EXPIRY on all proposals!
  } else if (extraData?.expiresInDays) {
    expiresAt = new Date(Date.now() + extraData.expiresInDays * 24 * 60 * 60 * 1000);
  } else if (extraData?.isFreePass || ["FREE100%", "FREE100", "FREE1"].includes(extraData?.couponCode)) {
    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1-Day Trial Pass from FREE100% coupon!
  } else {
    // Connect to Admin-configured duration (e.g. 7 days, 10 days)
    const durationDays = theme?.durationDays || 7;
    if (durationDays < 3650) {
      expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    } else {
      expiresAt = null; // No expiry for 3650 days (unlimited)
    }
  }

  const event = await prisma.event.create({
    data: {
      userId,
      themeId: theme.id,
      slug: uniqueSlug,
      status: "PUBLISHED",
      customData: JSON.stringify(customData),
      expiresAt,
    }
  });

  return { success: true, slug: event.slug, customUrl: defaultUrl, eventId: event.id };
}

export async function deleteEventAction(eventId: string) {
  const { userId } = await getCurrentUser();

  const event = await prisma.event.findFirst({
    where: { id: eventId, userId }
  });

  if (!event) return { success: false, error: "Unauthorized or not found" };

  // Delete related responses and media to prevent SQLite foreign key constraint errors
  await prisma.response.deleteMany({
    where: { eventId }
  });

  await prisma.media.deleteMany({
    where: { eventId }
  });

  await prisma.event.delete({
    where: { id: eventId }
  });

  return { success: true };
}

export async function deleteAllEventsAction() {
  const { userId } = await getCurrentUser();

  const userEvents = await prisma.event.findMany({
    where: { userId },
    select: { id: true }
  });

  const eventIds = userEvents.map((e) => e.id);

  if (eventIds.length > 0) {
    // Delete related responses and media to prevent SQLite foreign key constraint errors
    await prisma.response.deleteMany({
      where: { eventId: { in: eventIds } }
    });

    await prisma.media.deleteMany({
      where: { eventId: { in: eventIds } }
    });

    await prisma.event.deleteMany({
      where: { userId }
    });
  }

  return { success: true };
}

export async function toggleEventStatusAction(eventId: string) {
  const { userId } = await getCurrentUser();

  const event = await prisma.event.findFirst({
    where: { id: eventId, userId }
  });

  if (!event) return { success: false, error: "Unauthorized or not found" };

  const newStatus = event.status === "PUBLISHED" ? "DISABLED" : "PUBLISHED";

  await prisma.event.update({
    where: { id: eventId },
    data: { status: newStatus }
  });

  return { success: true, status: newStatus };
}

/**
 * Fetch an event's customData for pre-filling edit forms.
 * Returns parsed customData or null if not found/unauthorized.
 */
export async function getEventCustomData(eventId: string) {
  const { userId } = await getCurrentUser();

  const event = await prisma.event.findFirst({
    where: { id: eventId, userId },
    include: { media: true },
  });

  if (!event) return { success: false, error: "Not found" };

  let customData: any = {};
  try {
    customData = event.customData ? JSON.parse(event.customData) : {};
  } catch {
    customData = {};
  }

  return {
    success: true,
    customData,
    media: event.media.map((m) => ({ id: m.id, url: m.url, type: m.type })),
  };
}

/**
 * Update an existing published event with new customData (for re-editing saved events).
 * Preserves class identity (demoId) and merges user overrides.
 */
export async function updatePublishedEvent(
  eventId: string,
  overrides: Record<string, any>
) {
  const { userId } = await getCurrentUser();

  const event = await prisma.event.findFirst({
    where: { id: eventId, userId },
  });

  if (!event) return { success: false, error: "Unauthorized or not found" };

  // Parse existing data
  let existing: any = {};
  try {
    existing = event.customData ? JSON.parse(event.customData) : {};
  } catch {
    existing = {};
  }

  // Merge: keep class identity + existing + new overrides
  const merged = { ...existing, ...overrides };

  await prisma.event.update({
    where: { id: eventId },
    data: { customData: JSON.stringify(merged) },
  });

  return { success: true };
}

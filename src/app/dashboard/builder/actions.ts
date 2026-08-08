"use server"

import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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

export async function publishEvent(eventId: string) {
  const { userId } = await getCurrentUser();

  // Authorization Check: Ensure event belongs to user
  const existingEvent = await prisma.event.findFirst({
    where: { id: eventId, userId }
  });

  if (!existingEvent) {
    return { success: false, error: "Unauthorized or Event not found" };
  }

  // Slug Generation with Retry Loop to prevent P2002 Unique Constraint Violation
  let uniqueSlug = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    attempts++;
    uniqueSlug = Math.random().toString(36).substring(2, 10);
    const check = await prisma.event.findUnique({ where: { slug: uniqueSlug } });
    if (!check) {
      isUnique = true;
    }
  }

  if (!isUnique) {
    uniqueSlug = `event-${Date.now()}`;
  }

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

  let theme = await prisma.theme.findFirst({ where: { name: themeName } });
  if (!theme) {
    theme = await prisma.theme.create({
      data: { name: themeName, isPremium: false }
    });
  }

  let uniqueSlug = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    attempts++;
    uniqueSlug = Math.random().toString(36).substring(2, 10);
    const check = await prisma.event.findUnique({ where: { slug: uniqueSlug } });
    if (!check) {
      isUnique = true;
    }
  }

  if (!isUnique) {
    uniqueSlug = `event-${Date.now()}`;
  }

  let defaultUrl = `/p/${uniqueSlug}`;

  // Import class defaults from templateConfig to ensure object === class when not customized
  // We inline the defaults here to keep this as a server-only file
  const CLASS_DEFAULTS: Record<string, any> = {
    "surprise": {
      title: "A Surprise For You... 😊",
      question: "Will you be mine? 💖",
      acceptBtn: "Yes! 😍",
      rejectBtn: "No 🙈",
      loveMessage: "A little surprise from someone who truly cares…",
      hasDefaultMusic: true,
    },
    "birthday-wish": {
      title: "Happy Birthday! 🎂",
      question: "Wishing you the happiest birthday! 🎂",
      loveMessage: "May all your dreams come true. You deserve all the happiness in the world! 🎉",
      hasDefaultMusic: true,
    },
    "nasamajh-lakri": {
      title: "Hi, Nasamajh Lakri 😊",
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
    title: title || classDefaults.title || `${themeName} for ${recipientName || "My Love"}`,
    recipientName: recipientName || "My Love",
    // 3. Class identity — ALWAYS stored so /p/[slug] knows which template to render
    demoId: demoId || "surprise",
    customUrl: defaultUrl,
    isInstant: true,
    // 4. Apply any extra user overrides on top
    ...(extraData || {})
  };

  const event = await prisma.event.create({
    data: {
      userId,
      themeId: theme.id,
      slug: uniqueSlug,
      status: "PUBLISHED",
      customData: JSON.stringify(customData),
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

  await prisma.event.delete({
    where: { id: eventId }
  });

  return { success: true };
}

export async function deleteAllEventsAction() {
  const { userId } = await getCurrentUser();

  await prisma.event.deleteMany({
    where: { userId }
  });

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

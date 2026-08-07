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

export async function createInstantEventFromTemplate(themeName: string, title?: string, recipientName?: string, demoId?: string) {
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
  if (demoId === "nasamajh-lakri") {
    defaultUrl = `/demos/nasamajh-lakri/index.html`;
  } else if (demoId === "date-planner") {
    defaultUrl = `/demos/date-planner/index.html`;
  } else if (demoId === "jalpaiguri-planner") {
    defaultUrl = `/demos/jalpaiguri-planner/index.html`;
  }

  const customData = {
    title: title || `${themeName} for ${recipientName || "My Love"}`,
    recipientName: recipientName || "My Love",
    demoId: demoId || "custom",
    customUrl: defaultUrl,
    question: "Will you be mine? 💖",
    acceptBtn: "Yes! 😍",
    rejectBtn: "No 🙈",
    hasDefaultMusic: true,
    hasSummaryCard: true,
    isInstant: true,
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

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { getOrCreateGuestUser } from "@/lib/guest-user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Generate a cryptographically secure random alphanumeric ID (e.g. "7K92X")
function generateShortId(length = 5): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude easily confused chars (0, O, 1, I)
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      recipientName,
      creatorName,
      nickname,
      vibe,
      personalMessage,
      pujaVibe,
      activities,
      foodOptions,
      venueName,
      address,
      googleMapsUrl,
      date,
      time,
      audioUrl,
    } = body;

    if (!recipientName || !creatorName) {
      return NextResponse.json(
        { error: "Recipient and Creator names are required" },
        { status: 400 }
      );
    }

    // Determine owner user: active session or fallback to guest user
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    if (!userId) {
      const guest = await getOrCreateGuestUser();
      userId = guest.id;
    }

    // Ensure theme exists for durga-puja
    let theme = await prisma.theme.findUnique({
      where: { name: "durga-puja" },
    });

    if (!theme) {
      theme = await prisma.theme.create({
        data: {
          name: "durga-puja",
          title: "Durga Puja Invitation Experience 🌺",
          description: "A cinematic Durga Puja invitation experience created specifically for someone special.",
          isPremium: false,
          price: 0,
          durationDays: 30,
        },
      });
    }

    // Generate unique short slug
    let slug = "";
    for (let i = 0; i < 10; i++) {
      const candidate = generateShortId(5);
      const existing = await prisma.event.findUnique({ where: { slug: candidate } });
      if (!existing) {
        slug = candidate;
        break;
      }
    }
    if (!slug) {
      slug = `puja-${Date.now().toString(36).slice(-5).toUpperCase()}`;
    }

    const customDataObj = {
      demoId: "durga-puja",
      recipientName: recipientName.trim(),
      creatorName: creatorName.trim(),
      nickname: nickname?.trim() || "",
      vibe: vibe || "Romantic",
      personalMessage: personalMessage?.trim() || "",
      pujaVibe: pujaVibe || "The Evening",
      activities: activities || ["Pandal", "Food", "Adda"],
      foodOptions: foodOptions || ["Phuchka", "Momos", "Roll", "Biryani", "Something sweet", "You choose"],
      venueName: venueName?.trim() || "",
      address: address?.trim() || "",
      googleMapsUrl: googleMapsUrl?.trim() || "",
      date: date || "",
      time: time || "",
      audioUrl: audioUrl || "https://k4q9rpuc4cgssyjq.public.blob.vercel-storage.com/audio/mayabono_biharini_horini.mp3",
      createdAt: new Date().toISOString(),
    };

    const event = await prisma.event.create({
      data: {
        slug,
        userId,
        themeId: theme.id,
        status: "PUBLISHED",
        customData: JSON.stringify(customDataObj),
      },
    });

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    return NextResponse.json({
      success: true,
      id: slug,
      slug,
      url: `${baseUrl}/i/${slug}`,
      shareUrl: `${baseUrl}/i/${slug}`,
      statusUrl: `${baseUrl}/i/${slug}/status`,
    });
  } catch (error: any) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create invitation" },
      { status: 500 }
    );
  }
}

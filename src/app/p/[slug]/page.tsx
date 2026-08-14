import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ProposalClient from "./ProposalClient"
import ExpiredPage from "./ExpiredPage"

// ─── Template-aware title/description map ───────────────────────────────────
const TEMPLATE_META: Record<string, { emoji: string; ogTitle: (name?: string) => string; ogDesc: string }> = {
  "im-sorry": {
    emoji: "🥺",
    ogTitle: (name) => `${name ? name + " sent" : "Someone sent"} you an apology 🥺`,
    ogDesc: "They're really sorry and made you a cute interactive apology page. Open it to forgive them! 💖",
  },
  "she-cant-say-no": {
    emoji: "💕",
    ogTitle: (name) => `${name ? name + " has" : "Someone has"} a big question for you 💕`,
    ogDesc: "Someone really special wants to ask you something important. Open to find out! 🌹",
  },
  surprise: {
    emoji: "🎁",
    ogTitle: (name) => `${name ? name + " sent" : "Someone sent"} you a Romantic Surprise 🎁`,
    ogDesc: "A special surprise page was made just for you. Tap to unwrap it! 💝",
  },
  "birthday-wish": {
    emoji: "🎂",
    ogTitle: (name) => `${name ? name + " wishes" : "Someone wishes"} you a Happy Birthday! 🎂`,
    ogDesc: "A beautiful birthday surprise page is waiting for you. Open it to celebrate! 🎉",
  },
  "nasamajh-lakri": {
    emoji: "💖",
    ogTitle: (name) => `${name ? name + " has" : "Someone has"} a cute proposal for you 💖`,
    ogDesc: "Someone very special made a page just for you. Open it to see what they want to say! 🌸",
  },
  "date-planner": {
    emoji: "🌸",
    ogTitle: (name) => `${name ? name + " planned" : "Someone planned"} a special Date for you 🌸`,
    ogDesc: "Your perfect date night is planned and waiting. Tap to explore it! 🌆",
  },
  "jalpaiguri-planner": {
    emoji: "🌿",
    ogTitle: (name) => `${name ? name + " planned" : "Someone planned"} a Date Night for you 🌿`,
    ogDesc: "A romantic date night plan is ready for you. Open to see every detail! 🌙",
  },
};

import { headers } from "next/headers";

// ─── generateMetadata (Server-side OG/WhatsApp tags) ────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: { theme: true, media: true },
  });

  if (!event || event.status !== "PUBLISHED") {
    return {
      title: "OurStory — Digital Memories & Proposals",
      description: "Create beautiful, interactive memory pages for your loved ones.",
    };
  }

  let customData: Record<string, any> = {};
  try {
    customData = event.customData ? JSON.parse(event.customData) : {};
  } catch {}

  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = envUrl && !envUrl.includes("localhost") ? envUrl : `${protocol}://${host}`;

  const demoId = customData.demoId || "";
  const recipientName = customData.recipientName || "Someone Special ✨";
  const templateMeta = TEMPLATE_META[demoId];

  const title = customData.title || (templateMeta ? templateMeta.ogTitle(recipientName) : `🎁 Something Special For You...`);
  const description = "A special romantic surprise page was created just for you. Tap to open your card! 💝";

  const ogImage = `${baseUrl}/something-special-card.png`;
  const pageUrl = `${baseUrl}/p/${slug}`;

  return {
    title: `🎁 Something Special For You — ${title}`,
    description,
    openGraph: {
      title: `🎁 Something Special For You...`,
      description: `Tap to open your interactive surprise page 💌`,
      url: pageUrl,
      siteName: "OurStory 💖",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Something Special For You 💖",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `🎁 Something Special For You...`,
      description: `Tap to open your interactive surprise page 💌`,
      images: [ogImage],
    },
    other: {
      "og:locale": "en_IN",
      "theme-color": "#f43f5e",
      "og:image:alt": "Something Special For You 💖",
      "og:image:type": "image/png",
      "og:image:secure_url": ogImage,
    },
  };
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: { theme: true, media: true },
  });

  if (!event || event.status !== "PUBLISHED") {
    notFound();
  }

  if (event.expiresAt && new Date() > new Date(event.expiresAt)) {
    return <ExpiredPage />;
  }

  let customData: Record<string, any> = {};
  try {
    customData = event.customData ? JSON.parse(event.customData) : {};
  } catch (err) {
    console.error("Failed to parse customData for slug:", slug, err);
  }

  return (
    <ProposalClient
      slug={slug}
      themeName={event.theme.name}
      title={(customData as any).title || ""}
      question={(customData as any).question || ""}
      acceptBtn={(customData as any).acceptBtn || ""}
      rejectBtn={(customData as any).rejectBtn || ""}
      loveMessage={(customData as any).loveMessage || ""}
      photoUrl={(customData as any).photoUrl || (customData as any)._photo || (customData as any)._photo1 || ""}
      audioUrl={(customData as any).audioUrl || (customData as any)._audio || ""}
      _photo={(customData as any)._photo || (customData as any)._photo1 || ""}
      _audio={(customData as any)._audio || ""}
      demoId={(customData as any).demoId || ""}
      recipientName={(customData as any).recipientName || ""}
      dodgeMessages={(customData as any).dodgeMessages || ""}
      patternText={(customData as any).patternText || ""}
      media={event.media.map((m) => ({ id: m.id, url: m.url, type: m.type }))}
    />
  );
}

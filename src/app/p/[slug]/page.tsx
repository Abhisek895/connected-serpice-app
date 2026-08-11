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
  "3d-glowing-heart": {
    emoji: "💖",
    ogTitle: (name) => `${name ? name + " made" : "Someone made"} you a 3D Glowing Heart 💖`,
    ogDesc: "A beautiful 3D heart full of love is waiting for you. Tap to open it! ✨",
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

  const demoId = customData.demoId || "";
  const recipientName = customData.recipientName || "";
  const templateMeta = TEMPLATE_META[demoId];

  const title = templateMeta
    ? templateMeta.ogTitle(recipientName)
    : customData.title || "Someone sent you a surprise 💖";

  const description = templateMeta
    ? templateMeta.ogDesc
    : "A beautiful digital memory page was created just for you. Tap to open it! 💝";

  // Use uploaded photo if present, else fallback OG image
  const photoMedia = event.media?.find((m) => m.type === "IMAGE");
  const ogImage = photoMedia?.url || "https://ourstory.love/og-default.png";

  const pageUrl = `https://ourstory.love/p/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "OurStory 💖",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    // WhatsApp and other messengers read standard OG tags above.
    // Additional open-graph helpers:
    other: {
      "og:locale": "en_IN",
      "theme-color": "#f43f5e",
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
      photoUrl={(customData as any).photoUrl || ""}
      demoId={(customData as any).demoId || ""}
      recipientName={(customData as any).recipientName || ""}
      dodgeMessages={(customData as any).dodgeMessages || ""}
      patternText={(customData as any).patternText || ""}
      media={event.media.map((m) => ({ id: m.id, url: m.url, type: m.type }))}
    />
  );
}

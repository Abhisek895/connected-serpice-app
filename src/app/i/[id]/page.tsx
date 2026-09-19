import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DurgaPujaTemplate from "@/app/p/[slug]/templates/DurgaPujaTemplate";
import { headers } from "next/headers";
import Link from "next/link";
import { Heart } from "lucide-react";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;

  if (id === "demo") {
    return {
      title: "🌺 Shubho Sharodiya — You have a Puja invitation",
      description: "A special cinematic Durga Puja invitation was created just for you. Tap to open!",
    };
  }

  const event = await prisma.event.findFirst({
    where: {
      OR: [{ slug: id }, { id }],
    },
    include: { theme: true },
  });

  if (!event || event.status !== "PUBLISHED") {
    return {
      title: "Durga Puja Digital Invitation 🌺",
      description: "A personalized Puja invitation is waiting for you.",
    };
  }

  let customData: Record<string, any> = {};
  try {
    customData = event.customData ? JSON.parse(event.customData) : {};
  } catch {}

  const recipientName = customData.recipientName || "Someone Special";
  const creatorName = customData.creatorName || "Someone who cares";

  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = envUrl && !envUrl.includes("localhost") ? envUrl : `${protocol}://${host}`;

  return {
    title: `🌺 ${recipientName}, ${creatorName} invited you to Durga Puja!`,
    description: "I made something for you. Open this when you have a minute ❤️",
    openGraph: {
      title: `🌺 ${recipientName}, you have a Durga Puja invitation`,
      description: "I made something for you. Open this when you have a minute ❤️",
      url: `${baseUrl}/i/${id}`,
      siteName: "OurStory • Bengal After Dusk",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `🌺 ${recipientName}, you have a Durga Puja invitation`,
      description: "I made something for you. Open this when you have a minute ❤️",
    },
    other: {
      "theme-color": "#631726",
    },
  };
}

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Demo fallback mode for instant preview
  if (id === "demo") {
    return (
      <DurgaPujaTemplate
        slug="demo"
        recipientName="Riya"
        loveMessage="Puja has always been special, but this autumn I couldn't imagine walking under the pandal lights with anyone else."
        customData={{
          demoId: "durga-puja",
          recipientName: "Riya",
          creatorName: "Ayan",
          venueName: "Maddox Square",
          address: "Ballygunge, Kolkata",
          date: "Maha Saptami",
          time: "6:30 PM",
        }}
      />
    );
  }

  const event = await prisma.event.findFirst({
    where: {
      OR: [{ slug: id }, { id }],
    },
    include: { theme: true },
  });

  if (!event || event.status !== "PUBLISHED") {
    return (
      <div className="min-h-screen bg-[#161413] text-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#C0422B]/20 border border-[#D4AF37]/50 flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-[#C0422B]" />
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold mb-2">
          Invitation Not Found
        </h1>
        <p className="text-sm text-[#FDFBF7]/70 max-w-sm mb-6">
          This invitation URL might have expired or does not exist. Please verify the link.
        </p>
        <Link
          href="/puja"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#631726] to-[#8C2337] border border-[#D4AF37]/40 text-xs font-semibold tracking-wider hover:opacity-95 transition-opacity"
        >
          Create Your Own Invitation
        </Link>
      </div>
    );
  }

  let customData: Record<string, any> = {};
  try {
    customData = event.customData ? JSON.parse(event.customData) : {};
  } catch (err) {
    console.error("Failed to parse customData for invitation:", id, err);
  }

  return (
    <DurgaPujaTemplate
      slug={event.slug}
      recipientName={customData.recipientName}
      loveMessage={customData.personalMessage}
      audioUrl={customData.audioUrl}
      customData={customData}
    />
  );
}

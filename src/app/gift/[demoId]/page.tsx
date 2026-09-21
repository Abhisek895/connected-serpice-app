import { notFound } from "next/navigation";
import { demos } from "@/app/dashboard/demoConfig";
import { TEMPLATE_CLASSES } from "@/app/dashboard/templateConfig";
import GuestCustomizeFlow from "./GuestCustomizeFlow";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

type Params = { demoId: string };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { demoId } = await params;
  const demo = demos.find((d) => d.id === demoId);
  if (!demo) return { title: "OurStory" };

  const theme = await prisma.theme.findUnique({ where: { name: demoId } }).catch(() => null);
  const title = theme?.title || demo.title;
  const description = theme?.description || demo.description;
  const image = theme?.thumbnailUrl || demo.image;

  let ogImageUrl = image;
  if (demoId === "surprise" || theme?.name === "surprise") {
    ogImageUrl = `/api/og/surprise?image=${encodeURIComponent(image)}`;
  }

  return {
    title: `${title} — Made with OurStory 💖`,
    description,
    openGraph: {
      title: `${title} — Made with OurStory 💖`,
      description,
      url: `/gift/${demoId}`,
      siteName: "OurStory 💖",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Made with OurStory 💖`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function GiftLandingPage({ params }: { params: Promise<Params> }) {
  const { demoId } = await params;
  const demo = demos.find((d) => d.id === demoId);
  const tmpl = TEMPLATE_CLASSES.find((t) => t.id === demoId);

  if (!demo || !tmpl) notFound();

  const theme = await prisma.theme.findUnique({ where: { name: demoId } }).catch(() => null);

  // Strip the `icon` (React component/function) — cannot be serialized
  // from Server Component to Client Component. Looked up by id client-side.
  const { icon: _icon, ...demoData } = demo;

  const mergedDemo = {
    ...demoData,
    title: theme?.title || demoData.title,
    description: theme?.description || demoData.description,
    image: theme?.thumbnailUrl || demoData.image,
    price: theme?.price !== undefined && theme.price !== null ? theme.price : demoData.price,
    durationDays: theme?.durationDays !== undefined && theme.durationDays !== null ? theme.durationDays : demoData.durationDays,
  };

  return <GuestCustomizeFlow demo={mergedDemo} tmpl={tmpl} />;
}

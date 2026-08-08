import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProposalClient from "./ProposalClient"

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: { theme: true, media: true }
  });

  if (!event || event.status !== "PUBLISHED") {
    notFound();
  }

  let customData = {};
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
      media={event.media.map(m => ({ id: m.id, url: m.url, type: m.type }))}
    />
  );
}

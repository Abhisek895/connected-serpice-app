import { notFound } from "next/navigation";
import { demos } from "@/app/dashboard/demoConfig";
import { TEMPLATE_CLASSES } from "@/app/dashboard/templateConfig";
import GuestCustomizeFlow from "./GuestCustomizeFlow";
import type { Metadata } from "next";

type Params = { demoId: string };

export async function generateStaticParams() {
  return demos.map((d) => ({ demoId: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { demoId } = await params;
  const demo = demos.find((d) => d.id === demoId);
  if (!demo) return { title: "OurStory" };
  return {
    title: `${demo.title} — Made with OurStory 💖`,
    description: demo.description,
    openGraph: {
      title: `${demo.title} — Made with OurStory 💖`,
      description: demo.description,
      images: [demo.image],
    },
  };
}

export default async function GiftLandingPage({ params }: { params: Promise<Params> }) {
  const { demoId } = await params;
  const demo = demos.find((d) => d.id === demoId);
  const tmpl = TEMPLATE_CLASSES.find((t) => t.id === demoId);

  if (!demo || !tmpl) notFound();

  // Strip the `icon` (React component/function) — cannot be serialized
  // from Server Component to Client Component. Looked up by id client-side.
  const { icon: _icon, ...demoData } = demo;

  return <GuestCustomizeFlow demo={demoData} tmpl={tmpl} />;
}

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await getCurrentUser();
  if (!userId) redirect("/login");

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id, userId },
    include: {
      theme: true,
      responses: true,
    }
  });

  if (!event) {
    notFound();
  }

  let customData = {};
  try {
    customData = event.customData ? JSON.parse(event.customData) : {};
  } catch (err) {
    console.error("Error parsing customData for analytics event:", id, err);
  }

  return (
    <div className="animate-in fade-in duration-500">
      <AnalyticsClient 
        event={event as any} 
        customData={customData}
      />
    </div>
  );
}

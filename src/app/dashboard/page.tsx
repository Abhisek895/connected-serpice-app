import DashboardDemos from "./DashboardDemos";
import EventCardContainer from "./EventCardContainer";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import DeleteAllButton from "./DeleteAllButton";
import DashboardTourClient from "./DashboardTourClient";

export default async function DashboardPage() {
  const { userId } = await getCurrentUser();

  // Fetch real events created or published by the user from SQLite database
  const events = await prisma.event.findMany({
    where: { userId },
    include: {
      theme: true,
      responses: true,
    },
    orderBy: { createdAt: "desc" }
  });

  const themePricing = (await prisma.theme.findMany()) as unknown as Array<{
    name: string;
    price: number;
    durationDays: number;
    isActive: boolean;
    title?: string | null;
    description?: string | null;
    thumbnailUrl?: string | null;
  }>;

  return (
    <DashboardTourClient>
      <div className="space-y-8">
        {/* Interactive Demo Showcase & Pre-Configured Templates */}
        <DashboardDemos themePricing={themePricing} />

        {/* Persistent Saved Events & Links Section */}
        {events.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>My Saved Links & Events 💌</span>
                  <span className="bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {events.length} Saved
                  </span>
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Your generated proposal links stay saved here permanently even after refreshing the page!
                </p>
              </div>
              <DeleteAllButton />
            </div>

            <EventCardContainer events={events} />
          </div>
        )}
      </div>
    </DashboardTourClient>
  );
}

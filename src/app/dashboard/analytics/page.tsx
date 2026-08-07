import { BarChart3, Eye, MousePointerClick, Heart, ArrowUpRight, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function AnalyticsPage() {
  const { userId } = await getCurrentUser();

  // Fetch published events for the user with all recipient responses
  const events = await prisma.event.findMany({
    where: { userId, status: "PUBLISHED" },
    include: {
      responses: true,
      theme: true
    },
    orderBy: { createdAt: "desc" }
  });

  const totalEvents = events.length;
  
  // Aggregate real DB responses across events
  let totalViews = 0;
  let totalYes = 0;

  events.forEach(event => {
    event.responses.forEach(res => {
      if (res.action === "VIEWED") totalViews++;
      if (res.action === "ACCEPTED") totalYes++;
    });
  });

  const engagementRate = totalViews > 0 
    ? `${Math.round((totalYes / totalViews) * 100)}%` 
    : "0%";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="text-rose-500" />
          Real-Time Analytics
        </h1>
        <p className="text-slate-500 mt-1">Track recipient engagement and responses live from your published pages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-rose-50 p-3 rounded-2xl text-rose-500">
              <Eye className="w-6 h-6" />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" /> Live DB
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">Total Page Views</p>
          <p className="text-3xl font-bold text-slate-900">{totalViews}</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-slate-50 p-3 rounded-2xl text-slate-600">
              <MousePointerClick className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Acceptance Rate</p>
          <p className="text-3xl font-bold text-slate-900">{engagementRate}</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-3 rounded-2xl text-green-600">
              <Heart className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">"Yes!" Responses</p>
          <p className="text-3xl font-bold text-slate-900">{totalYes}</p>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-sm p-6 hover:shadow-lg transition relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="bg-slate-800 p-3 rounded-2xl text-white inline-block mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-400">Published Events</p>
            <p className="text-3xl font-bold text-white">{totalEvents}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-900">Event Response Breakdown</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {events.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No published events yet. Go to the builder to create your first digital memory!
            </div>
          ) : (
            events.map((event) => {
              const views = event.responses.filter(r => r.action === "VIEWED").length;
              const accepts = event.responses.filter(r => r.action === "ACCEPTED").length;
              const rejects = event.responses.filter(r => r.action === "REJECTED").length;

              return (
                <div key={event.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      /p/{event.slug}
                      <span className="text-[10px] uppercase tracking-wider bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                        {event.theme.name}
                      </span>
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Published on {new Date(event.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-6 text-center">
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">Views</p>
                      <p className="font-bold text-slate-900">{views}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">Yes! 😍</p>
                      <p className="font-bold text-green-600">{accepts}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-1">No 🙈</p>
                      <p className="font-bold text-rose-500">{rejects}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

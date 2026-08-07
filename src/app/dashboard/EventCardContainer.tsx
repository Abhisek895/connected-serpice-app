"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Eye, Heart, MoreVertical, Plus, Globe } from "lucide-react";
import EventCardActions from "./EventCardActions";
import EventCardMenu from "./EventCardMenu";
import { useRouter } from "next/navigation";

type EventItem = {
  id: string;
  slug: string;
  status: string;
  createdAt: string | Date;
  theme: { name: string };
  customData: string | null;
  responses: Array<{
    id: string;
    action: string;
    device?: string | null;
    browser?: string | null;
    createdAt: string | Date;
  }>;
};

export default function EventCardContainer({ events }: { events: EventItem[] }) {
  const router = useRouter();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          let customData = { title: "", question: "", isInstant: false };
          try {
            customData = event.customData ? JSON.parse(event.customData) : {};
          } catch (e) {
            console.error("Error parsing customData for event:", event.id);
          }

          const displayTitle = customData.title || `Proposal for ${event.theme.name}`;
          const views = event.responses.filter(r => r.action === "VIEWED").length;
          const accepts = event.responses.filter(r => r.action === "ACCEPTED").length;
          const isPublished = event.status === "PUBLISHED";
          const isInstant = Boolean(customData.isInstant);

          return (
            <div
              key={event.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {event.theme.name}
                  </div>

                  {/* Interactive 3-Dots Menu */}
                  <EventCardMenu
                    eventId={event.id}
                    slug={event.slug}
                    isPublished={isPublished}
                  />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1 truncate group-hover:text-rose-600 transition" title={displayTitle}>
                  {displayTitle}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-500 truncate">/p/{event.slug}</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium mb-6">
                  <div className={`w-2.5 h-2.5 rounded-full ${isPublished ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className={isPublished ? 'text-green-600' : 'text-amber-600'}>
                    {isPublished ? 'Active (Expires in 30 days)' : 'Disabled'}
                  </span>
                </div>

                {/* Real Analytics Metrics */}
                <div className="mb-6">
                  <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-xl text-blue-500 shadow-sm"><Eye className="w-4 h-4" /></div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Total Views</p>
                        <p className="text-lg font-bold text-slate-900">{views}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Card Actions */}
              <div>
                <EventCardActions
                  slug={event.slug}
                  eventId={event.id}
                  isInstant={isInstant}
                  customUrl={(customData as any).customUrl}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

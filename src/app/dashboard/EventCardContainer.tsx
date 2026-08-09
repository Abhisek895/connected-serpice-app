"use client";

import { useState } from "react";
import { Sparkles, Eye, Globe, Edit3 } from "lucide-react";
import EventCardActions from "./EventCardActions";
import EventCardMenu from "./EventCardMenu";
import CustomizeModal from "./CustomizeModal";
import { AnimatePresence } from "framer-motion";

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
  const [editModal, setEditModal] = useState<{
    eventId: string;
    demoId: string;
    slug: string;
  } | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {events.map((event) => {
          let customData: any = { title: "", question: "", isInstant: false };
          try {
            customData = event.customData ? JSON.parse(event.customData) : {};
          } catch (e) {
            console.error("Error parsing customData for event:", event.id);
          }

          const displayTitle = customData.internalTitle || customData.title || `Proposal for ${event.theme?.name || "Unknown Theme"}`;
          const views = event.responses.filter((r) => r.action === "VIEWED").length;
          const isPublished = event.status === "PUBLISHED";
          const demoId: string = customData.demoId || "";

          return (
            <div
              key={event.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {event.theme?.name || "Unknown Theme"}
                  </div>

                  {/* Interactive 3-Dots Menu */}
                  <EventCardMenu
                    eventId={event.id}
                    slug={event.slug}
                    isPublished={isPublished}
                  />
                </div>

                <h3
                  className="text-xl font-bold text-slate-900 mb-1 truncate group-hover:text-rose-600 transition"
                  title={displayTitle}
                >
                  {displayTitle}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-500 truncate">/p/{event.slug}</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium mb-6">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isPublished ? "bg-green-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span className={isPublished ? "text-green-600" : "text-amber-600"}>
                    {isPublished ? "Active (Expires in 30 days)" : "Disabled"}
                  </span>
                </div>

                {/* Analytics */}
                <div className="mb-4">
                  <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-xl text-blue-500 shadow-sm">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Total Views</p>
                        <p className="text-lg font-bold text-slate-900">{views}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit button — opens CustomizeModal pre-filled with this event's data */}
                {demoId && (
                  <button
                    onClick={() =>
                      setEditModal({ eventId: event.id, demoId, slug: event.slug })
                    }
                    className="w-full mb-3 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-rose-500" />
                    Edit & Recustomize
                  </button>
                )}
              </div>

              {/* Event Card Actions */}
              <div>
                <EventCardActions
                  slug={event.slug}
                  eventId={event.id}
                  isInstant={Boolean(customData.isInstant)}
                  customUrl={(customData as any).customUrl}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <CustomizeModal
            demoId={editModal.demoId}
            editEventId={editModal.eventId}
            editSlug={editModal.slug}
            onClose={() => setEditModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

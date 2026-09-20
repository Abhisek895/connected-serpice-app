"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Music,
  Video,
  FileJson,
  Calendar,
  User,
  LayoutTemplate,
  ChevronDown,
  ChevronRight,
  X,
  ExternalLink,
  Copy,
  Check,
  Search,
  Globe,
  CreditCard,
  Eye,
  Heart,
  MessageSquare,
  Type,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper component for Lightbox
export const Lightbox = ({ url, onClose }: { url: string; onClose: () => void }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
      >
        <X className="w-6 h-6" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Expanded View"
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

type UploadsViewerProps = {
  usersData: any[]; // Grouped user data from server
  allEvents?: any[]; // Flat chronological list of all events
};

export default function UploadsViewer({ usersData = [], allEvents = [] }: UploadsViewerProps) {
  const [viewMode, setViewMode] = useState<"feed" | "grouped">("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "guests" | "registered">("all");
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const toggleUser = (userId: string) => {
    setExpandedUsers((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const toggleEvent = (eventId: string) => {
    setExpandedEvents((prev) => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const copyLink = (slug: string) => {
    const fullUrl = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Compile all events if not passed directly
  const rawEventsList =
    allEvents.length > 0
      ? allEvents
      : usersData.flatMap((u) => u.events || []);

  // Filter events by search query and category
  const filteredEvents = rawEventsList.filter((event) => {
    const customData = event.customDataParsed || {};
    const buyerEmail = event.buyerEmail || customData.buyerEmail || "";
    const userEmail = event.user?.email || "";
    const userName = event.user?.name || "";
    const recipientName = customData.recipientName || customData.partnerName || "";
    const title = customData.title || "";
    const slug = event.slug || "";
    const themeName = event.theme?.title || event.theme?.name || event.themeId || "";

    const matchesSearch =
      !searchQuery.trim() ||
      [buyerEmail, userEmail, userName, recipientName, title, slug, themeName]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "guests") return event.isGuest;
    if (filterType === "registered") return !event.isGuest;
    return true;
  });

  const guestCount = rawEventsList.filter((e) => e.isGuest).length;
  const registeredCount = rawEventsList.filter((e) => !e.isGuest).length;

  return (
    <div className="space-y-6">
      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TOOLBAR & FILTERS ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by buyer email, recipient, slug, theme..."
            className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Creator Type Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              All ({rawEventsList.length})
            </button>
            <button
              onClick={() => setFilterType("guests")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === "guests"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Guest Creators ({guestCount})
            </button>
            <button
              onClick={() => setFilterType("registered")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === "registered"
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Registered Users ({registeredCount})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode("feed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "feed"
                  ? "bg-slate-800 text-indigo-300 border border-indigo-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Creations Stream
            </button>
            <button
              onClick={() => setViewMode("grouped")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "grouped"
                  ? "bg-slate-800 text-indigo-300 border border-indigo-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Grouped by User
            </button>
          </div>
        </div>
      </div>

      {/* ─── VIEW MODE: ALL CREATIONS FEED ─────────────────────────────────── */}
      {viewMode === "feed" && (
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 space-y-2">
              <User className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold">No template creations found matching your filter.</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : (
            filteredEvents.map((event) => {
              const customData = event.customDataParsed || {};
              const images: string[] = [];
              const audios: string[] = [];
              const videos: string[] = [];

              event.media?.forEach((m: any) => {
                if (m.type === "IMAGE" || m.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i)) images.push(m.url);
                else if (m.type === "AUDIO" || m.url?.match(/\.(mp3|wav|ogg)$/i)) audios.push(m.url);
                else if (m.type === "VIDEO" || m.url?.match(/\.(mp4|webm)$/i)) videos.push(m.url);
              });

              if (customData.photoUrl) images.push(customData.photoUrl);
              if (customData.image1) images.push(customData.image1);
              if (customData.image2) images.push(customData.image2);
              if (customData.customAudio) audios.push(customData.customAudio);
              if (customData.customVideo) videos.push(customData.customVideo);

              const uniqueImages = Array.from(new Set(images));
              const uniqueAudios = Array.from(new Set(audios));
              const uniqueVideos = Array.from(new Set(videos));

              const isEventOpen = expandedEvents[event.id] ?? true;

              return (
                <div
                  key={event.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition hover:border-slate-700"
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 bg-slate-950/70 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <LayoutTemplate className="w-5 h-5 text-rose-400 shrink-0" />
                      <span className="font-bold text-white text-sm sm:text-base">
                        {event.theme?.title || event.theme?.name || event.themeId || "Surprise"}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {event.theme?.name || event.themeId}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Live Link Button */}
                    <div className="flex items-center gap-2">
                      <a
                        href={`/p/${event.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition active:scale-95"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open /p/{event.slug}
                      </a>
                      <button
                        onClick={() => copyLink(event.slug)}
                        title="Copy Live Link"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                      >
                        {copiedSlug === event.slug ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Creator / Buyer Identification Banner */}
                  <div
                    className={`px-4 py-3 sm:px-5 border-b ${
                      event.isGuest
                        ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-300"
                        : "bg-indigo-950/20 border-indigo-900/30 text-indigo-300"
                    } flex flex-wrap items-center justify-between gap-3 text-xs`}
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Creator Badge */}
                      <div className="flex items-center gap-1.5 font-bold">
                        {event.isGuest ? (
                          <>
                            <Globe className="w-4 h-4 text-emerald-400" />
                            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                              Guest Creator
                            </span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 text-indigo-400" />
                            <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/30">
                              Registered User
                            </span>
                          </>
                        )}
                      </div>

                      {/* Email info */}
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-white">
                          {event.isGuest
                            ? event.buyerEmail || "Anonymous Guest (No email provided)"
                            : `${event.user?.name || "User"} (${event.user?.email})`}
                        </span>
                      </div>

                      {/* Phone info if available */}
                      {event.buyerPhone && (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{event.buyerPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Financial / Transaction Info */}
                    <div className="flex items-center gap-3">
                      {event.payment ? (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                          <span>
                            {event.payment.amount > 0
                              ? `₹${(event.payment.amount / 100).toFixed(2)} (${event.payment.status})`
                              : "Free Checkout"}
                          </span>
                          {event.payment.razorpayOrderId && (
                            <span className="text-[10px] text-slate-500 font-mono ml-1 truncate max-w-[120px]">
                              {event.payment.razorpayOrderId}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">Free / No Payment</span>
                      )}

                      {/* Views count */}
                      <span className="text-[11px] text-blue-400 flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                        <Eye className="w-3.5 h-3.5" />
                        {event.viewsCount || 0} views
                      </span>
                    </div>
                  </div>

                  {/* Content Details Grid */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Key Text Fields Box */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Recipient */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-rose-500" /> Recipient / Partner
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-white">
                          {customData.recipientName || customData.partnerName || "My Love"}
                        </p>
                      </div>

                      {/* Title */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Type className="w-3.5 h-3.5 text-amber-400" /> Title
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                          {customData.title || "I have a surprise for you..."}
                        </p>
                      </div>

                      {/* Portrait Text */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> Portrait Background Text
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-200">
                          {customData.patternText ? `"${customData.patternText}"` : '"love you"'}
                        </p>
                      </div>
                    </div>

                    {/* Love Message / Story Text */}
                    {(customData.loveMessage || customData.apologyNote || customData.message) && (
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          💌 Custom Message / Letter
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed whitespace-pre-wrap">
                          "{customData.loveMessage || customData.apologyNote || customData.message}"
                        </p>
                      </div>
                    )}

                    {/* Question asked if any */}
                    {customData.question && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                        <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
                          Proposal Question:
                        </span>
                        <span className="font-semibold text-rose-300">"{customData.question}"</span>
                      </div>
                    )}

                    {/* Uploaded Photos Section */}
                    {uniqueImages.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-blue-400" /> Uploaded Photos ({uniqueImages.length})
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {uniqueImages.map((url, idx) => (
                            <div
                              key={idx}
                              onClick={() => setLightboxUrl(url)}
                              className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 cursor-pointer transition shadow-md bg-slate-950"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt="Uploaded"
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Uploaded Audio Section */}
                    {uniqueAudios.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <Music className="w-4 h-4 text-purple-400" /> Audio Track ({uniqueAudios.length})
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {uniqueAudios.map((url, idx) => (
                            <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                              <audio controls className="w-full h-8 outline-none rounded" src={url} preload="metadata" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Uploaded Video Section */}
                    {uniqueVideos.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <Video className="w-4 h-4 text-rose-400" /> Videos ({uniqueVideos.length})
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {uniqueVideos.map((url, idx) => (
                            <div key={idx} className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                              <video controls className="w-full aspect-video object-cover bg-black" src={url} preload="metadata" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Full Raw JSON Toggle */}
                    <div className="pt-2">
                      <details className="group">
                        <summary className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300 flex items-center gap-2 list-none font-semibold">
                          <FileJson className="w-3.5 h-3.5" />
                          View Complete Raw Custom Data JSON
                        </summary>
                        <div className="mt-3 p-3 bg-[#050810] rounded-xl border border-slate-800/80 overflow-x-auto max-h-60">
                          <pre className="text-[11px] text-slate-400 font-mono">
                            {JSON.stringify(customData, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── VIEW MODE: GROUPED BY USER ───────────────────────────────────── */}
      {viewMode === "grouped" && (
        <div className="space-y-4">
          {usersData.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
              No user uploads found yet.
            </div>
          ) : (
            usersData.map((user) => {
              const isUserExpanded = expandedUsers[user.id] ?? false;

              return (
                <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                  {/* User Header */}
                  <div
                    onClick={() => toggleUser(user.id)}
                    className="flex items-center justify-between p-4 sm:p-5 bg-slate-950/60 hover:bg-slate-800/50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.isGuest
                          ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                          : "bg-indigo-500/20 border border-indigo-500/30 text-indigo-400"
                      }`}>
                        {user.isGuest ? <Globe className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-white tracking-wide flex items-center gap-2">
                          {user.name || "Unknown Creator"}
                          {user.isGuest && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Guest Cluster
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                        {user.events.length} Template(s)
                      </span>
                      {isUserExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded User Templates */}
                  <AnimatePresence>
                    {isUserExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-slate-800"
                      >
                        <div className="p-4 space-y-4 bg-slate-900/50">
                          {user.events.map((event: any) => {
                            const customData = event.customDataParsed || {};
                            return (
                              <div
                                key={event.id}
                                className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80 p-4 space-y-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <LayoutTemplate className="w-4 h-4 text-rose-400" />
                                    <span className="font-bold text-white text-sm">
                                      {event.theme?.title || event.theme?.name || event.themeId}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      Recipient: <strong className="text-slate-200">{customData.recipientName || "My Love"}</strong>
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <a
                                      href={`/p/${event.slug}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      /p/{event.slug}
                                    </a>
                                  </div>
                                </div>

                                {event.buyerEmail && (
                                  <p className="text-xs text-emerald-400">
                                    Buyer Email: <strong>{event.buyerEmail}</strong>
                                    {event.buyerPhone && ` | Phone: ${event.buyerPhone}`}
                                  </p>
                                )}

                                {(customData.loveMessage || customData.apologyNote) && (
                                  <p className="text-xs text-slate-300 italic">
                                    "{customData.loveMessage || customData.apologyNote}"
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

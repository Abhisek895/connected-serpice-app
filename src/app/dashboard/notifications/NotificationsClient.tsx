"use client";

import { useState } from "react";
import { Bell, Heart, Eye, Sparkles, Check, Trash2, ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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

interface NotificationItem {
  id: string;
  eventId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "view" | "response" | "system";
  href: string;
  icon: any;
  color: string;
}

export default function NotificationsClient({ events }: { events: EventItem[] }) {
  // Build real notifications dynamically from the user's database events
  const generateInitialNotifications = (): NotificationItem[] => {
    const list: NotificationItem[] = [];

    events.forEach((event) => {
      let customData = { title: "" };
      try {
        customData = event.customData ? JSON.parse(event.customData) : {};
      } catch (e) {}

      const eventTitle = customData.title || `Proposal for ${event.theme.name}`;
      const viewedResponses = event.responses.filter(r => r.action === "VIEWED");

      // Strictly ONLY "Your crush opened the proposal 👀" Notification
      if (viewedResponses.length > 0) {
        const latestViewed = viewedResponses[0];
        list.push({
          id: `viewed-${event.id}-${latestViewed.id}`,
          eventId: event.id,
          title: "Your crush opened the proposal 👀",
          message: `Someone just opened your proposal link "${eventTitle}" from a mobile device. Click to see their reaction in real-time!`,
          time: new Date(latestViewed.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          type: "view",
          href: `/dashboard/analytics/${event.id}`,
          icon: Eye,
          color: "text-purple-600 bg-purple-100",
        });
      } else {
        // Show active proposal view tracker link
        list.push({
          id: `viewed-${event.id}`,
          eventId: event.id,
          title: "Your crush opened the proposal 👀",
          message: `Proposal link "${eventTitle}" is live! Click to view real-time reaction log and answers.`,
          time: new Date(event.createdAt).toLocaleDateString(),
          read: false,
          type: "view",
          href: `/dashboard/analytics/${event.id}`,
          icon: Eye,
          color: "text-rose-500 bg-rose-100",
        });
      }
    });

    // Fallback if user has no events created yet
    if (list.length === 0) {
      const firstEventId = events[0]?.id || "cmsk5bqgw00017217uhdu9t5v";
      list.push({
        id: "default-1",
        eventId: firstEventId,
        title: "Your crush opened the proposal 👀",
        message: "Someone just opened your proposal link from a mobile device. Click to see their reaction in real-time!",
        time: "Just now",
        read: false,
        type: "view",
        href: `/dashboard/analytics/${firstEventId}`,
        icon: Eye,
        color: "text-rose-500 bg-rose-100",
      });
    }

    return list;
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>(generateInitialNotifications());

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-xs py-0.5 px-2.5 rounded-full font-bold shadow-sm">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Click any notification to view detailed analytics for that event.</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="self-start sm:self-auto text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-xs"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No notifications yet</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm">
              When people view or interact with your surprises, you'll see real-time updates here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <AnimatePresence>
              {notifications.map((notif) => {
                const Icon = notif.icon;
                return (
                  <motion.div 
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    className={`p-4 sm:p-6 flex items-start gap-3 sm:gap-5 group relative transition-colors ${
                      notif.read ? 'bg-white' : 'bg-gradient-to-r from-rose-50/70 via-pink-50/40 to-purple-50/30'
                    }`}
                  >
                    {!notif.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-r-full" />
                    )}
                    
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${notif.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <Link 
                      href={notif.href} 
                      onClick={() => markAsRead(notif.id)}
                      className="flex-1 min-w-0 block hover:opacity-90 transition-opacity"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h3 className={`text-sm sm:text-base font-bold truncate flex items-center gap-2 ${
                          notif.read ? 'text-slate-800' : 'bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent'
                        }`}>
                          {notif.title}
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </h3>
                        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                          {notif.time}
                        </span>
                      </div>
                      <p className={`text-xs sm:text-sm leading-relaxed ${notif.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                        {notif.message}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-500 group-hover:underline">
                        <span>View Analytics & Event Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      {!notif.read && (
                        <button 
                          onClick={() => markAsRead(notif.id)}
                          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 shadow-xs transition-all"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notif.id)}
                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 shadow-xs transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

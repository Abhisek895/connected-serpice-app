"use client";

import { useState } from "react";
import { Bell, Heart, Eye, Sparkles, Check, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type NotificationType = "view" | "response" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: any;
  color: string;
  href?: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "view",
    title: "Your crush opened the link! 👀",
    message: "Someone just opened your surprise link from a mobile device. Check your analytics to see their reaction in real-time!",
    time: "Just now",
    read: false,
    icon: Eye,
    color: "text-rose-500 bg-rose-100",
    href: "/dashboard/analytics/cmsk5bqgw00017217uhdu9t5v",
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

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
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard"
          className="p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs py-0.5 px-2 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Stay updated on your surprises and responses.</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="ml-auto text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No notifications yet</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm">
              When people view or interact with your surprises, you'll see the updates here.
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
                    className={`p-5 md:p-6 flex gap-4 md:gap-5 group relative transition-colors ${notif.read ? 'bg-white' : 'bg-gradient-to-r from-rose-50 via-pink-50/50 to-purple-50/40'}`}
                  >
                    {!notif.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                    )}
                    
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    {notif.href ? (
                      <Link href={notif.href} className="flex-1 min-w-0 block hover:opacity-80 transition-opacity">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                          <h3 className={`text-base font-bold truncate ${notif.read ? 'text-slate-700' : 'bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent'}`}>
                            {notif.title}
                          </h3>
                          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                            {notif.time}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${notif.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                          {notif.message}
                        </p>
                      </Link>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                          <h3 className={`text-base font-bold truncate ${notif.read ? 'text-slate-700' : 'bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent'}`}>
                            {notif.title}
                          </h3>
                          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                            {notif.time}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${notif.read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
                          {notif.message}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.read && (
                        <button 
                          onClick={() => markAsRead(notif.id)}
                          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all tooltip"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notif.id)}
                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 shadow-sm transition-all tooltip"
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
